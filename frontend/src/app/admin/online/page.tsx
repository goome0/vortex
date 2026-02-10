'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, Button, Input, Badge, Alert } from '@/components/ui';
import { adminApi, getErrorMessage } from '@/lib/api';
import {
  Monitor,
  Search,
  RefreshCw,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';

interface OnlineTarget {
  name: string;
  type: 'account' | 'character';
}

interface OnlineResult {
  name: string;
  type: string;
  online: boolean;
}

export default function AdminOnlinePage() {
  const [targets, setTargets] = useState<OnlineTarget[]>([]);
  const [results, setResults] = useState<OnlineResult[]>([]);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'account' | 'character'>('account');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasChecked, setHasChecked] = useState(false);

  const handleAddTarget = () => {
    if (!newName.trim()) return;
    if (targets.some((t) => t.name === newName.trim() && t.type === newType)) return;
    setTargets([...targets, { name: newName.trim(), type: newType }]);
    setNewName('');
  };

  const handleRemoveTarget = (index: number) => {
    setTargets(targets.filter((_, i) => i !== index));
  };

  const handleCheckOnline = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data: response } = await adminApi.getOnline(targets.length > 0 ? targets : []);
      setResults(response.data?.results || response.data || []);
      setHasChecked(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckAll = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data: response } = await adminApi.getOnline([]);
      setResults(response.data?.results || response.data || []);
      setHasChecked(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const onlineCount = results.filter((r) => r.online).length;

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
            <Monitor className="w-7 h-7 text-green-400" />
            Online Players
          </h1>
          <p className="text-slate-400 mt-1">
            Check which players or accounts are currently online
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleCheckAll}>
            <Users className="w-4 h-4" />
            Check All
          </Button>
        </div>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Alert variant="error" dismissible onDismiss={() => setError('')}>
              {error}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Targets */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="glow" className="h-full">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-slate-400" />
                Check Specific Players
              </h3>

              <div className="flex gap-3 mb-4">
                <div className="flex-grow">
                  <Input
                    placeholder="Enter name..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTarget()}
                  />
                </div>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as 'account' | 'character')}
                  className="px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700/50 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="account">Account</option>
                  <option value="character">Character</option>
                </select>
                <Button onClick={handleAddTarget} disabled={!newName.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Target List */}
              <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                {targets.map((target, index) => (
                  <motion.div
                    key={`${target.name}-${target.type}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="info" size="sm">{target.type}</Badge>
                      <span className="text-white font-medium">{target.name}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveTarget(index)}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
                {targets.length === 0 && (
                  <p className="text-center text-slate-500 py-4 text-sm">
                    Add players to check, or use &quot;Check All&quot; to see all online players
                  </p>
                )}
              </div>

              <Button
                className="w-full"
                onClick={handleCheckOnline}
                disabled={targets.length === 0}
                isLoading={isLoading}
              >
                <RefreshCw className="w-4 h-4" />
                Check Status ({targets.length} target{targets.length !== 1 ? 's' : ''})
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-400" />
                  Results
                </h3>
                {hasChecked && (
                  <Badge variant="success">
                    {onlineCount} Online
                  </Badge>
                )}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                </div>
              ) : !hasChecked ? (
                <div className="text-center py-12">
                  <Monitor className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Run a check to see results</p>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No results found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {results.map((result, index) => (
                    <motion.div
                      key={`${result.name}-${index}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        result.online
                          ? 'bg-green-500/5 border-green-500/20'
                          : 'bg-slate-800/30 border-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {result.online ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-slate-500" />
                        )}
                        <div>
                          <p className="font-medium text-white">{result.name}</p>
                          <p className="text-xs text-slate-500">{result.type}</p>
                        </div>
                      </div>
                      <Badge variant={result.online ? 'success' : 'default'} size="sm">
                        {result.online ? 'Online' : 'Offline'}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
