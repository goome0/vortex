'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { adminTicketsApi, getErrorMessage } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { Alert, Badge, Button, Card, CardContent, Input, LoadingSpinner } from '@/components/ui';
import { Search, Ticket, ChevronRight, RefreshCw, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface TicketListItem {
  id: string;
  createdByUsername: string;
  assignedToUsername: string | null;
  resolvedByUsername: string | null;
  subject: string;
  category: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  resolvedAt: string | null;
  closedAt: string | null;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

function statusBadge(status: TicketStatus) {
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

function priorityBadge(priority: TicketPriority) {
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

export default function AdminTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | TicketStatus>('ALL');

  const fetchTickets = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data: response } = await adminTicketsApi.list();
      const data = response?.data;
      setTickets(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchTickets();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const byStatus = status === 'ALL' ? tickets : tickets.filter((t) => t.status === status);
    if (!q) return byStatus;
    return byStatus.filter((t) =>
      `${t.subject} ${t.category ?? ''} ${t.createdByUsername} ${t.assignedToUsername ?? ''} ${t.status} ${t.priority}`
        .toLowerCase()
        .includes(q),
    );
  }, [tickets, search, status]);

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
            <Ticket className="w-7 h-7 text-cyan-400" />
            Tickets
          </h1>
          <p className="text-slate-400 mt-1">
            <span className="text-white font-medium">{tickets.length}</span> total tickets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={fetchTickets}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
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
              onChange={(e) => setStatus(e.target.value as 'ALL' | TicketStatus)}
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
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Ticket</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">User</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Priority</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Assigned</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-slate-400">Open</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, idx) => {
                  const s = statusBadge(t.status);
                  const p = priorityBadge(t.priority);
                  return (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                      className={cn('border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer')}
                      onClick={() => router.push(`${ROUTES.ADMIN_TICKETS}/${t.id}`)}
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

          {filtered.length === 0 && (
            <div className="p-10 text-center text-slate-400">No tickets found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

