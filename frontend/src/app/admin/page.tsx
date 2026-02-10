'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, Badge, LoadingSpinner } from '@/components/ui';
import { useAuthStore } from '@/stores';
import { adminApi, getErrorMessage } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import {
  Users,
  Monitor,
  Gift,
  Server,
  AlertTriangle,
  CheckCircle,
  Package,
  MessageSquare,
  UserCog,
  Ticket,
  Layers,
  CalendarClock,
  Newspaper,
} from 'lucide-react';

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

interface AccountSummary {
  username: string;
  email: string;
  disp_name: string;
  user_level: number;
  cp: number;
  enabled: boolean;
  last_login: number;
}

export default function AdminOverviewPage() {
  const { user } = useAuthStore();
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [promoCount, setPromoCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOverviewData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [accountsRes, promosRes] = await Promise.allSettled([
        adminApi.getAccounts(),
        adminApi.getPromos(),
      ]);

      if (accountsRes.status === 'fulfilled') {
        setAccounts(accountsRes.value.data?.data?.accounts || accountsRes.value.data?.data || []);
      }
      if (promosRes.status === 'fulfilled') {
        const promos = promosRes.value.data?.data?.promos || promosRes.value.data?.data || [];
        setPromoCount(Array.isArray(promos) ? promos.length : 0);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter((a) => a.enabled).length;
  const adminAccounts = accounts.filter((a) => a.user_level >= 1000).length;

  const overviewStats = [
    { label: 'Total Accounts', value: totalAccounts.toLocaleString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Active Accounts', value: activeAccounts.toLocaleString(), icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Active Promos', value: promoCount.toString(), icon: Gift, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Admin Accounts', value: adminAccounts.toString(), icon: UserCog, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  ];

  const quickActions = [
    { label: 'Accounts', icon: Users, href: ROUTES.ADMIN_ACCOUNTS, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
    { label: 'Online Players', icon: Monitor, href: ROUTES.ADMIN_ONLINE, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    { label: 'Promo Codes', icon: Gift, href: ROUTES.ADMIN_PROMOS, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    { label: 'News', icon: Newspaper, href: ROUTES.ADMIN_NEWS, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    { label: 'Post Items', icon: Package, href: ROUTES.ADMIN_ITEMS, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
    { label: 'Item Bundles', icon: Layers, href: ROUTES.ADMIN_BUNDLES, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    { label: 'Scheduled CP', icon: CalendarClock, href: ROUTES.ADMIN_SCHEDULED_CP, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    { label: 'Tickets', icon: Ticket, href: ROUTES.ADMIN_TICKETS, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    { label: 'Server Control', icon: Server, href: ROUTES.ADMIN_SERVER, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    { label: 'World Message', icon: MessageSquare, href: ROUTES.ADMIN_WORLD, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-display font-bold text-white">
          GM Panel Overview
        </h1>
        <p className="text-slate-400 mt-2">
          Welcome back, <span className="text-cyan-400">{user?.disp_name || user?.username}</span>. Here&apos;s what&apos;s happening on the server.
        </p>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {overviewStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <Card className="h-full border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-6">
                <Server className="w-5 h-5 text-slate-400" />
                <h3 className="text-lg font-bold text-white">Quick Actions</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.label} href={action.href}>
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.bg} border ${action.border} hover:brightness-125 transition-all duration-300 cursor-pointer`}
                      >
                        <Icon className={`w-6 h-6 ${action.color}`} />
                        <span className="text-sm font-medium text-white text-center">{action.label}</span>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Accounts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-slate-400" />
                  <h3 className="text-lg font-bold text-white">Recent Accounts</h3>
                </div>
                <Link href={ROUTES.ADMIN_ACCOUNTS}>
                  <Badge variant="info" className="cursor-pointer hover:brightness-125">View All</Badge>
                </Link>
              </div>

              <div className="space-y-3">
                {accounts.slice(0, 6).map((account) => (
                  <div
                    key={account.username}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white font-bold">
                      {account.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-medium text-white truncate">{account.username}</p>
                      <p className="text-xs text-slate-500 truncate">{account.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {account.user_level >= 1000 && (
                        <Badge variant="warning" size="sm">Admin</Badge>
                      )}
                      <Badge variant={account.enabled ? 'success' : 'danger'} size="sm">
                        {account.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {accounts.length === 0 && (
                  <p className="text-center text-slate-500 py-4">No accounts found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
