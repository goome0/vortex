'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi, getErrorMessage } from '@/lib/api';
import { Alert, Badge, Button, Card, CardContent, DateTimePicker, Input, LoadingSpinner } from '@/components/ui';
import { parseLocalDatetimeValueToMs, toLocalDatetimeValue } from '@/lib/utils';
import { Layers, Plus, Trash2, Save, Send, Users, Hash, CalendarClock, RefreshCw } from 'lucide-react';
import { AccountPickerModal } from '@/components/admin/AccountPickerModal';

type Bundle = {
  id: string;
  name: string;
  description: string | null;
  cpCost: number;
  products: number[];
  createdAt: string;
};

type SendBatch = {
  id: string;
  bundleId: string;
  bundleName: string;
  status: string;
  scheduledAt: string;
  completedAt: string | null;
  totalRecipients: number;
  processedCount: number;
  successCount: number;
  failureCount: number;
  reason: string | null;
  lastError: string | null;
  createdAt: string;
};

function parseUsernames(text: string): string[] {
  const raw = text
    .split(/[\n,;\t ]+/g)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set(raw));
}

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [bundlesPage, setBundlesPage] = useState(1);
  const [bundlesLimit, setBundlesLimit] = useState(25);
  const [bundlesTotal, setBundlesTotal] = useState(0);
  const [selectedBundleId, setSelectedBundleId] = useState<string>('');
  const selectedBundle = useMemo(
    () => bundles.find((b) => b.id === selectedBundleId) ?? null,
    [bundles, selectedBundleId],
  );

  // Create / edit
  const [bundleName, setBundleName] = useState('');
  const [bundleDescription, setBundleDescription] = useState('');
  const [bundleCpCost, setBundleCpCost] = useState('0');
  const [productIds, setProductIds] = useState<number[]>([]);
  const [newProductId, setNewProductId] = useState('');

  // Send
  const [sendMode, setSendMode] = useState<'now' | 'schedule'>('now');
  const [sendAtLocal, setSendAtLocal] = useState(() => toLocalDatetimeValue(new Date(Date.now() + 5 * 60 * 1000)));
  const [sendReason, setSendReason] = useState('');
  const [sendUsernamesText, setSendUsernamesText] = useState('');
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [userPickerInitialSelected, setUserPickerInitialSelected] = useState<string[]>([]);

  // batches
  const [batches, setBatches] = useState<SendBatch[]>([]);
  const [batchesPage, setBatchesPage] = useState(1);
  const [batchesLimit, setBatchesLimit] = useState(10);
  const [batchesTotal, setBatchesTotal] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const loadBundles = useCallback(async () => {
    setError('');
    const { data: response } = await adminApi.listBundles({ page: bundlesPage, limit: bundlesLimit });
    const items = (response.data?.items ?? []) as Bundle[];
    setBundles(items);
    setBundlesTotal((response.data?.total ?? items.length) as number);
  }, [bundlesPage, bundlesLimit]);

  const loadBatches = useCallback(async (bundleId?: string) => {
    setError('');
    const { data: response } = await adminApi.listBundleSends(
      bundleId ? { bundleId, page: batchesPage, limit: batchesLimit } : { page: batchesPage, limit: batchesLimit },
    );
    const items = (response.data?.items ?? []) as SendBatch[];
    setBatches(items);
    setBatchesTotal((response.data?.total ?? items.length) as number);
  }, [batchesPage, batchesLimit]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        await loadBundles();
      } catch (e) {
        setError(getErrorMessage(e));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [loadBundles]);

  useEffect(() => {
    if (!selectedBundleId) return;
    loadBatches(selectedBundleId).catch((e) => setError(getErrorMessage(e)));
  }, [selectedBundleId, loadBatches]);

  useEffect(() => {
    setBundlesPage(1);
  }, [bundlesLimit]);

  useEffect(() => {
    setBatchesPage(1);
  }, [selectedBundleId, batchesLimit]);

  const bundlesTotalPages = Math.max(1, Math.ceil((bundlesTotal || 0) / bundlesLimit));
  const batchesTotalPages = Math.max(1, Math.ceil((batchesTotal || 0) / batchesLimit));

  const canCreate = bundleName.trim().length >= 3 && productIds.length > 0;
  const usernames = useMemo(() => parseUsernames(sendUsernamesText), [sendUsernamesText]);
  const canSend = !!selectedBundle && usernames.length > 0;

  const openUserPicker = () => {
    setUserPickerInitialSelected(parseUsernames(sendUsernamesText));
    setShowUserPicker(true);
  };

  const addProduct = () => {
    const id = parseInt(newProductId, 10);
    if (!Number.isFinite(id) || id <= 0) return;
    setProductIds((prev) => Array.from(new Set([...prev, id])));
    setNewProductId('');
  };

  const removeProduct = (id: number) => {
    setProductIds((prev) => prev.filter((x) => x !== id));
  };

  const createBundle = async () => {
    if (!canCreate) return;
    setActionLoading(true);
    setError('');
    try {
      await adminApi.createBundle({
        name: bundleName.trim(),
        description: bundleDescription.trim() || undefined,
        cpCost: parseInt(bundleCpCost, 10) || 0,
        products: productIds,
      });
      setSuccessMessage('Bundle created!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setBundleName('');
      setBundleDescription('');
      setBundleCpCost('0');
      setProductIds([]);
      await loadBundles();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  const deleteBundle = async (id: string) => {
    if (!confirm('Delete this bundle?')) return;
    setActionLoading(true);
    setError('');
    try {
      await adminApi.deleteBundle(id);
      setSuccessMessage('Bundle deleted.');
      setTimeout(() => setSuccessMessage(''), 3000);
      if (selectedBundleId === id) setSelectedBundleId('');
      await loadBundles();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  const scheduleSend = async () => {
    if (!selectedBundle) return;
    setActionLoading(true);
    setError('');
    try {
      const scheduledAtMs =
        sendMode === 'schedule' ? (sendAtLocal ? (parseLocalDatetimeValueToMs(sendAtLocal) ?? undefined) : undefined) : undefined;
      await adminApi.scheduleBundleSend({
        bundleId: selectedBundle.id,
        usernames,
        scheduledAtMs,
        reason: sendReason.trim() || undefined,
      });
      setSuccessMessage(sendMode === 'schedule' ? 'Send scheduled!' : 'Send queued!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setSendUsernamesText('');
      setSendReason('');
      await loadBatches(selectedBundle.id);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  const cancelBatch = async (id: string) => {
    if (!confirm('Cancel this scheduled send?')) return;
    setActionLoading(true);
    setError('');
    try {
      await adminApi.cancelBundleSend(id);
      setSuccessMessage('Send cancelled.');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadBatches(selectedBundle?.id);
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
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <Layers className="w-7 h-7 text-cyan-400" />
          Item Bundles
        </h1>
        <p className="text-slate-400 mt-1">Create bundles, then send to a list now or schedule.</p>
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

      <AccountPickerModal
        open={showUserPicker}
        initialSelectedUsernames={userPickerInitialSelected}
        title="Select users to receive this bundle"
        onClose={() => setShowUserPicker(false)}
        onApply={(picked) => {
          setSendUsernamesText(picked.join('\n'));
          setShowUserPicker(false);
        }}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Create bundle */}
        <Card className="xl:col-span-1">
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-slate-400" />
              Create bundle
            </h3>
            <Input label="Name" placeholder="Ex: Starter Pack" value={bundleName} onChange={(e) => setBundleName(e.target.value)} />
            <Input
              label="Description (optional)"
              placeholder="Ex: Reward for event"
              value={bundleDescription}
              onChange={(e) => setBundleDescription(e.target.value)}
            />
            <Input
              label="COMP Credits Cost (0 = free)"
              type="number"
              value={bundleCpCost}
              onChange={(e) => setBundleCpCost(e.target.value)}
            />

            <div className="flex gap-3">
              <div className="flex-grow">
                <Input
                  type="number"
                  placeholder="Product ID..."
                  value={newProductId}
                  onChange={(e) => setNewProductId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addProduct()}
                  icon={<Hash className="w-5 h-5" />}
                />
              </div>
              <Button onClick={addProduct} disabled={!newProductId}>
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {productIds.map((id) => (
                <span key={id} className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <span className="text-white text-sm font-mono">#{id}</span>
                  <button className="text-red-400 hover:text-red-300" onClick={() => removeProduct(id)} title="Remove">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </span>
              ))}
              {productIds.length === 0 && <p className="text-sm text-slate-500">Add at least 1 product ID.</p>}
            </div>

            <Button className="w-full" onClick={createBundle} disabled={!canCreate} isLoading={actionLoading}>
              <Save className="w-4 h-4" />
              Create
            </Button>
          </CardContent>
        </Card>

        {/* Select + send */}
        <Card className="xl:col-span-2">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-slate-400" />
                Send / Schedule
              </h3>
              <Button variant="secondary" onClick={() => loadBundles().catch((e) => setError(getErrorMessage(e)))} disabled={actionLoading}>
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Bundle</label>
                <select
                  value={selectedBundleId}
                  onChange={(e) => setSelectedBundleId(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600"
                >
                  <option value="">Select bundle...</option>
                  {bundles.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.products?.length ?? 0} items)
                    </option>
                  ))}
                </select>
                {selectedBundle && (
                  <p className="text-xs text-slate-500">
                    COMP Credits cost: <span className="text-yellow-400">{selectedBundle.cpCost}</span> • Items: {selectedBundle.products.length}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Mode</label>
                <div className="flex gap-2">
                  <Button className="flex-1" variant={sendMode === 'now' ? 'secondary' : 'ghost'} onClick={() => setSendMode('now')}>
                    Send now
                  </Button>
                  <Button className="flex-1" variant={sendMode === 'schedule' ? 'secondary' : 'ghost'} onClick={() => setSendMode('schedule')}>
                    <CalendarClock className="w-4 h-4" />
                    Schedule
                  </Button>
                </div>
              </div>
            </div>

            {sendMode === 'schedule' && (
              <DateTimePicker
                label="Send at"
                value={sendAtLocal}
                onChange={setSendAtLocal}
                minuteStep={1}
              />
            )}

             <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  Usernames (one per line / comma-separated)
                </label>
                <Button variant="secondary" size="sm" onClick={openUserPicker} disabled={actionLoading}>
                  <Users className="w-4 h-4" />
                  Select users
                </Button>
              </div>
              <textarea
                rows={6}
                value={sendUsernamesText}
                onChange={(e) => setSendUsernamesText(e.target.value)}
                placeholder={'user1\nuser2\nuser3'}
                className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white placeholder:text-slate-500 transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600"
              />
              <p className="text-xs text-slate-500">Parsed recipients: {usernames.length}</p>
            </div>

            <Input label="Reason (optional)" value={sendReason} onChange={(e) => setSendReason(e.target.value)} />

            <Button className="w-full" onClick={scheduleSend} disabled={!canSend} isLoading={actionLoading}>
              <Send className="w-5 h-5" />
              {sendMode === 'schedule' ? 'Schedule send' : 'Queue send'}
            </Button>

            {selectedBundle && (
              <div className="pt-4 border-t border-slate-800/50 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-slate-300">Recent sends</h4>
                  <div className="flex items-center gap-2">
                    <select
                      value={batchesLimit}
                      onChange={(e) => setBatchesLimit(parseInt(e.target.value, 10) || 10)}
                      className="px-3 py-2 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white text-sm transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600"
                      title="Items per page"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <Button variant="ghost" size="sm" onClick={() => loadBatches(selectedBundle.id).catch((e) => setError(getErrorMessage(e)))}>
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {batches.map((b) => (
                      <div key={b.id} className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant={b.status === 'COMPLETED' ? 'success' : b.status === 'CANCELLED' ? 'danger' : 'info'}>
                              {b.status}
                            </Badge>
                            <span className="text-sm text-white truncate">{new Date(b.scheduledAt).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {b.processedCount}/{b.totalRecipients} processed • ok {b.successCount} • fail {b.failureCount}
                          </p>
                          {b.lastError && <p className="text-xs text-red-400 mt-1 truncate">{b.lastError}</p>}
                        </div>
                        {b.status === 'PENDING' && (
                          <Button variant="danger" size="sm" onClick={() => cancelBatch(b.id)} disabled={actionLoading}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    ))}
                  {batches.length === 0 && (
                    <p className="text-sm text-slate-500">No sends yet for this bundle.</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-slate-500">
                    Total <span className="text-slate-200">{batchesTotal}</span> • Page{' '}
                    <span className="text-slate-200">{batchesPage}</span> of{' '}
                    <span className="text-slate-200">{batchesTotalPages}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setBatchesPage((p) => Math.max(1, p - 1))}
                      disabled={batchesPage <= 1 || isLoading}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setBatchesPage((p) => Math.min(batchesTotalPages, p + 1))}
                      disabled={batchesPage >= batchesTotalPages || isLoading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Existing bundles list */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Bundles</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {bundles.map((b) => (
              <div key={b.id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white font-semibold truncate">{b.name}</p>
                    {b.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{b.description}</p>}
                    <p className="text-xs text-slate-500 mt-2">
                      Items: <span className="text-white">{b.products?.length ?? 0}</span> • COMP: <span className="text-yellow-400">{b.cpCost}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setSelectedBundleId(b.id)}>
                      Select
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => deleteBundle(b.id)} disabled={actionLoading}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {bundles.length === 0 && <p className="text-slate-500">No bundles yet.</p>}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <div className="flex items-center gap-3">
              <p className="text-xs text-slate-500">
                Total <span className="text-slate-200">{bundlesTotal}</span> • Page{' '}
                <span className="text-slate-200">{bundlesPage}</span> of{' '}
                <span className="text-slate-200">{bundlesTotalPages}</span>
              </p>

              <select
                value={bundlesLimit}
                onChange={(e) => setBundlesLimit(parseInt(e.target.value, 10) || 25)}
                className="px-3 py-2 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white text-sm transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600"
                title="Items per page"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setBundlesPage((p) => Math.max(1, p - 1))}
                disabled={bundlesPage <= 1 || isLoading}
              >
                Prev
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setBundlesPage((p) => Math.min(bundlesTotalPages, p + 1))}
                disabled={bundlesPage >= bundlesTotalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
