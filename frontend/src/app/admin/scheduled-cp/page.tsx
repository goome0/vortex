'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi, getErrorMessage } from '@/lib/api';
import { Alert, Badge, Button, Input, LoadingSpinner } from '@/components/atoms';
import { Card, CardContent, DateTimePicker } from '@/components/molecules';
import { parseLocalDatetimeValueToMs, toLocalDatetimeValue } from '@/lib/utils';
import { CalendarClock, Coins, Plus, RefreshCw, User, Users, X, XCircle, Pencil, Save } from 'lucide-react';
import { AccountPickerModal } from '@/components/organisms';

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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const [editRow, setEditRow] = useState<ScheduledCpGrant | null>(null);
  const [editAmount, setEditAmount] = useState('0');
  const [editScheduledAtLocal, setEditScheduledAtLocal] = useState('');
  const [editReason, setEditReason] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createUsername, setCreateUsername] = useState('');
  const [createAmount, setCreateAmount] = useState('100');
  const [createScheduledAtLocal, setCreateScheduledAtLocal] = useState(() =>
    toLocalDatetimeValue(new Date(Date.now() + 5 * 60 * 1000)),
  );
  const [createReason, setCreateReason] = useState('');
  const [showUserPicker, setShowUserPicker] = useState(false);

  const load = useCallback(async () => {
    setError('');
    setIsLoading(true);
    try {
      const filter: { username?: string; status?: string } = {};
      if (username.trim()) filter.username = username.trim().toLowerCase();
      if (status !== 'ALL') filter.status = status;
      const { data: response } = await adminApi.listScheduledCp({ ...filter, page, limit });
      const nextItems = (response.data?.items ?? []) as ScheduledCpGrant[];
      setItems(nextItems);
      setTotal((response.data?.total ?? nextItems.length) as number);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  }, [status, username, page, limit]);

  useEffect(() => {
    const t = setTimeout(() => {
      load();
    }, 250);
    return () => clearTimeout(t);
  }, [load]);

  const visible = useMemo(() => items, [items]);
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  useEffect(() => {
    setPage(1);
  }, [username, status, limit]);

  const cancel = async (id: string) => {
    if (!confirm('Cancel this scheduled COMP Credits grant?')) return;
    setActionLoading(true);
    setError('');
    try {
      await adminApi.cancelScheduledCp(id);
      setSuccessMessage('Scheduled COMP Credits grant cancelled.');
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

  const openCreateModal = () => {
    setCreateUsername('');
    setCreateAmount('100');
    setCreateScheduledAtLocal(toLocalDatetimeValue(new Date(Date.now() + 5 * 60 * 1000)));
    setCreateReason('');
    setShowCreateModal(true);
  };

  const createScheduledCp = async () => {
    const amount = parseInt(createAmount, 10);
    const scheduledAtMs = createScheduledAtLocal ? (parseLocalDatetimeValueToMs(createScheduledAtLocal) ?? NaN) : NaN;

    const usernames = createUsername
      .split(/[\n,;\t ]+/)
      .map((u) => u.trim().toLowerCase())
      .filter(Boolean);
    const uniqueUsernames = Array.from(new Set(usernames));

    if (uniqueUsernames.length === 0) {
      setError('Username is required');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('COMP Credits amount must be a positive number');
      return;
    }
    if (!Number.isFinite(scheduledAtMs)) {
      setError('Please choose a valid schedule date/time');
      return;
    }

    setActionLoading(true);
    setError('');
    try {
      for (const u of uniqueUsernames) {
        await adminApi.scheduleCp(u, amount, scheduledAtMs, createReason.trim() || undefined);
      }
      setSuccessMessage(
        uniqueUsernames.length === 1
          ? `Scheduled ${amount.toLocaleString()} COMP Credits for ${uniqueUsernames[0]}.`
          : `Scheduled ${amount.toLocaleString()} COMP Credits for ${uniqueUsernames.length} users.`,
      );
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowCreateModal(false);
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  const saveEdit = async () => {
    if (!editRow) return;
    const amount = parseInt(editAmount, 10);
    const scheduledAtMs = editScheduledAtLocal ? (parseLocalDatetimeValueToMs(editScheduledAtLocal) ?? NaN) : NaN;

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('COMP Credits amount must be a positive number');
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
      setSuccessMessage('Scheduled COMP Credits grant updated.');
      setTimeout(() => setSuccessMessage(''), 3000);
      setEditRow(null);
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading && items.length === 0) {
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
            Scheduled COMP Credits
          </h1>
          <p className="text-slate-400 mt-1">Monitor and cancel pending COMP Credits grants scheduled by GMs.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openCreateModal} disabled={actionLoading}>
            <Plus className="w-4 h-4" />
            Schedule CP
          </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Items per page</label>
              <select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value, 10) || 25)}
                className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
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
              Total <span className="text-white font-medium">{total}</span> â€¢ Page {page}/{totalPages}
            </p>
          </div>

          {visible.length === 0 ? (
            <div className="text-center py-12">
              <CalendarClock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No scheduled COMP Credits grants found</p>
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

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
            >
              Prev
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => {
                  setShowCreateModal(false);
                  setShowUserPicker(false);
                }}
              />
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <h3 className="text-xl font-bold text-white">Schedule COMP Credits</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowUserPicker(false);
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  disabled={actionLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="block text-sm font-medium text-slate-300">Username</label>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowUserPicker(true)}
                      disabled={actionLoading}
                    >
                      <Users className="w-4 h-4" />
                      Select user(s)
                    </Button>
                  </div>
                  <Input
                    placeholder="Select user(s) via button above"
                    value={createUsername}
                    readOnly
                    icon={<User className="w-5 h-5" />}
                    disabled={actionLoading}
                    className="cursor-default"
                  />
                </div>

                <Input
                  label="COMP Credits Amount"
                  type="number"
                  value={createAmount}
                  onChange={(e) => setCreateAmount(e.target.value)}
                  disabled={actionLoading}
                />

                <DateTimePicker
                  label="Send at"
                  value={createScheduledAtLocal}
                  onChange={setCreateScheduledAtLocal}
                  disabled={actionLoading}
                  minuteStep={1}
                />

                <Input
                  label="Reason (optional)"
                  placeholder="e.g. Event reward"
                  value={createReason}
                  onChange={(e) => setCreateReason(e.target.value)}
                  disabled={actionLoading}
                />
              </div>

              <div className="flex items-center gap-3 p-6 border-t border-slate-800 bg-slate-800/30">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowUserPicker(false);
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={createScheduledCp} isLoading={actionLoading}>
                  <Plus className="w-4 h-4" />
                  Schedule
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  <h3 className="text-xl font-bold text-white">Edit Scheduled COMP Credits</h3>
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
                  label="COMP Credits Amount"
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  disabled={actionLoading}
                />

                <DateTimePicker
                  label="Send at"
                  value={editScheduledAtLocal}
                  onChange={setEditScheduledAtLocal}
                  disabled={actionLoading}
                  minuteStep={1}
                />

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

      <AccountPickerModal
        open={showUserPicker}
        initialSelectedUsernames={createUsername
          .split(/[\n,;\t ]+/)
          .map((u) => u.trim().toLowerCase())
          .filter(Boolean)}
        title="Select user(s) for schedule"
        onClose={() => setShowUserPicker(false)}
        onApply={(usernames) => {
          setCreateUsername(usernames.join(', '));
          setShowUserPicker(false);
        }}
      />
    </div>
  );
}
