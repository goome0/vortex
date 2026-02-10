'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, Button, Input, Badge, Alert, LoadingSpinner } from '@/components/ui';
import { adminApi, getErrorMessage } from '@/lib/api';
import {
  Users,
  Search,
  Ban,
  Edit,
  Trash2,
  Mail,
  Shield,
  X,
  Check,
  RefreshCw,
  Zap,
  Save,
  Coins,
  Ticket,
  Plus,
} from 'lucide-react';

interface Account {
  username: string;
  email: string;
  disp_name: string;
  user_level: number;
  cp: number;
  ticket_count: number;
  enabled: boolean;
  last_login: number;
  character_count: number;
}

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Edit form state
  const [editForm, setEditForm] = useState({
    password: '',
    disp_name: '',
    cp: '',
    ticket_count: '',
    user_level: '',
    enabled: true,
  });

  // Kick form state
  const [kickUsername, setKickUsername] = useState('');
  const [kickLevel, setKickLevel] = useState('1');
  const [showKickModal, setShowKickModal] = useState(false);

  // Add CP modal state
  const [showAddCpModal, setShowAddCpModal] = useState(false);
  const [addCpAmount, setAddCpAmount] = useState('100');
  const [addCpReason, setAddCpReason] = useState('');
  const [addCpMode, setAddCpMode] = useState<'now' | 'schedule'>('now');
  const [scheduleAtLocal, setScheduleAtLocal] = useState(''); // datetime-local

  // Prevent subtle layout shifts when modals open/close (scrollbar width).
  useEffect(() => {
    const shouldLock = !!selectedAccount || showKickModal || showAddCpModal;
    if (!shouldLock) return;

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [selectedAccount, showKickModal, showAddCpModal]);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data: response } = await adminApi.getAccounts();
      setAccounts(response.data?.accounts || response.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const filteredAccounts = accounts.filter(
    (account) =>
      account.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewAccount = async (account: Account) => {
    try {
      const { data: response } = await adminApi.getAccount(account.username);
      const detail = response.data || account;
      setSelectedAccount(detail);
      setEditForm({
        password: '',
        disp_name: detail.disp_name || '',
        cp: detail.cp?.toString() || '0',
        ticket_count: detail.ticket_count?.toString() || '0',
        user_level: detail.user_level?.toString() || '0',
        enabled: detail.enabled !== false,
      });
      setIsEditing(false);
    } catch {
      setSelectedAccount(account);
      setIsEditing(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedAccount(null);
    setIsEditing(false);
  };

  const handleUpdateAccount = async () => {
    if (!selectedAccount) return;
    setActionLoading(true);
    try {
      const updateData: Record<string, unknown> = {
        username: selectedAccount.username,
      };
      if (editForm.password) updateData.password = editForm.password;
      if (editForm.disp_name !== selectedAccount.disp_name) updateData.disp_name = editForm.disp_name;
      if (editForm.cp !== selectedAccount.cp?.toString()) updateData.cp = parseInt(editForm.cp);
      if (editForm.ticket_count !== selectedAccount.ticket_count?.toString()) updateData.ticket_count = parseInt(editForm.ticket_count);
      if (editForm.user_level !== selectedAccount.user_level?.toString()) updateData.user_level = parseInt(editForm.user_level);
      if (editForm.enabled !== selectedAccount.enabled) updateData.enabled = editForm.enabled;

      await adminApi.updateAccount(updateData);
      setSuccessMessage(`Account ${selectedAccount.username} updated successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      handleCloseModal();
      fetchAccounts();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccount = async (username: string) => {
    if (!confirm(`Are you sure you want to delete account "${username}"? This cannot be undone!`)) return;
    setActionLoading(true);
    try {
      await adminApi.deleteAccount(username);
      setSuccessMessage(`Account ${username} deleted successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      handleCloseModal();
      fetchAccounts();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleKickPlayer = async () => {
    if (!kickUsername) return;
    setActionLoading(true);
    try {
      await adminApi.kickPlayer(kickUsername, parseInt(kickLevel));
      setSuccessMessage(`Player ${kickUsername} kicked (level ${kickLevel})!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowKickModal(false);
      setKickUsername('');
      setKickLevel('1');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const openAddCpModal = () => {
    setAddCpAmount('100');
    setAddCpReason('');
    setAddCpMode('now');
    // Default schedule: +5 minutes
    const d = new Date(Date.now() + 5 * 60 * 1000);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setScheduleAtLocal(local);
    setShowAddCpModal(true);
  };

  const handleAddCp = async () => {
    const amount = parseInt(addCpAmount, 10);
    const username = selectedAccount?.username;
    if (!username) return;
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('CP amount must be a positive number');
      return;
    }

    setActionLoading(true);
    try {
      if (addCpMode === 'schedule') {
        const scheduledAtMs = Number.isFinite(Date.parse(scheduleAtLocal)) ? Date.parse(scheduleAtLocal) : NaN;
        if (!Number.isFinite(scheduledAtMs)) {
          setError('Please choose a valid schedule date/time');
          return;
        }
        await adminApi.scheduleCp(username, amount, scheduledAtMs, addCpReason.trim() || undefined);
        setSuccessMessage(`Scheduled ${amount.toLocaleString()} CP for ${username}.`);
      } else {
        const { data: response } = await adminApi.addCp(username, amount, addCpReason.trim() || undefined);
        const newCp = response?.data?.newCp as number | undefined;
        setSuccessMessage(
          `Added ${amount.toLocaleString()} CP to ${username}${typeof newCp === 'number' ? ` (new balance: ${newCp.toLocaleString()})` : ''}!`
        );
        if (selectedAccount?.username === username && typeof newCp === 'number') {
          setSelectedAccount({ ...selectedAccount, cp: newCp });
        }
      }
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowAddCpModal(false);
      setAddCpAmount('100');
      setAddCpReason('');
      fetchAccounts();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleEnabled = async (account: Account) => {
    setActionLoading(true);
    try {
      await adminApi.updateAccount({
        username: account.username,
        enabled: !account.enabled,
      });
      setSuccessMessage(`Account ${account.username} ${account.enabled ? 'disabled' : 'enabled'}!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchAccounts();
    } catch (err) {
      setError(getErrorMessage(err));
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-cyan-400" />
            Account Management
          </h1>
          <p className="text-slate-400 mt-1">
            <span className="text-white font-medium">{accounts.length}</span> total accounts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => { setKickUsername(''); setShowKickModal(true); }}>
            <Zap className="w-4 h-4" />
            Kick Player
          </Button>
          <Button variant="secondary" onClick={fetchAccounts}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Alerts */}
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

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Input
          placeholder="Search by username or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-5 h-5" />}
        />
      </motion.div>

      {/* Accounts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">User</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Email</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">CP</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Level</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Status</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((account, index) => (
                    <motion.tr
                      key={account.username}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(index * 0.02, 0.3) }}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white font-bold">
                            {account.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-white">{account.username}</p>
                            {account.user_level >= 1000 && (
                              <Badge variant="warning" size="sm">
                                <Shield className="w-3 h-3" /> Admin
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-300 text-sm">{account.email}</td>
                      <td className="py-4 px-6 text-yellow-400 font-medium">
                        {account.cp?.toLocaleString() || '0'}
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {account.user_level}
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant={account.enabled ? 'success' : 'danger'}
                          pulse={account.enabled}
                        >
                          {account.enabled ? 'Active' : 'Disabled'}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewAccount(account)}
                            title="View/Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-yellow-400 hover:text-yellow-300"
                            onClick={() => handleToggleEnabled(account)}
                            title={account.enabled ? 'Disable' : 'Enable'}
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300"
                            onClick={() => handleDeleteAccount(account.username)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-slate-800/50">
              <p className="text-sm text-slate-400">
                Showing <span className="text-white">{filteredAccounts.length}</span> of{' '}
                <span className="text-white">{accounts.length}</span> accounts
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {filteredAccounts.length === 0 && !isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No accounts found</p>
        </motion.div>
      )}

      {/* Account Detail / Edit Modal */}
      <AnimatePresence>
        {selectedAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleCloseModal}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <h3 className="text-xl font-bold text-white">
                  {isEditing ? 'Edit Account' : 'Account Details'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                {!isEditing ? (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold">
                        {selectedAccount.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white">{selectedAccount.username}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={selectedAccount.enabled ? 'success' : 'danger'}>
                            {selectedAccount.enabled ? 'Active' : 'Disabled'}
                          </Badge>
                          {selectedAccount.user_level >= 1000 && (
                            <Badge variant="warning">Admin</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50">
                        <Mail className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-400">Email</p>
                          <p className="text-white">{selectedAccount.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                          <Coins className="w-5 h-5 text-yellow-400" />
                          <div>
                            <p className="text-sm text-yellow-400">CP</p>
                            <p className="text-xl font-bold text-yellow-400">
                              {selectedAccount.cp?.toLocaleString() || '0'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={openAddCpModal}
                            className="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 hover:text-yellow-200 hover:bg-yellow-500/20 transition-colors"
                            title="Add CP"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                          <Ticket className="w-5 h-5 text-cyan-400" />
                          <div>
                            <p className="text-sm text-cyan-400">Tickets</p>
                            <p className="text-xl font-bold text-cyan-400">
                              {selectedAccount.ticket_count || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50">
                        <Shield className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-400">User Level</p>
                          <p className="text-white">{selectedAccount.user_level}</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <Input
                      label="Display Name"
                      value={editForm.disp_name}
                      onChange={(e) => setEditForm({ ...editForm, disp_name: e.target.value })}
                    />
                    <Input
                      label="New Password (leave blank to keep)"
                      type="password"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="CP"
                        type="number"
                        value={editForm.cp}
                        onChange={(e) => setEditForm({ ...editForm, cp: e.target.value })}
                      />
                      <Input
                        label="Tickets"
                        type="number"
                        value={editForm.ticket_count}
                        onChange={(e) => setEditForm({ ...editForm, ticket_count: e.target.value })}
                      />
                    </div>
                    <Input
                      label="User Level (0-1000)"
                      type="number"
                      value={editForm.user_level}
                      onChange={(e) => setEditForm({ ...editForm, user_level: e.target.value })}
                    />
                    <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.enabled}
                        onChange={(e) => setEditForm({ ...editForm, enabled: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                      />
                      <span className="text-white">Account Enabled</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center gap-3 p-6 border-t border-slate-800 bg-slate-800/30">
                {!isEditing ? (
                  <>
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="w-4 h-4" />
                      Edit Account
                    </Button>
                    <Button
                      variant="danger"
                      className="flex-1"
                      onClick={() => handleDeleteAccount(selectedAccount.username)}
                      disabled={actionLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="flex-1"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleUpdateAccount}
                      isLoading={actionLoading}
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kick Player Modal */}
      <AnimatePresence>
        {showKickModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowKickModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-400" />
                  Kick Player
                </h3>
                <button
                  onClick={() => setShowKickModal(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <Input
                  label="Username"
                  placeholder="Enter username to kick"
                  value={kickUsername}
                  onChange={(e) => setKickUsername(e.target.value)}
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Kick Level</label>
                  <select
                    value={kickLevel}
                    onChange={(e) => setKickLevel(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                  >
                    <option value="1">Level 1 - Soft kick</option>
                    <option value="2">Level 2 - Force disconnect</option>
                    <option value="3">Level 3 - Full session clear</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-6 border-t border-slate-800">
                <Button variant="ghost" className="flex-1" onClick={() => setShowKickModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={handleKickPlayer}
                  isLoading={actionLoading}
                  disabled={!kickUsername}
                >
                  <Zap className="w-4 h-4" />
                  Kick Player
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add CP Modal */}
      <AnimatePresence>
        {showAddCpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAddCpModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  Add CP
                </h3>
                <button
                  onClick={() => setShowAddCpModal(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={addCpMode === 'now' ? 'secondary' : 'ghost'}
                    onClick={() => setAddCpMode('now')}
                    disabled={actionLoading}
                    className="flex-1"
                  >
                    Add now
                  </Button>
                  <Button
                    type="button"
                    variant={addCpMode === 'schedule' ? 'secondary' : 'ghost'}
                    onClick={() => setAddCpMode('schedule')}
                    disabled={actionLoading}
                    className="flex-1"
                  >
                    Schedule
                  </Button>
                </div>

                <Input
                  label="CP Amount"
                  type="number"
                  placeholder="Ex: 100"
                  autoFocus
                  value={addCpAmount}
                  onChange={(e) => setAddCpAmount(e.target.value)}
                  disabled={actionLoading}
                />

                {addCpMode === 'schedule' && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">Send at</label>
                    <input
                      type="datetime-local"
                      value={scheduleAtLocal}
                      onChange={(e) => setScheduleAtLocal(e.target.value)}
                      disabled={actionLoading}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white placeholder:text-slate-500 transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600"
                    />
                  </div>
                )}

                <Input
                  label="Reason (optional)"
                  placeholder="Ex: Event reward"
                  value={addCpReason}
                  onChange={(e) => setAddCpReason(e.target.value)}
                  disabled={actionLoading}
                />
              </div>

              <div className="flex items-center gap-3 p-6 border-t border-slate-800">
                <Button variant="ghost" className="flex-1" onClick={() => setShowAddCpModal(false)} disabled={actionLoading}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAddCp} isLoading={actionLoading} disabled={!selectedAccount?.username}>
                  <Coins className="w-4 h-4" />
                  Add CP
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
