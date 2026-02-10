export type ServerControlAction = 'status' | 'start' | 'stop' | 'restart';

export interface ServerControlTarget {
  id: string;
  label: string;
  commands: Partial<Record<ServerControlAction, readonly string[]>>;
}

export interface ServerControlRunResult {
  targetId: string;
  action: ServerControlAction;
  dryRun: boolean;
  command?: readonly string[];
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
}

