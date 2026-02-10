'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, Badge, Button, Card, CardContent, Input, LoadingSpinner } from '@/components/ui';
import { serverControlApi, getErrorMessage } from '@/lib/api';
import { Play, Square, RefreshCw, Terminal, Server, ShieldAlert } from 'lucide-react';

type Action = 'status' | 'start' | 'stop' | 'restart';

interface Target {
  id: string;
  label: string;
  commands?: Partial<Record<Action, readonly string[]>>;
}

interface RunResult {
  targetId: string;
  action: Action;
  dryRun: boolean;
  command?: readonly string[];
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
}

const STORAGE_KEY = 'vortex_server_control_token';

export default function AdminServerControlPage() {
  const [token, setToken] = useState('');
  const [targets, setTargets] = useState<Target[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [dryRun, setDryRun] = useState(true);
  const [reason, setReason] = useState('');
  const [result, setResult] = useState<RunResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setToken(saved);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (token) window.localStorage.setItem(STORAGE_KEY, token);
    } catch {
      // ignore
    }
  }, [token]);

  const canRun = useMemo(() => token.trim().length > 0 && selectedTargetId.trim().length > 0, [token, selectedTargetId]);

  const loadTargets = async () => {
    setIsLoading(true);
    setError('');
    setResult(null);
    try {
      const { data: response } = await serverControlApi.targets(token.trim());
      const list = response?.data?.targets;
      const safe = Array.isArray(list) ? (list as Target[]) : [];
      setTargets(safe);
      if (!selectedTargetId && safe.length > 0) setSelectedTargetId(safe[0].id);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  const run = async (action: Action) => {
    if (!canRun) return;
    setIsLoading(true);
    setError('');
    setResult(null);
    const body = { dryRun, reason: reason.trim() || undefined };
    try {
      const t = token.trim();
      const id = selectedTargetId.trim();
      const call =
        action === 'status'
          ? serverControlApi.status(t, id, body)
          : action === 'start'
            ? serverControlApi.start(t, id, body)
            : action === 'stop'
              ? serverControlApi.stop(t, id, body)
              : serverControlApi.restart(t, id, body);

      const { data: response } = await call;
      setResult((response?.data ?? null) as RunResult | null);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Server className="w-7 h-7 text-cyan-400" />
            Server Control
          </h1>
          <p className="text-slate-400 mt-1">Start/stop/restart allowed targets (admin only).</p>
        </div>
        <Button variant="secondary" onClick={loadTargets} disabled={isLoading || token.trim().length === 0}>
          <RefreshCw className="w-4 h-4" />
          Load targets
        </Button>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            <Alert variant="error" dismissible onDismiss={() => setError('')}>
              {error}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-200">
            <ShieldAlert className="w-4 h-4 text-yellow-400" />
            <p className="text-sm text-slate-400">
              Requires backend env `SERVER_CONTROL_ENABLED=true` and a valid `x-server-control-token`.
            </p>
          </div>

          <Input
            label="Server Control Token"
            placeholder="Paste token here"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Target</label>
              <select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
              >
                {targets.length === 0 && <option value="">(load targets)</option>}
                {targets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} ({t.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Mode</label>
              <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dryRun}
                  onChange={(e) => setDryRun(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                />
                <div>
                  <p className="text-white font-medium">Dry run</p>
                  <p className="text-xs text-slate-500">Don’t execute, only show the command.</p>
                </div>
              </label>
            </div>

            <Input
              label="Reason (optional)"
              placeholder="Audit note"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => run('status')} disabled={!canRun || isLoading}>
              <Terminal className="w-4 h-4" />
              Status
            </Button>
            <Button onClick={() => run('start')} disabled={!canRun || isLoading}>
              <Play className="w-4 h-4" />
              Start
            </Button>
            <Button variant="secondary" onClick={() => run('restart')} disabled={!canRun || isLoading}>
              <RefreshCw className="w-4 h-4" />
              Restart
            </Button>
            <Button variant="danger" onClick={() => run('stop')} disabled={!canRun || isLoading}>
              <Square className="w-4 h-4" />
              Stop
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center py-10">
            <LoadingSpinner size="lg" />
          </motion.div>
        )}
      </AnimatePresence>

      {result && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-white font-semibold truncate">
                  {result.action.toUpperCase()} • {result.targetId}
                </p>
                <p className="text-xs text-slate-500">
                  {result.startedAt} → {result.finishedAt} ({result.durationMs}ms)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={result.dryRun ? 'info' : 'warning'}>
                  {result.dryRun ? 'DRY RUN' : 'EXECUTED'}
                </Badge>
                {typeof result.exitCode === 'number' && (
                  <Badge variant={result.exitCode === 0 ? 'success' : 'danger'}>
                    exit {result.exitCode}
                  </Badge>
                )}
              </div>
            </div>

            {result.command && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-2">Command</p>
                <code className="text-sm text-slate-100 break-all">
                  {result.command.join(' ')}
                </code>
              </div>
            )}

            {(result.stdout || result.stderr) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-2">stdout</p>
                  <pre className="text-xs text-slate-100 whitespace-pre-wrap break-words">{result.stdout || ''}</pre>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-2">stderr</p>
                  <pre className="text-xs text-slate-100 whitespace-pre-wrap break-words">{result.stderr || ''}</pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

