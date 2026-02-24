import { Injectable } from '@nestjs/common';
import net from 'node:net';
import { execFile } from 'node:child_process';

export type ServerStatusState = 'up' | 'warn' | 'down';

export type ServerStatusItem = {
  name: 'Lobby' | 'World' | 'Channel';
  state: ServerStatusState;
  latencyMs: number | null;
  detail?: string;
};

export type ServerStatusResponse = {
  checkedAt: string;
  overall: ServerStatusState;
  items: ServerStatusItem[];
};

type Target = {
  name: ServerStatusItem['name'];
  host?: string;
  port?: number;
  service?: string;
};

function computeOverall(items: ServerStatusItem[]): ServerStatusState {
  if (items.some((i) => i.state === 'down')) return 'down';
  if (items.some((i) => i.state === 'warn')) return 'warn';
  return 'up';
}

function checkTcp(host: string, port: number, timeoutMs: number): Promise<{ ok: boolean; latencyMs: number | null }> {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();
    let done = false;

    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      try {
        socket.destroy();
      } catch {
        // ignore
      }
      resolve({ ok, latencyMs: ok ? Date.now() - start : null });
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));

    socket.connect(port, host);
  });
}

function checkSystemdService(
  service: string,
  timeoutMs: number,
): Promise<{ state: ServerStatusState; detail: string }> {
  const s = service.trim();
  if (!s) return Promise.resolve({ state: 'warn', detail: 'Not configured' });
  if (!/^[a-zA-Z0-9_.@-]+$/.test(s)) return Promise.resolve({ state: 'warn', detail: 'Invalid service name' });

  return new Promise((resolve) => {
    const startedAt = Date.now();
    execFile('systemctl', ['is-active', s], { timeout: timeoutMs }, (err, stdout, stderr) => {
      const out = String(stdout ?? '').trim().toLowerCase();
      const took = Date.now() - startedAt;

      if (err) {
        const e = String(stderr ?? '').trim();
        // systemctl can return non-zero for inactive/failed; treat those as down.
        if (out === 'inactive' || out === 'failed' || out === 'deactivating') {
          return resolve({ state: 'down', detail: out || e || `systemctl error (${took}ms)` });
        }
        return resolve({ state: 'warn', detail: out || e || `systemctl error (${took}ms)` });
      }

      if (out === 'active') return resolve({ state: 'up', detail: 'active' });
      if (out === 'activating' || out === 'reloading') return resolve({ state: 'warn', detail: out });
      if (out === 'inactive' || out === 'failed' || out === 'deactivating') return resolve({ state: 'down', detail: out });
      return resolve({ state: 'warn', detail: out || 'unknown' });
    });
  });
}

function readTarget(name: Target['name']): Target {
  const prefix = `SERVER_STATUS_${name.toUpperCase()}`;
  const host = (process.env[`${prefix}_HOST`] ?? '').trim() || undefined;
  const portRaw = (process.env[`${prefix}_PORT`] ?? '').trim();
  const portNum = portRaw ? Number(portRaw) : NaN;
  const port = Number.isFinite(portNum) && portNum > 0 ? portNum : undefined;

  const defaultServiceName =
    name === 'Lobby' ? 'comp_lobby' : name === 'World' ? 'como_world' : 'comp_channel';
  const service = (process.env[`${prefix}_SERVICE`] ?? defaultServiceName).trim() || undefined;

  return { name, host, port, service };
}

@Injectable()
export class ServerStatusService {
  public async getStatus(): Promise<ServerStatusResponse> {
    const timeoutMs = Math.max(200, Number(process.env.SERVER_STATUS_TIMEOUT_MS ?? 1200) || 1200);

    const targets: Target[] = [readTarget('Lobby'), readTarget('World'), readTarget('Channel')];

    const items = await Promise.all(
      targets.map(async (t): Promise<ServerStatusItem> => {
        const useSystemd = String(process.env.SERVER_STATUS_USE_SYSTEMD ?? 'true').trim().toLowerCase() !== 'false';

        if (useSystemd && t.service) {
          const r = await checkSystemdService(t.service, timeoutMs);
          return {
            name: t.name,
            state: r.state,
            latencyMs: null,
            detail: r.detail,
          };
        }

        if (!t.host || !t.port) {
          return {
            name: t.name,
            state: 'warn',
            latencyMs: null,
            detail: 'Not configured (host/port)',
          };
        }

        const r = await checkTcp(t.host, t.port, timeoutMs);
        return {
          name: t.name,
          state: r.ok ? 'up' : 'down',
          latencyMs: r.latencyMs,
        };
      }),
    );

    return {
      checkedAt: new Date().toISOString(),
      overall: computeOverall(items),
      items,
    };
  }
}
