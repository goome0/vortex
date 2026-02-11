'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, ArrowLeft, Send } from 'lucide-react';
import { Alert, Button, Card, CardContent, Input } from '@/components/ui';
import { casesApi, getErrorMessage } from '@/lib/api';
import { ROUTES } from '@/lib/constants';

type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export default function NewCasePage() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('ACCOUNT');
  const [priority, setPriority] = useState<CasePriority>('MEDIUM');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URL(window.location.href).searchParams;

    const cat = (sp.get('category') || '').toUpperCase();
    if (cat === 'ACCOUNT' || cat === 'BUG' || cat === 'REPORT' || cat === 'OTHER') {
      setCategory(cat);
    }

    const subj = sp.get('subject');
    if (typeof subj === 'string' && subj.trim().length > 0) {
      setSubject(subj);
    }
  }, []);

  const canSubmit = subject.trim().length >= 4 && message.trim().length >= 4;

  const submit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError('');
    try {
      const { data: response } = await casesApi.create({
        subject: subject.trim(),
        category,
        priority,
        message: message.trim(),
      });
      const id = response?.data?.id as string | undefined;
      if (id) {
        router.push(`${ROUTES.CASES}/${id}`);
        return;
      }
      router.push(ROUTES.CASES);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-12">
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 grid-pattern opacity-10" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white flex items-center gap-3">
              <Ticket className="w-7 h-7 text-emerald-400" />
              New Case
            </h1>
            <p className="text-slate-400 mt-1">Describe your issue and we'll get back to you.</p>
          </div>
          <Button variant="ghost" onClick={() => router.push(ROUTES.CASES)}>
            <ArrowLeft className="w-4 h-4" />
            Back
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

        <Card className="border-cyan-500/20 bg-cyan-500/5">
          <CardContent className="pt-6 space-y-2 text-sm text-slate-300">
            <p className="font-semibold text-cyan-300">Account & Character Creation</p>
            <p>You can request account help using a ticket.</p>
            <p>
              You can create a Player Character with a ticket. Max amount of Player Characters you can create for each account is{' '}
              <span className="font-semibold text-white">20</span>.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50">
          <CardContent className="pt-6 space-y-4">
            <Input
              label="Subject"
              placeholder="Ex: Cannot login to my account"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                >
                  <option value="ACCOUNT">Account</option>
                  <option value="BUG">Bug</option>
                  <option value="REPORT">Report</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as CasePriority)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Tell us what happened, and include any useful details."
                className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white placeholder:text-slate-500 transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => router.push(ROUTES.CASES)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={!canSubmit} isLoading={isSubmitting}>
                <Send className="w-4 h-4" />
                Create Case
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
