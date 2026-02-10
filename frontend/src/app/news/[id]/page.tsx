'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock, Newspaper } from 'lucide-react';
import { Badge, Button, Card, CardContent, LoadingSpinner } from '@/components/ui';
import { getErrorMessage, newsApi } from '@/lib/api';

type NewsDetail = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  badgeVariant: 'default' | 'info' | 'warning' | 'danger';
  featured: boolean;
  readTime: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
};

function formatDate(s: string | null | undefined): string {
  if (!s) return '';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return String(s);
  return d.toISOString().slice(0, 10);
}

export default function NewsDetailPage() {
  const params = useParams<{ id: string }>();
  const idOrSlug = params?.id;

  const query = useQuery({
    queryKey: ['news', 'detail', idOrSlug],
    enabled: typeof idOrSlug === 'string' && idOrSlug.length > 0,
    queryFn: async () => {
      const res = await newsApi.get(idOrSlug);
      return res.data?.data as NewsDetail;
    },
  });

  return (
    <div className="min-h-screen pt-20">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 grid-pattern opacity-10" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/news">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4" />
              Back to News
            </Button>
          </Link>
          <Badge variant="info" size="md">
            <Newspaper className="w-3 h-3" /> Announcement
          </Badge>
        </div>

        {query.isLoading && (
          <div className="flex items-center justify-center py-24">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {query.isError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            {getErrorMessage(query.error)}
          </div>
        )}

        {!query.isLoading && query.data && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card variant="glow" className="overflow-hidden">
              <CardContent className="pt-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Badge
                    variant={(query.data.badgeVariant as 'danger' | 'warning' | 'info' | 'default') ?? 'default'}
                    size="md"
                  >
                    {query.data.category ?? 'News'}
                  </Badge>

                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(query.data.publishedAt ?? query.data.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {query.data.readTime ?? '—'}
                    </span>
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                  {query.data.title}
                </h1>

                {query.data.excerpt && (
                  <p className="text-lg text-slate-300">
                    {query.data.excerpt}
                  </p>
                )}

                <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white">
                  {query.data.content
                    ? query.data.content.split('\n').map((line, idx) => (
                        <p key={idx}>{line}</p>
                      ))
                    : <p className="text-slate-400">No content.</p>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

