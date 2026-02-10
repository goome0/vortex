'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi, getErrorMessage } from '@/lib/api';
import { Alert, Badge, Button, Card, CardContent, Input, LoadingSpinner } from '@/components/ui';
import { CalendarClock, Coins, RefreshCw, User, X, XCircle, Pencil, Save } from 'lucide-react';

type ScheduledCpStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

type ScheduledCpGrant = {
  id: string;
  username: string;
  amount: number;
  reason: string | null;
  createdByUsername: string;
  status: ScheduledCpStatus;
  scheduledAt: string;
  processedAt: string | null;
  previousCp: number | null;
  newCp: number | null;
  attempts: number;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

function toLocalDatetimeValue(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function statusBadgeVariant(status: ScheduledCpStatus): React.ComponentProps<typeof Badge>['variant'] {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'FAILED':
      return 'danger';
    case 'PROCESSING':
      return 'warning';
    case 'PENDING':
      return 'info';
    case 'CANCELLED':
      return 'default';
    default:
      return 'default';
  }
}

export default function AdminScheduledCpPage() {
  const [items, setItems] = useState<ScheduledCpGrant[]>([]);
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'ALL' | ScheduledCpStatus>('ALL');

  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const [editRow, setEditRow] = useState<ScheduledCpGrant | null>(null);
  const [editAmount, setEditAmount] = useState('0');
  const [editScheduledAtLocal, setEditScheduledAtLocal] = useState('');
  const [editReason, setEditReason] = useState('');

  const load = useCallback(async () => {
    setError('');
    setIsLoading(true);
    try {
      const filter: { username?: string; status?: string } = {};
      if (username.trim()) filter.username = username.trim().toLowerCase();
      if (status !== 'ALL') filter.status = status;
      const { data: response } = await adminApi.listScheduledCp(filter);
      setItems((response.data ?? []) as ScheduledCpGrant[]);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  }, [status, username]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => items, [items]);

  const cancel = async (id: string) => {
    if (!confirm('Cancel this scheduled CP grant?')) return;
    setActionLoading(true);
    setError('');
    try {
      await adminApi.cancelScheduledCp(id);
      setSuccessMessage('Scheduled CP grant cancelled.');
      setTimeout(() => setSuccessMessage(''), 3000);
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = (row: ScheduledCpGrant) => {
    setEditRow(row);
    setEditAmount(String(row.amount ?? 0));
    setEditReason(row.reason ?? '');
    setEditScheduledAtLocal(row.scheduledAt ? toLocalDatetimeValue(new Date(row.scheduledAt)) : toLocalDatetimeValue(new Date(Date.now() + 5 * 60 * 1000)));
  };

  const closeEdit = () => {
    setEditRow(null);
  };

  const saveEdit = async () => {
    if (!editRow) return;
    const amount = parseInt(editAmount, 10);
    const scheduledAtMs = Number.isFinite(Date.parse(editScheduledAtLocal)) ? Date.parse(editScheduledAtLocal) : NaN;

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('CP amount must be a positive number');
      return;
    }
    if (!Number.isFinite(scheduledAtMs)) {
      setError('Please choose a valid schedule date/time');
      return;
    }

    setActionLoading(true);
    setError('');
    try {
      await adminApi.updateScheduledCp({
        id: editRow.id,
        amount,
        scheduledAtMs,
        // Always send reason so user can clear it by submitting empty.
        reason: editReason,
      });
      setSuccessMessage('Scheduled CP grant updated.');
      setTimeout(() => setSuccessMessage(''), 3000);
      setEditRow(null);
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <CalendarClock className="w-7 h-7 text-yellow-400" />
            Scheduled CP
          </h1>
          <p className="text-slate-400 mt-1">Monitor and cancel pending CP grants scheduled by GMs.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={load} disabled={actionLoading}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {successMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Alert variant="success" dismissible onDismiss={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Alert variant="error" dismissible onDismiss={() => setError('')}>
              {error}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Username (optional)"
              placeholder="ex: playername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={<User className="w-5 h-5" />}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ALL' | ScheduledCpStatus)}
                className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600"
              >
                <option value="ALL">All</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button className="w-full" onClick={load} disabled={actionLoading}>
                <RefreshCw className="w-4 h-4" />
                Apply filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-slate-400" />
              Latest grants
            </h3>
            <p className="text-sm text-slate-500">
              Showing <span className="text-white font-medium">{visible.length}</span> (max 200)
            </p>
          </div>

          {visible.length === 0 ? (
            <div className="text-center py-12">
              <CalendarClock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No scheduled CP grants found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">User</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Scheduled</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Reason</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row) => (
                    <tr key={row.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">{row.username}</p>
                          <p className="text-xs text-slate-500 truncate">
                            by {row.createdByUsername} • attempts {row.attempts}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-yellow-400 font-semibold">+{Number(row.amount ?? 0).toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={statusBadgeVariant(row.status)}>{row.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-sm">
                        {row.scheduledAt ? new Date(row.scheduledAt).toLocaleString() : '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-sm">
                        <span className="block max-w-[420px] truncate" title={row.reason ?? ''}>
                          {row.reason || '—'}
                        </span>
                        {row.lastError && (
                          <p className="text-xs text-red-400 mt-1 truncate" title={row.lastError}>
                            {row.lastError}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {row.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="secondary" size="sm" onClick={() => openEdit(row)} disabled={actionLoading}>
                              <Pencil className="w-4 h-4" />
                              Edit
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => cancel(row.id)} disabled={actionLoading}>
                              <XCircle className="w-4 h-4" />
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <AnimatePresence>
        {editRow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeEdit} />
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <div>
                  <h3 className="text-xl font-bold text-white">Edit Scheduled CP</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {editRow.username} • <span className="text-slate-500">id</span> {editRow.id.slice(0, 8)}…
                  </p>
                </div>
                <button
                  onClick={closeEdit}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  disabled={actionLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <Input
                  label="CP Amount"
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  disabled={actionLoading}
                />

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Send at</label>
                  <input
                    type="datetime-local"
                    value={editScheduledAtLocal}
                    onChange={(e) => setEditScheduledAtLocal(e.target.value)}
                    disabled={actionLoading}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white placeholder:text-slate-500 transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600"
                  />
                </div>

                <Input
                  label="Reason (optional)"
                  placeholder="Leave empty to clear"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  disabled={actionLoading}
                />

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Only pending grants can be edited.</span>
                  <Badge variant="info">{editRow.status}</Badge>
                </div>
              </div>

              <div className="flex items-center gap-3 p-6 border-t border-slate-800 bg-slate-800/30">
                <Button variant="ghost" className="flex-1" onClick={closeEdit} disabled={actionLoading}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={saveEdit} isLoading={actionLoading}>
                  <Save className="w-4 h-4" />
                  Save
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

