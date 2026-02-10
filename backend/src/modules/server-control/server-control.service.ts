import { ErrorResponse } from '@/common/responses/error-response';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { execFile } from 'node:child_process';
import { ServerControlAction, ServerControlRunResult, ServerControlTarget } from './server-control.types';

type ExecResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

@Injectable()
export class ServerControlService {
  private readonly logger = new Logger(ServerControlService.name);

  private parseTargets(): readonly ServerControlTarget[] {
    const raw = process.env.SERVER_CONTROL_TARGETS;
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      throw ErrorResponse.toHttpException({
        message: 'SERVER_CONTROL_TARGETS must be a JSON array',
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'SERVER_CONTROL_BAD_CONFIG',
      });
    }

    const safe = parsed
      .filter((t): t is { id?: unknown; label?: unknown; commands?: unknown } => typeof t === 'object' && t !== null)
      .map((t) => {
        const id = typeof t.id === 'string' ? t.id : '';
        const label = typeof t.label === 'string' ? t.label : id;
        const commandsRaw = t.commands;
        const commands =
          typeof commandsRaw === 'object' && commandsRaw !== null
            ? (commandsRaw as Partial<Record<ServerControlAction, unknown>>)
            : {};

        const normalize = (v: unknown): readonly string[] | undefined => (Array.isArray(v) && v.every((x) => typeof x === 'string') ? v : undefined);

        return {
          id,
          label,
          commands: {
            status: normalize(commands.status),
            start: normalize(commands.start),
            stop: normalize(commands.stop),
            restart: normalize(commands.restart),
          },
        } satisfies ServerControlTarget;
      })
      .filter((t) => t.id.length > 0);

    return safe;
  }

  public getTargets() {
    return this.parseTargets();
  }

  private pickCommandOrThrow(targetId: string, action: ServerControlAction): readonly string[] {
    const target = this.parseTargets().find((t) => t.id === targetId);
    if (!target) {
      throw ErrorResponse.toHttpException({
        message: 'Unknown target',
        statusCode: HttpStatus.NOT_FOUND,
        code: 'SERVER_CONTROL_TARGET_NOT_FOUND',
      });
    }

    const cmd = target.commands[action];
    if (!cmd || cmd.length === 0) {
      throw ErrorResponse.toHttpException({
        message: `Action not configured for target: ${action}`,
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'SERVER_CONTROL_ACTION_NOT_CONFIGURED',
      });
    }

    return cmd;
  }

  private execCommand(command: readonly string[], timeoutMs = 30000): Promise<ExecResult> {
    const file = command[0];
    const args = command.slice(1);

    return new Promise((resolve, reject) => {
      const child = execFile(file, args, { timeout: timeoutMs, windowsHide: true, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        const out = typeof stdout === 'string' ? stdout : String(stdout);
        const err = typeof stderr === 'string' ? stderr : String(stderr);

        if (error) {
          const exitCode = typeof (error as { code?: unknown }).code === 'number' ? (error as { code: number }).code : 1;
          reject({ exitCode, stdout: out, stderr: err });
          return;
        }

        resolve({ exitCode: 0, stdout: out, stderr: err });
      });

      child.on('error', (e) => {
        reject({ exitCode: 1, stdout: '', stderr: e instanceof Error ? e.message : String(e) });
      });
    });
  }

  private trimOutput(s: string, max = 8000): string {
    if (s.length <= max) return s;
    return s.slice(0, max) + '\n...[truncated]';
  }

  public async run(targetId: string, action: ServerControlAction, dryRun: boolean): Promise<ServerControlRunResult> {
    const started = Date.now();
    const startedAt = new Date(started).toISOString();
    const command = this.pickCommandOrThrow(targetId, action);

    if (dryRun) {
      const finishedAt = new Date().toISOString();
      return {
        targetId,
        action,
        dryRun: true,
        command,
        startedAt,
        finishedAt,
        durationMs: Date.now() - started,
      };
    }

    this.logger.warn(`Server control executing action=${action} target=${targetId}`);

    try {
      const result = await this.execCommand(command);
      const finishedAt = new Date().toISOString();
      return {
        targetId,
        action,
        dryRun: false,
        command,
        exitCode: result.exitCode,
        stdout: this.trimOutput(result.stdout),
        stderr: this.trimOutput(result.stderr),
        startedAt,
        finishedAt,
        durationMs: Date.now() - started,
      };
    } catch (e: unknown) {
      const err = typeof e === 'object' && e !== null ? (e as Partial<ExecResult>) : {};
      const finishedAt = new Date().toISOString();
      return {
        targetId,
        action,
        dryRun: false,
        command,
        exitCode: typeof err.exitCode === 'number' ? err.exitCode : 1,
        stdout: this.trimOutput(typeof err.stdout === 'string' ? err.stdout : ''),
        stderr: this.trimOutput(typeof err.stderr === 'string' ? err.stderr : String(e)),
        startedAt,
        finishedAt,
        durationMs: Date.now() - started,
      };
    }
  }
}

