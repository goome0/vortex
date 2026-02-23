'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { adminCasesApi, getErrorMessage } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { Alert, Badge, Button, Input, LoadingSpinner } from '@/components/atoms';
import { Card, CardContent } from '@/components/molecules';
import { Search, Ticket, ChevronRight, RefreshCw, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

type CaseStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface CaseListItem {
  id: string;
  createdByUsername: string;
  assignedToUsername: string | null;
  resolvedByUsername: string | null;
  subject: string;
  category: string | null;
  priority: CasePriority;
  status: CaseStatus;
  resolvedAt: string | null;
  closedAt: string | null;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

function statusBadge(status: CaseStatus) {
  switch (status) {
    case 'OPEN':
      return { label: 'Open', variant: 'info' as const };
    case 'IN_PROGRESS':
      return { label: 'In Progress', variant: 'warning' as const };
    case 'RESOLVED':
      return { label: 'Resolved', variant: 'success' as const };
    case 'CLOSED':
      return { label: 'Closed', variant: 'danger' as const };
  }
}

function priorityBadge(priority: CasePriority) {
  switch (priority) {
    case 'LOW':
      return { label: 'Low', variant: 'info' as const };
    case 'MEDIUM':
      return { label: 'Medium', variant: 'warning' as const };
    case 'HIGH':
      return { label: 'High', variant: 'danger' as const };
    case 'URGENT':
      return { label: 'Urgent', variant: 'danger' as const };
  }
}

export default function AdminCasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | CaseStatus>('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  const fetchCases = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data: response } = await adminCasesApi.list({
        q: search.trim() || undefined,
        status: status === 'ALL' ? undefined : status,
        page,
        limit,
      });
      const items = (response?.data?.items ?? []) as CaseListItem[];
      const total = (response?.data?.total ?? items.length) as number;
      setCases(items);
      setTotal(total);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      void fetchCases();
    }, 250);
    return () => clearTimeout(t);
  }, [search, status, page, limit]);

  useEffect(() => {
    setPage(1);
  }, [search, status, limit]);

  if (isLoading && cases.length === 0) {
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
            <Ticket className="w-7 h-7 text-cyan-400" />
            Cases
          </h1>
          <p className="text-slate-400 mt-1">
            <span className="text-white font-medium">{total}</span> total cases
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => { if (page === 1) void fetchCases(); else setPage(1); }}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
        <div className="lg:col-span-2">
          <Input
            label="Search"
            placeholder="Search by subject, user, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">Status</label>
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'ALL' | CaseStatus)}
              className="w-full pl-9 pr-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
            >
              <option value="ALL">All</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">Items per page</label>
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value, 10) || 25)}
            className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Case</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">User</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Priority</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Assigned</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-slate-400">Open</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((t, idx) => {
                  const s = statusBadge(t.status);
                  const p = priorityBadge(t.priority);
                  return (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                      className={cn('border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer')}
                      onClick={() => router.push(`${ROUTES.ADMIN_CASES}/${t.id}`)}
                    >
                      <td className="py-4 px-6">
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate">{t.subject}</p>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            {t.category ?? 'GENERAL'} • #{t.id.slice(0, 8)} • {new Date(t.lastMessageAt).toLocaleString()}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-300 text-sm">{t.createdByUsername}</td>
                      <td className="py-4 px-6">
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={p.variant}>{p.label}</Badge>
                      </td>
                      <td className="py-4 px-6 text-slate-300 text-sm">{t.assignedToUsername ?? '-'}</td>
                      <td className="py-4 px-6 text-right">
                        <ChevronRight className="w-5 h-5 text-slate-500 inline-block" />
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-t border-slate-800/50">
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

          {cases.length === 0 && (
            <div className="p-10 text-center text-slate-400">No cases found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
