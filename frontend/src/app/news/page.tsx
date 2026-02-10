'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent, Badge, Button, LoadingSpinner } from '@/components/ui';
import { newsApi, getErrorMessage } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import {
  Newspaper,
  Calendar,
  ChevronRight,
  Flame,
  Gift,
  Wrench,
  Star,
  Clock,
} from 'lucide-react';

type NewsItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  badgeVariant: 'default' | 'info' | 'warning' | 'danger';
  featured: boolean;
  readTime: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
};

const categoryIcons: Record<string, React.ElementType> = {
  'Major Update': Flame,
  'Event': Gift,
  'Content': Star,
  'Maintenance': Wrench,
  'Patch Notes': Wrench,
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function formatDate(s: string | null | undefined): string {
  if (!s) return '';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return String(s);
  return d.toISOString().slice(0, 10);
}

export default function NewsPage() {
  const query = useQuery({
    queryKey: ['news', { limit: 12 }],
    queryFn: async () => {
      const res = await newsApi.list({ limit: 12 });
      return (res.data?.data ?? []) as NewsItem[];
    },
  });

  const { featuredNews, regularNews } = useMemo(() => {
    const items = (query.data ?? []) as NewsItem[];
    const featured = items.find((i) => i.featured) ?? items[0];
    const regular = items.filter((i) => i.id !== featured?.id);
    return { featuredNews: featured, regularNews: regular };
  }, [query.data]);

  return (
    <div className="min-h-screen pt-20">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 grid-pattern opacity-10" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge variant="info" size="md" className="mb-4">
            <Newspaper className="w-3 h-3" /> Latest Updates
          </Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white">
            News & Announcements
          </h1>
          <p className="mt-4 text-xl text-slate-400">
            Stay updated with the latest from Vortex/Heeho Server
          </p>
        </motion.div>

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

        {/* Featured Article */}
        {!query.isLoading && featuredNews && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <Link href={`/news/${featuredNews.slug || featuredNews.id}`}>
              <Card variant="glow" hover className="overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Image */}
                  <div className="aspect-video md:aspect-auto bg-gradient-to-br from-red-900/50 to-orange-900/50 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Flame className="w-20 h-20 text-red-500/50" />
                    </div>
                    <Badge variant="danger" className="absolute top-4 left-4">
                      Featured
                    </Badge>
                  </div>
                  {/* Content */}
                  <CardContent className="pt-6 flex flex-col justify-center">
                    <Badge 
                      variant={(featuredNews.badgeVariant as 'danger' | 'warning' | 'info' | 'default') ?? 'default'} 
                      className="w-fit mb-4"
                    >
                      {featuredNews.category ?? 'News'}
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-red-400 transition-colors">
                      {featuredNews.title}
                    </h2>
                    <p className="text-slate-400 mb-6">{featuredNews.excerpt ?? ''}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(featuredNews.publishedAt ?? featuredNews.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {featuredNews.readTime ?? '—'}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm">
                        Read More
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </Link>
          </motion.div>
        )}

        {/* News Grid */}
        {!query.isLoading && (
          <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {regularNews.map((news) => {
            const CategoryIcon = categoryIcons[news.category ?? ''] || Newspaper;
            return (
              <motion.div key={news.id} variants={fadeInUp}>
                <Link href={`/news/${news.slug || news.id}`}>
                  <Card hover className="h-full">
                    <CardContent className="pt-6">
                      {/* Image Placeholder */}
                      <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg mb-4 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <CategoryIcon className="w-12 h-12 text-slate-700" />
                        </div>
                      </div>

                      {/* Category & Date */}
                      <div className="flex items-center justify-between mb-3">
                        <Badge 
                          variant={(news.badgeVariant as 'danger' | 'warning' | 'info' | 'default') ?? 'default'}
                          size="sm"
                        >
                          {news.category ?? 'News'}
                        </Badge>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(news.publishedAt ?? news.createdAt)}
                        </span>
                      </div>

                      {/* Title & Excerpt */}
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                        {news.title}
                      </h3>
                      <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                        {news.excerpt ?? ''}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {news.readTime ?? '—'}
                        </span>
                        <span className="text-red-400 text-sm font-medium flex items-center gap-1">
                          Read More
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
        )}

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Button variant="outline" size="lg" disabled>
            Load More News
            <ChevronRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
