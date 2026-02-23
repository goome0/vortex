'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { adminCasesApi, getErrorMessage } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { Alert, Badge, Button, Input, LoadingSpinner } from '@/components/atoms';
import { Card, CardContent } from '@/components/molecules';
import { ArrowLeft, CheckCircle2, MessageSquare, Send, Ticket, User, Wrench } from 'lucide-react';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
type AuthorRole = 'USER' | 'ADMIN';

interface TicketMessage {
  id: string;
  caseId: string;
  authorUsername: string;
  authorRole: AuthorRole;
  body: string;
  createdAt: string;
}

interface TicketDetails {
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
  messages: TicketMessage[];
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

export default function AdminCaseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [reply, setReply] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const [resolution, setResolution] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const fetchTicket = async () => {
    if (!id) return;
    setIsLoading(true);
    setError('');
    try {
      const { data: response } = await adminCasesApi.get(id);
      setTicket((response?.data ?? null) as TicketDetails | null);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchTicket();
  }, [id]);

  const canReply = useMemo(() => reply.trim().length >= 1 && ticket?.status !== 'CLOSED', [reply, ticket?.status]);
  const canResolve = useMemo(() => ticket?.status !== 'CLOSED' && ticket?.status !== 'RESOLVED', [ticket?.status]);

  const sendReply = async () => {
    if (!id || !canReply) return;
    setIsReplying(true);
    setError('');
    try {
      await adminCasesApi.addMessage(id, reply.trim());
      setReply('');
      await fetchTicket();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setIsReplying(false);
    }
  };

  const resolve = async () => {
    if (!id || !canResolve) return;
    setIsResolving(true);
    setError('');
    try {
      await adminCasesApi.resolve(id, { message: resolution.trim() });
      setResolution('');
      await fetchTicket();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setIsResolving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const s = ticket ? statusBadge(ticket.status) : null;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <Ticket className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white truncate">
              {ticket?.subject ?? 'Case'}
            </h1>
          </div>
          <p className="text-slate-400 mt-1 text-sm">
            #{ticket?.id?.slice(0, 8)} • {ticket?.category ?? 'GENERAL'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push(ROUTES.ADMIN_CASES)}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          {s && <Badge variant={s.variant}>{s.label}</Badge>}
          <Button variant="secondary" onClick={fetchTicket}>
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

        {!ticket && (
          <Alert variant="error">
            Case not found.
          </Alert>
        )}

      {ticket && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">Conversation</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    Last update: {new Date(ticket.lastMessageAt).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-3">
                  {ticket.messages.map((m) => {
                    const byAdmin = m.authorRole === 'ADMIN';
                    return (
                      <div key={m.id} className={`flex ${byAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 border ${byAdmin ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-slate-800/40 border-slate-700/50'}`}>
                          <div className="flex items-center justify-between gap-4 mb-1">
                            <p className={`text-xs ${byAdmin ? 'text-cyan-300' : 'text-emerald-300'}`}>
                              {byAdmin ? `Staff (${m.authorUsername})` : `${m.authorUsername}`}
                            </p>
                            <p className="text-[11px] text-slate-500">{new Date(m.createdAt).toLocaleString()}</p>
                          </div>
                          <p className="text-sm text-slate-100 whitespace-pre-wrap break-words">{m.body}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 pt-5 border-t border-slate-800/60 space-y-2">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={4}
                    placeholder={ticket.status === 'CLOSED' ? 'Case is closed.' : 'Write a reply to the user...'}
                    disabled={ticket.status === 'CLOSED'}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white placeholder:text-slate-500 transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60"
                  />
                  <div className="flex items-center justify-end">
                    <Button onClick={sendReply} disabled={!canReply} isLoading={isReplying}>
                      <Send className="w-4 h-4" />
                      Reply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <User className="w-5 h-5 text-slate-300" />
                  Case Info
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">User</span>
                  <span className="text-sm text-white font-medium">{ticket.createdByUsername}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Priority</span>
                  <span className="text-sm text-white font-medium">{ticket.priority}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Assigned</span>
                  <span className="text-sm text-white font-medium">{ticket.assignedToUsername ?? '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Resolved by</span>
                  <span className="text-sm text-white font-medium">{ticket.resolvedByUsername ?? '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Created</span>
                  <span className="text-sm text-white font-medium">{new Date(ticket.createdAt).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Wrench className="w-5 h-5 text-cyan-300" />
                  Resolve
                </div>

                <Input
                  label="Resolution note (optional)"
                  placeholder="Ex: Fixed by resetting account state."
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                />

                <Button
                  className="w-full justify-start"
                  variant="secondary"
                  onClick={resolve}
                  disabled={!canResolve}
                  isLoading={isResolving}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark as resolved
                </Button>

                <p className="text-xs text-slate-500">
                  Resolving keeps the ticket open for the user to confirm and close.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
