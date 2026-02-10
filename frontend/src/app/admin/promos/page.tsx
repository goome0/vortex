'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, Button, Input, Badge, Alert, LoadingSpinner } from '@/components/ui';
import { adminApi, getErrorMessage } from '@/lib/api';
import {
  Gift,
  Plus,
  Search,
  Copy,
  Trash2,
  Calendar,
  Users,
  Check,
  X,
  RefreshCw,
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
  const [promos, setPromos] = useState<Promo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

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
      const { data: response } = await adminApi.getPromos();
      setPromos(response.data?.promos || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const filteredPromos = promos.filter((promo) =>
    promo.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreatePromo = async () => {
    if (!newPromo.code) return;

    try {
      // Parse items from comma-separated string
      const items = newPromo.items
        ? newPromo.items.split(',').map((s) => parseInt(s.trim())).filter((n) => !isNaN(n))
        : [];

      await adminApi.createPromo({
        code: newPromo.code.toUpperCase(),
        startTime: newPromo.startTime ? Math.floor(new Date(newPromo.startTime).getTime() / 1000) : Math.floor(Date.now() / 1000),
        endTime: newPromo.endTime ? Math.floor(new Date(newPromo.endTime).getTime() / 1000) : Math.floor(Date.now() / 1000) + 86400 * 30,
        useLimit: parseInt(newPromo.useLimit) || 1,
        limitType: newPromo.limitType,
        items,
      });

      setNewPromo({ code: '', startTime: '', endTime: '', useLimit: '1', limitType: 'account', items: '' });
      setIsCreating(false);
      setSuccessMessage('Promo code created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchPromos();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeletePromo = async (code: string) => {
    try {
      await adminApi.deletePromo(code);
      setSuccessMessage('Promo deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
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
            <Gift className="w-7 h-7 text-yellow-400" />
            Promo Codes
          </h1>
          <p className="text-slate-400 mt-1">Create and manage promotional codes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={fetchPromos}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4" />
            Create Promo
          </Button>
        </div>
      </motion.div>

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
                  <h3 className="text-lg font-bold text-white">Create New Promo Code</h3>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
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
                      <option value="global">Global</option>
                    </select>
                  </div>
                  <Input
                    type="datetime-local"
                    label="Start Time"
                    value={newPromo.startTime}
                    onChange={(e) => setNewPromo({ ...newPromo, startTime: e.target.value })}
                  />
                  <Input
                    type="datetime-local"
                    label="End Time"
                    value={newPromo.endTime}
                    onChange={(e) => setNewPromo({ ...newPromo, endTime: e.target.value })}
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
                  <Button onClick={handleCreatePromo}>
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
        <Input
          placeholder="Search promo codes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-5 h-5" />}
        />
      </motion.div>

      {/* Promos Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {filteredPromos.map((promo, index) => {
          const expired = isExpired(promo.endTime);
          return (
            <motion.div
              key={promo.code}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`h-full transition-all duration-300 ${expired ? 'opacity-60' : 'hover:border-yellow-500/30'}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xl font-bold text-white">{promo.code}</p>
                        <button
                          onClick={() => handleCopyCode(promo.code)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          {copiedCode === promo.code ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={expired ? 'danger' : 'success'}>
                          {expired ? 'Expired' : 'Active'}
                        </Badge>
                        <Badge variant="info">{promo.limitType}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Use Limit</p>
                      <p className="text-xl font-bold text-yellow-400">{promo.useLimit}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Start
                      </span>
                      <span className="text-white">{formatTimestamp(promo.startTime)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        End
                      </span>
                      <span className="text-white">{formatTimestamp(promo.endTime)}</span>
                    </div>
                    {promo.items && promo.items.length > 0 && (
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-2">
                          <Gift className="w-4 h-4" />
                          Items
                        </span>
                        <span className="text-white font-mono text-xs">
                          {promo.items.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-slate-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-red-400 hover:text-red-300"
                      onClick={() => handleDeletePromo(promo.code)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

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
  );
}
