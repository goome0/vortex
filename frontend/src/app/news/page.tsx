'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent, Badge, Button } from '@/components/ui';
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

// Mock news data
const newsItems = [
  {
    id: 1,
    title: 'Season 4: The Dark Convergence is Here!',
    excerpt: 'Experience the biggest content update yet with new dungeons, raids, and a complete story arc...',
    content: '',
    date: '2024-02-15',
    category: 'Major Update',
    categoryColor: 'danger',
    featured: true,
    readTime: '5 min read',
  },
  {
    id: 2,
    title: 'Double XP Weekend Event',
    excerpt: 'Level up faster this weekend! Earn double experience points in all activities...',
    content: '',
    date: '2024-02-10',
    category: 'Event',
    categoryColor: 'warning',
    featured: false,
    readTime: '2 min read',
  },
  {
    id: 3,
    title: 'New Legendary Weapons Released',
    excerpt: 'Discover the power of the Chaos Blade series. Available through the new raid content...',
    content: '',
    date: '2024-02-08',
    category: 'Content',
    categoryColor: 'info',
    featured: false,
    readTime: '3 min read',
  },
  {
    id: 4,
    title: 'Server Maintenance Scheduled',
    excerpt: 'We will be performing scheduled maintenance on February 12th from 4:00 AM to 8:00 AM UTC...',
    content: '',
    date: '2024-02-05',
    category: 'Maintenance',
    categoryColor: 'default',
    featured: false,
    readTime: '1 min read',
  },
  {
    id: 5,
    title: 'Valentine Event Coming Soon',
    excerpt: 'Love is in the air! Join our special Valentine event for exclusive rewards and cosmetics...',
    content: '',
    date: '2024-02-03',
    category: 'Event',
    categoryColor: 'warning',
    featured: false,
    readTime: '2 min read',
  },
  {
    id: 6,
    title: 'Balance Patch Notes v4.1.5',
    excerpt: 'We have made several balance adjustments to improve class diversity in PvP and PvE...',
    content: '',
    date: '2024-02-01',
    category: 'Patch Notes',
    categoryColor: 'info',
    featured: false,
    readTime: '8 min read',
  },
];

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

export default function NewsPage() {
  const featuredNews = newsItems.find((item) => item.featured);
  const regularNews = newsItems.filter((item) => !item.featured);

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

        {/* Featured Article */}
        {featuredNews && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <Link href={`/news/${featuredNews.id}`}>
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
                      variant={featuredNews.categoryColor as 'danger' | 'warning' | 'info' | 'default'} 
                      className="w-fit mb-4"
                    >
                      {featuredNews.category}
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-red-400 transition-colors">
                      {featuredNews.title}
                    </h2>
                    <p className="text-slate-400 mb-6">{featuredNews.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {featuredNews.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {featuredNews.readTime}
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
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {regularNews.map((news) => {
            const CategoryIcon = categoryIcons[news.category] || Newspaper;
            return (
              <motion.div key={news.id} variants={fadeInUp}>
                <Link href={`/news/${news.id}`}>
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
                          variant={news.categoryColor as 'danger' | 'warning' | 'info' | 'default'}
                          size="sm"
                        >
                          {news.category}
                        </Badge>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {news.date}
                        </span>
                      </div>

                      {/* Title & Excerpt */}
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                        {news.title}
                      </h3>
                      <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                        {news.excerpt}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {news.readTime}
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

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Button variant="outline" size="lg">
            Load More News
            <ChevronRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
