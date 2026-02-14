'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, Button, Input, Badge, Alert, LoadingSpinner, DateTimePicker } from '@/components/ui';
import { adminApi, getErrorMessage } from '@/lib/api';
import { parseLocalDatetimeValueToMs, toLocalDatetimeValue } from '@/lib/utils';
import {
  Users,
  Search,
  Ban,
  Edit,
  Trash2,
  Mail,
  Shield,
  User,
  X,
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

type AccountCharacter = {
  uid: string;
  name: string | null;
  worldId: number | null;
  killTime: string | null;
  lastLogin: string | null;
  points: number | null;
  lnc: number | null;
  loginPoints: number | null;
};

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineFilter, setOnlineFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnlineLoading, setIsOnlineLoading] = useState(false);
  const [onlineByUsername, setOnlineByUsername] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Character editor modal state
  const [showCharactersModal, setShowCharactersModal] = useState(false);
  const [charactersAccount, setCharactersAccount] = useState<Account | null>(null);
  const [characters, setCharacters] = useState<AccountCharacter[]>([]);
  const [selectedCharacterUid, setSelectedCharacterUid] = useState('');
  const [characterForm, setCharacterForm] = useState({ name: '', points: '', lnc: '', loginPoints: '' });
  const [isCharactersLoading, setIsCharactersLoading] = useState(false);
  const [isCharacterSaving, setIsCharacterSaving] = useState(false);
  const [characterSuccess, setCharacterSuccess] = useState('');
  const [characterError, setCharacterError] = useState('');
  const [onlineByCharacterName, setOnlineByCharacterName] = useState<Record<string, boolean>>({});
  const [isCharacterOnlineLoading, setIsCharacterOnlineLoading] = useState(false);
  const characterSuccessTimeoutRef = useRef<number | null>(null);

  const showCharacterSuccess = useCallback((message: string) => {
    setCharacterSuccess(message);
    if (characterSuccessTimeoutRef.current) {
      window.clearTimeout(characterSuccessTimeoutRef.current);
    }
    characterSuccessTimeoutRef.current = window.setTimeout(() => {
      setCharacterSuccess('');
      characterSuccessTimeoutRef.current = null;
    }, 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (characterSuccessTimeoutRef.current) {
        window.clearTimeout(characterSuccessTimeoutRef.current);
      }
    };
  }, []);

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
      const { data: response } = await adminApi.getAccounts({
        q: searchQuery.trim() || undefined,
        page,
        limit,
      });
      const items = (response.data?.items ?? []) as Account[];
      const total = (response.data?.total ?? items.length) as number;
      setAccounts(items);
      setTotal(total);

      setIsOnlineLoading(true);
      try {
        const targets = items.map((a) => ({ name: a.username, type: 'account' }));
        const { data: onlineResponse } = await adminApi.getOnline(targets);
        const results = (onlineResponse.data?.results || onlineResponse.data || []) as { status?: string; character?: string }[];
        const next: Record<string, boolean> = {};
        targets.forEach((t, i) => {
          next[t.name] = results[i]?.status === 'Online';
        });
        setOnlineByUsername(next);
      } catch {
        setOnlineByUsername({});
      } finally {
        setIsOnlineLoading(false);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, page, limit]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchAccounts();
    }, 250);
    return () => clearTimeout(t);
  }, [fetchAccounts]);

  const filteredAccounts = accounts.filter((a) => {
    if (onlineFilter === 'all') return true;
    const online = onlineByUsername[a.username];
    if (onlineFilter === 'online') return online === true;
    if (onlineFilter === 'offline') return online === false;
    return true;
  });
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  useEffect(() => {
    setPage(1);
  }, [searchQuery, limit]);

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

  const openDisconnectModal = (username: string) => {
    setKickUsername(username);
    setKickLevel('2');
    setShowKickModal(true);
  };

  const openCharactersModal = async (account: Account) => {
    setShowCharactersModal(true);
    setCharactersAccount(account);
    setCharacters([]);
    setSelectedCharacterUid('');
    setCharacterForm({ name: '', points: '', lnc: '', loginPoints: '' });
    setCharacterSuccess('');
    setCharacterError('');
    setOnlineByCharacterName({});

    setIsCharactersLoading(true);
    try {
      const { data: response } = await adminApi.listAccountCharacters(account.username);
      const items = (response.data?.items ?? []) as AccountCharacter[];
      setCharacters(items);
      const first = items[0];
      if (first?.uid) {
        setSelectedCharacterUid(first.uid);
        setCharacterForm({
          name: String(first.name ?? ''),
          points: String(first.points ?? 0),
          lnc: String(first.lnc ?? 0),
          loginPoints: String(first.loginPoints ?? 0),
        });
      }

      // Fetch online status per character (comp_hack API supports type=character with world_id)
      const withNames = items.filter((c) => c.name?.trim());
      if (withNames.length > 0) {
        setIsCharacterOnlineLoading(true);
        try {
          const targets = withNames.map((c) => ({
            name: c.name!,
            type: 'character' as const,
            world_id: c.worldId ?? 0,
          }));
          const { data: onlineResponse } = await adminApi.getOnline(targets);
          const results = (onlineResponse.data?.results || onlineResponse.data || []) as { status?: string; character?: string }[];
          const next: Record<string, boolean> = {};
          targets.forEach((t, i) => {
            next[t.name] = results[i]?.status === 'Online';
          });
          setOnlineByCharacterName(next);
        } catch {
          setOnlineByCharacterName({});
        } finally {
          setIsCharacterOnlineLoading(false);
        }
      }
    } catch (err) {
      setCharacterError(getErrorMessage(err));
    } finally {
      setIsCharactersLoading(false);
    }
  };

  const closeCharactersModal = () => {
    setShowCharactersModal(false);
    setCharactersAccount(null);
    setCharacters([]);
    setSelectedCharacterUid('');
    setCharacterForm({ name: '', points: '', lnc: '', loginPoints: '' });
    setCharacterSuccess('');
    setCharacterError('');
    setOnlineByCharacterName({});
    setIsCharactersLoading(false);
    setIsCharacterSaving(false);
  };

  const selectedCharacter = characters.find((c) => c.uid === selectedCharacterUid) ?? null;
  const isCharacterDead = (() => {
    const n = selectedCharacter?.killTime ? Number(selectedCharacter.killTime) : 0;
    return Number.isFinite(n) && n > 0;
  })();

  const applySelectedCharacterToForm = (uid: string) => {
    setSelectedCharacterUid(uid);
    const c = characters.find((x) => x.uid === uid);
    if (!c) return;
    setCharacterSuccess('');
    setCharacterError('');
    setCharacterForm({
      name: String(c.name ?? ''),
      points: String(c.points ?? 0),
      lnc: String(c.lnc ?? 0),
      loginPoints: String(c.loginPoints ?? 0),
    });
  };

  const saveCharacter = async (opts?: { revive?: boolean }) => {
    const account = charactersAccount;
    if (!account) return;
    if (!selectedCharacterUid) return;

    setIsCharacterSaving(true);
    setCharacterError('');
    try {
      const points = parseInt(characterForm.points, 10);
      const lnc = parseInt(characterForm.lnc, 10);
      const loginPoints = parseInt(characterForm.loginPoints, 10);
      if (!Number.isFinite(points) || points < 0) throw new Error('Points must be a non-negative integer.');
      if (!Number.isFinite(lnc)) throw new Error('LNC must be an integer.');
      if (!Number.isFinite(loginPoints) || loginPoints < 0) throw new Error('Login points must be a non-negative integer.');
      const name = characterForm.name.trim();
      if (name.length < 1 || name.length > 32) throw new Error('Name must be 1–32 characters.');
      if (!/^[A-Za-z0-9_-]+$/.test(name)) throw new Error('Name can only contain letters, numbers, _ and -.');

      const { data: response } = await adminApi.updateAccountCharacter({
        username: account.username,
        characterUid: selectedCharacterUid,
        name,
        points,
        lnc,
        loginPoints,
        ...(opts?.revive ? { revive: true } : {}),
      });

      const updated = response.data as AccountCharacter | undefined;
      if (updated?.uid) {
        setCharacters((prev) => prev.map((c) => (c.uid === updated.uid ? { ...c, ...updated } : c)));
        setCharacterForm({
          name: String(updated.name ?? ''),
          points: String(updated.points ?? 0),
          lnc: String(updated.lnc ?? 0),
          loginPoints: String(updated.loginPoints ?? 0),
        });
      }

      showCharacterSuccess(opts?.revive ? 'Character revived successfully.' : 'Character saved successfully.');
    } catch (err) {
      setCharacterError(getErrorMessage(err));
    } finally {
      setIsCharacterSaving(false);
    }
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
    setScheduleAtLocal(toLocalDatetimeValue(new Date(Date.now() + 5 * 60 * 1000)));
    setShowAddCpModal(true);
  };

  const handleAddCp = async () => {
    const amount = parseInt(addCpAmount, 10);
    const username = selectedAccount?.username;
    if (!username) return;
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('COMP Credits amount must be a positive number');
      return;
    }

    setActionLoading(true);
    try {
      if (addCpMode === 'schedule') {
        const scheduledAtMs = scheduleAtLocal ? (parseLocalDatetimeValueToMs(scheduleAtLocal) ?? NaN) : NaN;
        if (!Number.isFinite(scheduledAtMs)) {
          setError('Please choose a valid schedule date/time');
          return;
        }
        await adminApi.scheduleCp(username, amount, scheduledAtMs, addCpReason.trim() || undefined);
        setSuccessMessage(`Scheduled ${amount.toLocaleString()} COMP Credits for ${username}.`);
      } else {
        const { data: response } = await adminApi.addCp(username, amount, addCpReason.trim() || undefined);
        const newCp = response?.data?.newCp as number | undefined;
        setSuccessMessage(
          `Added ${amount.toLocaleString()} COMP Credits to ${username}${typeof newCp === 'number' ? ` (new balance: ${newCp.toLocaleString()})` : ''}!`
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

  if (isLoading && accounts.length === 0) {
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
            <span className="text-white font-medium">{total}</span> total accounts
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
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>

          <div className="w-full lg:w-48 space-y-1.5">
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

          <div className="w-full lg:w-48 space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Online filter</label>
            <select
              value={onlineFilter}
              onChange={(e) => setOnlineFilter(e.target.value as typeof onlineFilter)}
              disabled={isOnlineLoading}
              className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="all">All</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
          <p className="text-xs text-slate-500">
            Total <span className="text-slate-200">{total}</span> • Page{' '}
            <span className="text-slate-200">{page}</span> of{' '}
            <span className="text-slate-200">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
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
        </div>
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
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">COMP Credits</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Level</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Online</th>
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
                        {onlineByUsername[account.username] === true ? (
                          <Badge variant="success" size="sm">Online</Badge>
                        ) : onlineByUsername[account.username] === false ? (
                          <Badge variant="default" size="sm">Offline</Badge>
                        ) : isOnlineLoading ? (
                          <Badge variant="default" size="sm">…</Badge>
                        ) : (
                          <Badge variant="default" size="sm">—</Badge>
                        )}
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
                            onClick={() => openCharactersModal(account)}
                            title="Edit characters"
                          >
                            <User className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-orange-300 hover:text-orange-200"
                            onClick={() => openDisconnectModal(account.username)}
                            title="Disconnect (force relog)"
                          >
                            <Zap className="w-4 h-4" />
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
                Showing <span className="text-white">{filteredAccounts.length}</span> accounts
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
                          {onlineByUsername[selectedAccount.username] === true ? (
                            <Badge variant="info">Online</Badge>
                          ) : onlineByUsername[selectedAccount.username] === false ? (
                            <Badge variant="default">Offline</Badge>
                          ) : null}
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
                            <p className="text-sm text-yellow-400">COMP Credits</p>
                            <p className="text-xl font-bold text-yellow-400">
                              {selectedAccount.cp?.toLocaleString() || '0'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={openAddCpModal}
                            className="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 hover:text-yellow-200 hover:bg-yellow-500/20 transition-colors"
                            title="Add COMP Credits"
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
                        label="COMP Credits"
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

      {/* Characters Modal */}
      <AnimatePresence>
        {showCharactersModal && charactersAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCharactersModal} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <div>
                  <h3 className="text-xl font-bold text-white">Characters</h3>
                  <p className="text-sm text-slate-400 mt-1">{charactersAccount.username}</p>
                </div>
                <button
                  onClick={closeCharactersModal}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  disabled={isCharactersLoading || isCharacterSaving}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {characterSuccess && (
                  <Alert variant="success" dismissible onDismiss={() => setCharacterSuccess('')}>
                    {characterSuccess}
                  </Alert>
                )}
                {characterError && (
                  <Alert variant="error" dismissible onDismiss={() => setCharacterError('')}>
                    {characterError}
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">Character</label>
                    <select
                      value={selectedCharacterUid}
                      onChange={(e) => applySelectedCharacterToForm(e.target.value)}
                      disabled={isCharactersLoading || characters.length === 0}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {characters.length === 0 ? (
                        <option value="">No characters</option>
                      ) : (
                        characters.map((c) => {
                          const isOnline = c.name ? onlineByCharacterName[c.name] : false;
                          return (
                            <option key={c.uid} value={c.uid}>
                              {c.name || 'Unnamed'} • {c.uid.slice(0, 8)}
                              {isOnline ? ' • Online' : ''}
                            </option>
                          );
                        })
                      )}
                    </select>
                    {selectedCharacter && (
                      <div className="pt-2 space-y-2">
                        <Input
                          label="UUID"
                          value={selectedCharacter.uid}
                          readOnly
                          onFocus={(e) => e.currentTarget.select()}
                          className="font-mono text-sm cursor-text"
                        />
                        <p className="text-xs text-slate-500">
                          World <span className="font-mono text-slate-300">{selectedCharacter.worldId ?? '—'}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">Status</label>
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedCharacter ? (
                        <>
                          <Badge variant={isCharacterDead ? 'danger' : 'success'}>
                            {isCharacterDead ? 'Dead' : 'Alive'}
                          </Badge>
                          {selectedCharacter.name && (
                            isCharacterOnlineLoading ? (
                              <span className="text-xs text-slate-500">Checking online…</span>
                            ) : onlineByCharacterName[selectedCharacter.name] === true ? (
                              <Badge variant="info">Online</Badge>
                            ) : onlineByCharacterName[selectedCharacter.name] === false ? (
                              <Badge variant="default">Offline</Badge>
                            ) : null
                          )}
                        </>
                      ) : (
                        <Badge variant="default">—</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Limited edits: Points, LNC, LoginPoints + revive (KillTime = 0).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input
                    label="Name"
                    value={characterForm.name}
                    onChange={(e) => setCharacterForm({ ...characterForm, name: e.target.value })}
                    disabled={isCharactersLoading || !selectedCharacterUid}
                  />
                  <Input
                    label="Points"
                    type="number"
                    value={characterForm.points}
                    onChange={(e) => setCharacterForm({ ...characterForm, points: e.target.value })}
                    disabled={isCharactersLoading || !selectedCharacterUid}
                  />
                  <Input
                    label="LNC"
                    type="number"
                    value={characterForm.lnc}
                    onChange={(e) => setCharacterForm({ ...characterForm, lnc: e.target.value })}
                    disabled={isCharactersLoading || !selectedCharacterUid}
                  />
                  <Input
                    label="Login Points"
                    type="number"
                    value={characterForm.loginPoints}
                    onChange={(e) => setCharacterForm({ ...characterForm, loginPoints: e.target.value })}
                    disabled={isCharactersLoading || !selectedCharacterUid}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-6 border-t border-slate-800 bg-slate-800/30">
                <Button variant="ghost" className="sm:flex-1" onClick={closeCharactersModal} disabled={isCharacterSaving}>
                  Close
                </Button>
                <Button
                  variant="secondary"
                  className="sm:flex-1"
                  onClick={() => saveCharacter({ revive: true })}
                  disabled={!selectedCharacterUid || !isCharacterDead || isCharactersLoading}
                  isLoading={isCharacterSaving}
                  title="Sets KillTime = 0"
                >
                  Revive
                </Button>
                <Button
                  className="sm:flex-1"
                  onClick={() => saveCharacter()}
                  disabled={!selectedCharacterUid || isCharactersLoading}
                  isLoading={isCharacterSaving}
                >
                  Save
                </Button>
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

      {/* Add COMP Credits Modal */}
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
                  Add COMP Credits
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
                  label="COMP Credits Amount"
                  type="number"
                  placeholder="Ex: 100"
                  autoFocus
                  value={addCpAmount}
                  onChange={(e) => setAddCpAmount(e.target.value)}
                  disabled={actionLoading}
                />

                {addCpMode === 'schedule' && (
                  <DateTimePicker
                    label="Send at"
                    value={scheduleAtLocal}
                    onChange={setScheduleAtLocal}
                    disabled={actionLoading}
                    minuteStep={1}
                  />
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
                  Add COMP Credits
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
