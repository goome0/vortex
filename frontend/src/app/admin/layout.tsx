'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button, Skeleton } from '@/components/ui';
import {
  Shield,
  Users,
  Monitor,
  Gift,
  MessageSquare,
  Package,
  ChevronLeft,
  Home,
  LogOut,
  Menu,
  X,
  Ticket,
  Server,
  Layers,
} from 'lucide-react';

const adminNavItems = [
  { href: ROUTES.ADMIN, label: 'Overview', icon: Home },
  { href: ROUTES.ADMIN_ACCOUNTS, label: 'Accounts', icon: Users },
  { href: ROUTES.ADMIN_ONLINE, label: 'Online Players', icon: Monitor },
  { href: ROUTES.ADMIN_PROMOS, label: 'Promo Codes', icon: Gift },
  { href: ROUTES.ADMIN_ITEMS, label: 'Post Items', icon: Package },
  { href: ROUTES.ADMIN_BUNDLES, label: 'Item Bundles', icon: Layers },
  { href: ROUTES.ADMIN_TICKETS, label: 'Tickets', icon: Ticket },
  { href: ROUTES.ADMIN_WORLD, label: 'World Message', icon: MessageSquare },
  { href: ROUTES.ADMIN_SERVER, label: 'Server Control', icon: Server },
];

const SIDEBAR_EXPANDED_PX = 280;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, isHydrated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user && user.user_level >= 1000;
  const sidebarWidth = `${SIDEBAR_EXPANDED_PX}px`;

  useEffect(() => {
    if (isHydrated && !isLoading) {
      if (!isAuthenticated) {
        router.push(ROUTES.LOGIN);
      } else if (!isAdmin) {
        router.push(ROUTES.DASHBOARD);
      }
    }
  }, [isAuthenticated, isLoading, isHydrated, isAdmin, router]);

  if (!isHydrated || isLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex">
        {/* Sidebar Skeleton */}
        <div className="hidden lg:flex flex-col w-[280px] bg-slate-950 border-r border-slate-800/50 p-4 space-y-4">
          <div className="h-12 w-full flex items-center gap-3">
             <Skeleton className="h-10 w-10 rounded-xl" />
             <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
             </div>
          </div>
          <div className="space-y-2 mt-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="flex-1 p-8 space-y-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {[1, 2, 3, 4].map((i) => (
               <Skeleton key={i} className="h-32 rounded-xl" />
             ))}
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-950"
      style={
        {
          ['--admin-sidebar-width' as string]: sidebarWidth,
        } as React.CSSProperties
      }
    >
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white">GM Panel</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-slate-950 border-r border-slate-800 pt-20 pb-6 px-4"
            >
              <nav className="space-y-1">
                {adminNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                        isActive
                          ? 'bg-cyan-500/10 text-white border border-cyan-500/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-6 pt-6 border-t border-slate-800 space-y-2">
                <Link href={ROUTES.DASHBOARD}>
                  <Button variant="ghost" className="w-full justify-start">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start text-red-400" onClick={logout}>
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40',
          'bg-slate-950 border-r border-slate-800/50',
          'w-[var(--admin-sidebar-width)]',
          'transition-[width] duration-300 ease-out'
        )}
      >
        {/* Sidebar Header */}
        <div 
          className={cn(
            "h-20 flex items-center border-b border-slate-800/50 relative shrink-0 transition-colors",
            "px-4"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 overflow-hidden whitespace-nowrap",
              "min-w-0 flex-1"
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-white truncate">GM Panel</h2>
              <p className="text-xs text-cyan-400 truncate">Admin Access</p>
            </div>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center rounded-lg transition-all duration-200 border outline-none focus:outline-none overflow-hidden',
                  'gap-3 px-4 py-3',
                  isActive
                    ? 'bg-cyan-500/10 text-white border-cyan-500/30'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="whitespace-nowrap block">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/50 space-y-2">
          <Link href={ROUTES.DASHBOARD}>
            <Button
              variant="ghost"
              className={cn(
                'w-full gap-3',
                'justify-start',
              )}
            >
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap block">Back to Dashboard</span>
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen pt-16 lg:pt-0">
        <div 
          className={cn(
            "w-full transition-[padding] duration-300 ease-in-out",
            "lg:pl-[var(--admin-sidebar-width)]"
          )}
        >
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
