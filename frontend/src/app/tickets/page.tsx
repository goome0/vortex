'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ticketsApi, getErrorMessage } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { Badge, Button, Card, CardContent, LoadingSpinner, Alert, Input } from '@/components/ui';
import { Ticket, Plus, Search, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface TicketListItem {
  id: string;
  subject: string;
  category: string | null;
  priority: TicketPriority;
  status: TicketStatus;
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

export default function TicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchTickets = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data: response } = await ticketsApi.my();
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
    if (!q) return tickets;
    return tickets.filter((t) => `${t.subject} ${t.category ?? ''} ${t.status} ${t.priority}`.toLowerCase().includes(q));
  }, [tickets, search]);

  if (isLoading) {
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
              Support Tickets
            </h1>
            <p className="text-slate-400 mt-1">
              Track your requests and talk with staff.
            </p>
          </div>
          <Button onClick={() => router.push(`${ROUTES.TICKETS}/new`)}>
            <Plus className="w-4 h-4" />
            New Ticket
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
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
                  {filtered.map((t, idx) => {
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
                        onClick={() => router.push(`${ROUTES.TICKETS}/${t.id}`)}
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

            {filtered.length === 0 && (
              <div className="p-10 text-center text-slate-400">
                No tickets found.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={fetchTickets}>
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}

