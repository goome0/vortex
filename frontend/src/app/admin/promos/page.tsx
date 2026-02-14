'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, Button, Input, Badge, Alert, LoadingSpinner, DateTimePicker } from '@/components/ui';
import { adminApi, getErrorMessage } from '@/lib/api';
import { parseLocalDatetimeValueToMs, toLocalDatetimeValue } from '@/lib/utils';
import {
  Gift,
  Plus,
  Search,
  Copy,
  Trash2,
  Calendar,
  Check,
  X,
  RefreshCw,
  Info,
  AlertTriangle,
} from 'lucide-react';

interface Promo {
  code: string;
  startTime: number;
  endTime: number;
  useLimit: number;
  limitType: string;
  items: number[];
}

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<Array<Promo & {
    status?: 'scheduled' | 'active' | 'expired';
    variants?: number;
    exchangesTotal?: number;
    lastExchangeAtSec?: number;
  }>>([]);
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(() => new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [cloningFrom, setCloningFrom] = useState<string | null>(null);

  // Create form state
  const [newPromo, setNewPromo] = useState({
    code: '',
    startTime: '',
    endTime: '',
    useLimit: '1',
    limitType: 'account',
    items: '',
  });

  const fetchPromos = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data: response } = await adminApi.getPromoInsights({
        q: searchQuery.trim() || undefined,
        page,
        limit,
      });
      const items = (response.data?.items ?? []) as typeof promos;
      const nextTotal = (response.data?.total ?? items.length) as number;
      setPromos(items);
      setTotal(nextTotal);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, page, limit]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchPromos();
    }, 250);
    return () => clearTimeout(t);
  }, [fetchPromos]);

  const filteredPromos = promos;
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));
  const codesOnPage = filteredPromos.map((p) => p.code);
  const selectedCount = selectedCodes.size;
  const allOnPageSelected = codesOnPage.length > 0 && codesOnPage.every((c) => selectedCodes.has(c));

  useEffect(() => {
    setPage(1);
  }, [searchQuery, limit]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const normalizeCode = (code: string) => code.trim().toUpperCase();

  const existingCodes = new Set(promos.map((p) => normalizeCode(p.code)));
  const isDuplicateCode = !!normalizeCode(newPromo.code) && existingCodes.has(normalizeCode(newPromo.code));

  const openCreatePromo = () => {
    const now = Date.now();
    setCloningFrom(null);
    setNewPromo({
      code: '',
      startTime: toLocalDatetimeValue(new Date(now)),
      endTime: toLocalDatetimeValue(new Date(now + 86400 * 30 * 1000)),
      useLimit: '1',
      limitType: 'account',
      items: '',
    });
    setIsCreating(true);
  };

  const handleClonePromo = (promo: Promo) => {
    const now = Date.now();
    setCloningFrom(promo.code);
    setIsCreating(true);
    setNewPromo({
      code: `${normalizeCode(promo.code)}_COPY`,
      startTime: toLocalDatetimeValue(new Date(now)),
      endTime: toLocalDatetimeValue(new Date(now + 86400 * 30 * 1000)),
      useLimit: String(promo.useLimit ?? 1),
      limitType: promo.limitType || 'account',
      items: (promo.items ?? []).join(', '),
    });
  };

  const handleCreatePromo = async () => {
    if (!newPromo.code) return;

    try {
      if (isDuplicateCode) {
        throw new Error('Promo code already exists. Choose a unique code.');
      }

      // Parse items from comma-separated string
      const items = newPromo.items
        ? newPromo.items.split(',').map((s) => parseInt(s.trim())).filter((n) => !isNaN(n))
        : [];

      const startMs = newPromo.startTime ? parseLocalDatetimeValueToMs(newPromo.startTime) : null;
      const endMs = newPromo.endTime ? parseLocalDatetimeValueToMs(newPromo.endTime) : null;
      if (newPromo.startTime && !startMs) throw new Error('Invalid start time.');
      if (newPromo.endTime && !endMs) throw new Error('Invalid end time.');

      await adminApi.createPromo({
        code: normalizeCode(newPromo.code),
        startTime: startMs ? Math.floor(startMs / 1000) : Math.floor(Date.now() / 1000),
        endTime: endMs ? Math.floor(endMs / 1000) : Math.floor(Date.now() / 1000) + 86400 * 30,
        useLimit: parseInt(newPromo.useLimit) || 1,
        limitType: newPromo.limitType,
        items,
      });

      setNewPromo({ code: '', startTime: '', endTime: '', useLimit: '1', limitType: 'account', items: '' });
      setIsCreating(false);
      setCloningFrom(null);
      setSuccessMessage('Promo code created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchPromos();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeletePromo = async (code: string) => {
    try {
      const promo = promos.find((p) => p.code === code);
      const variants = promo?.variants ?? 0;
      if (variants > 1) {
        const ok = window.confirm(`This code has ${variants} variants in comp_hack. Deleting will remove ALL of them. Continue?`);
        if (!ok) return;
      }
      await adminApi.deletePromo(code);
      setSelectedCodes((prev) => {
        if (!prev.has(code)) return prev;
        const next = new Set(prev);
        next.delete(code);
        return next;
      });
      setSuccessMessage('Promo deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchPromos();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const toggleSelectCode = (code: string, checked: boolean) => {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (checked) next.add(code);
      else next.delete(code);
      return next;
    });
  };

  const toggleSelectAllOnPage = (checked: boolean) => {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      for (const code of codesOnPage) {
        if (checked) next.add(code);
        else next.delete(code);
      }
      return next;
    });
  };

  const handleDeleteSelectedPromos = async () => {
    const codes = Array.from(selectedCodes);
    if (codes.length === 0) return;

    const ok = window.confirm(`Delete ${codes.length} selected promo code(s)? This removes all variants with those codes.`);
    if (!ok) return;

    try {
      await adminApi.deleteManyPromos(codes);
      setSelectedCodes(new Set());
      setSuccessMessage(`Deleted ${codes.length} promo code(s).`);
      setTimeout(() => setSuccessMessage(''), 3000);
      if (page !== 1) setPage(1);
      else fetchPromos();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteAllPromos = async () => {
    const ok = window.confirm('Delete ALL promo codes? This cannot be undone.');
    if (!ok) return;
    const typed = window.prompt('Type DELETE to confirm deleting ALL promo codes:');
    if (typed !== 'DELETE') return;

    try {
      await adminApi.deleteAllPromos();
      setSelectedCodes(new Set());
      setSuccessMessage('All promo codes deleted.');
      setTimeout(() => setSuccessMessage(''), 3000);
      setPage(1);
      fetchPromos();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const formatTimestamp = (ts: number): string => {
    if (!ts) return 'N/A';
    return new Date(ts * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = (endTime: number): boolean => {
    return endTime > 0 && endTime * 1000 < Date.now();
  };

  const statusBadge = (promo: Promo & { status?: 'scheduled' | 'active' | 'expired' }) => {
    if (promo.status === 'scheduled') return { variant: 'info' as const, label: 'Scheduled' };
    if (promo.status === 'expired') return { variant: 'danger' as const, label: 'Expired' };
    if (isExpired(promo.endTime)) return { variant: 'danger' as const, label: 'Expired' };
    return { variant: 'success' as const, label: 'Active' };
  };

  if (isLoading && promos.length === 0) {
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
            <Gift className="w-7 h-7 text-yellow-400" />
            Promo Codes
          </h1>
          <p className="text-slate-400 mt-1">Create and manage promotional codes</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="secondary"
            onClick={() => {
              if (page === 1) fetchPromos();
              else setPage(1);
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            variant="ghost"
            disabled={selectedCount === 0 || isLoading}
            onClick={handleDeleteSelectedPromos}
            className="text-red-300 hover:text-red-200"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected ({selectedCount})
          </Button>
          <Button
            variant="ghost"
            disabled={isLoading || total === 0}
            onClick={handleDeleteAllPromos}
            className="text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-4 h-4" />
            Delete All
          </Button>
          <Button onClick={openCreatePromo}>
            <Plus className="w-4 h-4" />
            Create Promo
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
      {/* Alerts */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert variant="success" dismissible onDismiss={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert variant="error" dismissible onDismiss={() => setError('')}>
              {error}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card variant="glow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">Create New Promo Code</h3>
                    {cloningFrom && (
                      <p className="text-sm text-slate-400 mt-1">
                        Cloning from <span className="font-mono text-white">{cloningFrom}</span> — use a unique code.
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {isDuplicateCode && (
                  <div className="mb-6">
                    <Alert variant="error" dismissible onDismiss={() => setNewPromo({ ...newPromo, code: '' })}>
                      Promo code already exists. Choose a unique code (comp_hack can create duplicates, but they’re hard to manage).
                    </Alert>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <Input
                    label="Promo Code"
                    placeholder="e.g., SUMMER2026"
                    value={newPromo.code}
                    onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                  />
                  <Input
                    type="number"
                    label="Use Limit"
                    placeholder="e.g., 1"
                    value={newPromo.useLimit}
                    onChange={(e) => setNewPromo({ ...newPromo, useLimit: e.target.value })}
                  />
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Limit Type</label>
                    <select
                      value={newPromo.limitType}
                      onChange={(e) => setNewPromo({ ...newPromo, limitType: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                    >
                      <option value="account">Per Account</option>
                      <option value="character">Per Character</option>
                      <option value="world">Per World</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-2">
                      Use limits are enforced per account (and optionally per character/world) by comp_hack.
                    </p>
                  </div>
                  <DateTimePicker
                    label="Start Time"
                    value={newPromo.startTime}
                    onChange={(v) => setNewPromo({ ...newPromo, startTime: v })}
                    clearable={false}
                  />
                  <DateTimePicker
                    label="End Time"
                    value={newPromo.endTime}
                    onChange={(v) => setNewPromo({ ...newPromo, endTime: v })}
                    clearable={false}
                  />
                  <Input
                    label="Item IDs (comma separated)"
                    placeholder="e.g., 1, 2, 3"
                    value={newPromo.items}
                    onChange={(e) => setNewPromo({ ...newPromo, items: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePromo} disabled={isDuplicateCode}>
                    <Check className="w-4 h-4" />
                    Create Promo
                  </Button>
                </div>
              </CardContent>
            </Card>
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
              placeholder="Search promo codes..."
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

      {/* Promos List */}
      {filteredPromos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="glow">
            <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div className="text-sm text-slate-400">
                Showing <span className="text-white">{filteredPromos.length}</span> of <span className="text-white">{total}</span> • Selected{' '}
                <span className="text-white">{selectedCount}</span>
              </div>
              <div className="text-xs text-slate-500">
                Select rows to bulk delete.
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-800">
                    <th className="py-3 pr-3 w-10">
                      <input
                        type="checkbox"
                        checked={allOnPageSelected}
                        onChange={(e) => toggleSelectAllOnPage(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                        aria-label="Select all on page"
                      />
                    </th>
                    <th className="py-3 pr-3">Code</th>
                    <th className="py-3 pr-3">Status</th>
                    <th className="py-3 pr-3">Start</th>
                    <th className="py-3 pr-3">End</th>
                    <th className="py-3 pr-3 text-right">Use Limit</th>
                    <th className="py-3 pr-3">Limit Type</th>
                    <th className="py-3 pr-3 text-right">Redeems</th>
                    <th className="py-3 pr-3">Items</th>
                    <th className="py-3 pl-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPromos.map((promo) => {
                    const badge = statusBadge(promo);
                    const variants = promo.variants ?? 0;
                    const checked = selectedCodes.has(promo.code);
                    return (
                      <tr key={promo.code} className="border-b border-slate-900/60 hover:bg-slate-900/30">
                        <td className="py-3 pr-3 align-top">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => toggleSelectCode(promo.code, e.target.checked)}
                            className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                            aria-label={`Select ${promo.code}`}
                          />
                        </td>
                        <td className="py-3 pr-3 align-top">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white">{promo.code}</span>
                            <button
                              onClick={() => handleCopyCode(promo.code)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              aria-label={`Copy ${promo.code}`}
                            >
                              {copiedCode === promo.code ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                            {variants > 1 && <Badge variant="warning">{variants} variants</Badge>}
                          </div>
                        </td>
                        <td className="py-3 pr-3 align-top">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                        <td className="py-3 pr-3 align-top text-slate-200">{formatTimestamp(promo.startTime)}</td>
                        <td className="py-3 pr-3 align-top text-slate-200">{formatTimestamp(promo.endTime)}</td>
                        <td className="py-3 pr-3 align-top text-right font-mono text-yellow-300">{promo.useLimit}</td>
                        <td className="py-3 pr-3 align-top">
                          <Badge variant="info">{promo.limitType}</Badge>
                        </td>
                        <td className="py-3 pr-3 align-top text-right font-mono text-xs text-slate-200">
                          {promo.exchangesTotal ?? 0}
                        </td>
                        <td className="py-3 pr-3 align-top">
                          {promo.items && promo.items.length > 0 ? (
                            <span className="font-mono text-xs text-slate-200 max-w-[240px] inline-block truncate">
                              {promo.items.join(', ')}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="py-3 pl-3 align-top">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleClonePromo(promo)}>
                              <Copy className="w-4 h-4" />
                              Clone
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300"
                              onClick={() => handleDeletePromo(promo.code)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {filteredPromos.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Gift className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No promo codes found</p>
        </motion.div>
      )}
        </div>

        <div className="space-y-6">
          <Card variant="glow">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Promo tips</h3>
              </div>

              <div className="space-y-3 text-sm text-slate-300">
                <div>
                  <p className="text-slate-400">Window status</p>
                  <p>
                    Scheduled/Active/Expired is derived from <span className="font-mono text-white">startTime</span> and <span className="font-mono text-white">endTime</span>.
                    In comp_hack, <span className="font-mono text-white">endTime = 0</span> means “no expiry”.
                  </p>
                </div>

                <div>
                  <p className="text-slate-400">Use limit</p>
                  <p>
                    <span className="font-mono text-white">useLimit</span> is enforced per account, optionally scoped per character/world depending on <span className="font-mono text-white">limitType</span>.
                    “Redeems (total)” counts all exchanges across all accounts (useful as a health metric, not a remaining counter).
                  </p>
                </div>

                <div>
                  <p className="text-slate-400">Duplicates</p>
                  <p>
                    comp_hack can store multiple promos with the same code. This panel blocks duplicate codes on create and warns when deleting variants.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <p className="text-sm text-yellow-200">
                  Deleting a promo code removes all variants with that code in the comp_hack database.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
