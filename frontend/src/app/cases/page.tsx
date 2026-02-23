'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { casesApi, getErrorMessage } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/stores';
import { Alert, Badge, Button, Input, LoadingSpinner } from '@/components/atoms';
import { Card, CardContent } from '@/components/molecules';
import { Ticket, Plus, Search, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type CaseStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface CaseListItem {
  id: string;
  subject: string;
  category: string | null;
  priority: CasePriority;
  status: CaseStatus;
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

export default function CasesPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchCases = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data: response } = await casesApi.my({
        q: search.trim() || undefined,
        page,
        limit,
      });
      const data = response?.data;
      if (Array.isArray(data?.items)) {
        setCases(data.items);
        setTotal(typeof data.total === 'number' ? data.total : data.items.length);
      } else if (Array.isArray(data)) {
        setCases(data);
        setTotal(data.length);
      } else {
        setCases([]);
        setTotal(0);
      }
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.push(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.CASES)}`);
      return;
    }
    const timeout = setTimeout(() => {
      void fetchCases();
    }, 250);
    return () => clearTimeout(timeout);
  }, [isAuthenticated, isHydrated, router, page, limit, search]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (!isHydrated || (isLoading && cases.length === 0)) {
    return (
      <div className="min-h-screen pt-28 pb-12 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-12">
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 grid-pattern opacity-10" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white flex items-center gap-3">
              <Ticket className="w-7 h-7 text-emerald-400" />
              Support Cases
            </h1>
            <p className="text-slate-400 mt-1">
              Track your requests and talk with staff.
            </p>
          </div>
          <Button onClick={() => router.push(`${ROUTES.CASES}/new`)}>
            <Plus className="w-4 h-4" />
            New Case
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

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Input
            placeholder="Search cases..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            icon={<Search className="w-5 h-5" />}
          />
        </motion.div>

        <Card className="border-slate-700/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Subject</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Priority</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Last update</th>
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
                        className={cn(
                          'border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer',
                        )}
                        onClick={() => router.push(`${ROUTES.CASES}/${t.id}`)}
                      >
                        <td className="py-4 px-6">
                          <div className="min-w-0">
                            <p className="font-medium text-white truncate">{t.subject}</p>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                              {t.category ?? 'GENERAL'} • #{t.id.slice(0, 8)}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant={s.variant}>{s.label}</Badge>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant={p.variant}>{p.label}</Badge>
                        </td>
                        <td className="py-4 px-6 text-slate-300 text-sm">
                          {new Date(t.lastMessageAt).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <ChevronRight className="w-5 h-5 text-slate-500 inline-block" />
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {cases.length === 0 && (
              <div className="p-10 text-center text-slate-400">
                No cases found.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-slate-400">
            Total {total} • Page {page} of {totalPages}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={String(limit)}
              onChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700/50 text-white text-sm focus:outline-none focus:border-cyan-500/50"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>

            <Button variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              Prev
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
            <Button variant="secondary" onClick={fetchCases} isLoading={isLoading}>
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

