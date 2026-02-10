'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, Badge } from '@/components/ui';
import { ROUTES } from '@/lib/constants';
import {
  Download,
  Swords,
  Shield,
  Zap,
  ChevronRight,
  Play,
  Star,
  Trophy,
  Skull,
  Flame,
  Target,
  Users,
} from 'lucide-react';

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
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

// Features
const features = [
  {
    icon: Flame,
    title: 'Post-Apocalyptic World',
    description: 'Explore a devastated world filled with danger, mystery, and endless adventure.',
  },
  {
    icon: Swords,
    title: 'Intense PvP Combat',
    description: 'Battle against other survivors in fast-paced combat with deep mechanics.',
  },
  {
    icon: Users,
    title: 'Build Your Clan',
    description: 'Unite with allies, form powerful clans, and dominate territories.',
  },
  {
    icon: Target,
    title: 'Epic Boss Raids',
    description: 'Take down massive bosses with your party and earn legendary rewards.',
  },
  {
    icon: Shield,
    title: 'Unique Class System',
    description: 'Choose from multiple classes each with unique abilities and playstyles.',
  },
  {
    icon: Zap,
    title: 'Weekly Events',
    description: 'Participate in exclusive events with special rewards and challenges.',
  },
];

// News (mock)
const news = [
  {
    id: 1,
    title: 'Season 4: The Dark Convergence',
    date: '2024-02-15',
    category: 'Update',
    image: '/placeholder-news-1.jpg',
  },
  {
    id: 2,
    title: 'Double XP Weekend Event',
    date: '2024-02-10',
    category: 'Event',
    image: '/placeholder-news-2.jpg',
  },
  {
    id: 3,
    title: 'New Legendary Weapons Released',
    date: '2024-02-05',
    category: 'Content',
    image: '/placeholder-news-3.jpg',
  },
];

type Particle = {
  id: number;
  left: string;
  top: string;
  durationSeconds: number;
  delaySeconds: number;
};

export default function HomePage() {
  // Avoid React hydration mismatch by generating random particle positions on the client only.
  const [isMounted, setIsMounted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    setParticles(
      [...Array(20)].map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        durationSeconds: 3 + Math.random() * 2,
        delaySeconds: Math.random() * 2,
      }))
    );
  }, [isMounted]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient">
        {/* Background Grid */}
        <div className="absolute inset-0 grid-pattern opacity-30" />

        {/* Animated Particles */}
        <div className="absolute inset-0">
          {isMounted &&
            particles.map((p) => (
              <motion.div
              key={p.id}
              className="absolute w-1 h-1 bg-cyan-500/50 rounded-full"
              style={{
                left: p.left,
                top: p.top,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: p.durationSeconds,
                repeat: Infinity,
                delay: p.delaySeconds,
              }}
            />
            ))}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp}>
              <Badge variant="danger" size="md" pulse className="mb-6">
                <Star className="w-3 h-3" /> Season 4 Now Live
              </Badge>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeInUp}
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight"
            >
              <span className="block text-white">ENTER THE</span>
              <span className="block gradient-text-red mt-2">WASTELAND</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeInUp}
              className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto"
            >
              Survive the chaos. Build your legacy. Dominate the realm. 
              Join thousands of players in an epic post-apocalyptic MMORPG adventure.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href={ROUTES.DOWNLOAD}>
                <Button size="lg" className="group min-w-[200px]">
                  <Download className="w-5 h-5" />
                  Download Now
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href={ROUTES.REGISTER}>
                <Button variant="outline" size="lg" className="min-w-[200px]">
                  <Play className="w-5 h-5" />
                  Create Account
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="info" size="md" className="mb-4">
              <Skull className="w-3 h-3" /> Game Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
              What Awaits You
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Discover a world full of danger and opportunity. Every choice matters in this unforgiving wasteland.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                  className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-cyan-500/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/50 via-teal-950/30 to-cyan-950/50" />
        <div className="absolute inset-0 grid-pattern opacity-10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '156K+', label: 'Registered Players' },
              { value: '99.9%', label: 'Server Uptime' },
              { value: '24/7', label: 'Support Available' },
              { value: '15+', label: 'Unique Classes' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-display font-bold gradient-text-red">
                  {stat.value}
                </p>
                <p className="mt-2 text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
                Latest News
              </h2>
              <p className="mt-2 text-slate-400">
                Stay updated with the latest events and updates
              </p>
            </div>
            <Link href={ROUTES.NEWS}>
              <Button variant="ghost" className="hidden sm:flex">
                View All News
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

          {/* News Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {news.map((item, index) => (
              <motion.article
                key={item.id}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="group rounded-2xl bg-slate-900/50 border border-slate-800/50 overflow-hidden hover:border-cyan-500/30 transition-all duration-300"
              >
                {/* Image Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Flame className="w-12 h-12 text-cyan-500/30" />
                  </div>
                  <Badge 
                    variant={item.category === 'Update' ? 'danger' : item.category === 'Event' ? 'warning' : 'info'} 
                    className="absolute top-4 left-4"
                  >
                    {item.category}
                  </Badge>
                </div>
                <div className="p-6">
                  <p className="text-sm text-slate-500 mb-2">{item.date}</p>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {item.title}
                  </h3>
                  <Link
                    href={`/news/${item.id}`}
                    className="inline-flex items-center gap-1 mt-4 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Read More
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </motion.div>

          {/* Mobile View All */}
          <div className="mt-8 text-center sm:hidden">
            <Link href={ROUTES.NEWS}>
              <Button variant="outline">
                View All News
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/20 to-transparent" />
        <div className="absolute inset-0 grid-pattern opacity-5" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Trophy className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
              Ready to Begin Your Journey?
            </h2>
            <p className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto">
              Join thousands of survivors fighting for glory in the wasteland. 
              Your legend starts here.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={ROUTES.REGISTER}>
                <Button size="lg" className="min-w-[200px]">
                  Start Playing Free
                </Button>
              </Link>
              <Link href={ROUTES.DOWNLOAD}>
                <Button variant="secondary" size="lg" className="min-w-[200px]">
                  <Download className="w-5 h-5" />
                  Download Client
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
