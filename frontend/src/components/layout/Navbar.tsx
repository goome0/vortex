'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores';
import { Button } from '@/components/ui';
import { ROUTES } from '@/lib/constants';
import {
  Menu,
  X,
  Home,
  Download,
  Newspaper,
  User,
  LogOut,
  Shield,
  Gamepad2,
  Coins,
  Ticket,
} from 'lucide-react';

const navLinks = [
  { href: ROUTES.HOME, label: 'Home', icon: Home },
  { href: ROUTES.NEWS, label: 'News', icon: Newspaper },
  { href: ROUTES.DOWNLOAD, label: 'Download', icon: Download },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      // Hysteresis prevents flicker near the threshold.
      setScrolled((prev) => (prev ? y > 10 : y > 20));
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50',
          'transition-[background-color,backdrop-filter,box-shadow] duration-500',
          // Border line (opacity-only transition to avoid white flash)
          'after:content-[""] after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-slate-800/60 after:transition-opacity after:duration-300',
          scrolled
            ? 'bg-slate-950/85 backdrop-blur-xl shadow-lg shadow-black/20 after:opacity-100'
            : 'bg-slate-950/25 backdrop-blur-md after:opacity-50'
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href={ROUTES.HOME} className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/25"
              >
                <Gamepad2 className="w-6 h-6 text-white" />
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent group-hover:from-cyan-400 group-hover:to-teal-400 transition-all duration-300">
                  Vortex
                </h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest -mt-0.5">
                  Heeho Server
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'relative px-4 py-2 rounded-lg text-sm font-medium',
                      'transition-all duration-300',
                      'flex items-center gap-2',
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 hover:text-white'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-cyan-500/10 border border-cyan-500/30 rounded-lg -z-10"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Auth Section */}
            <div className="hidden lg:flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  {/* COMP Credits Display */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-bold text-yellow-400">
                      {user?.cp?.toLocaleString() || 0}
                    </span>
                  </div>

                  {/* User Menu */}
                  <div className="group relative">
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-white">
                        {user?.username}
                      </span>
                    </button>

                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-slate-900 border border-slate-700/50 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <Link
                        href={ROUTES.DASHBOARD}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link
                        href={ROUTES.CASES}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                      >
                        <Ticket className="w-4 h-4" />
                        Cases
                      </Link>
                      <Link
                        href={ROUTES.GAME}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                      >
                        <Gamepad2 className="w-4 h-4" />
                        Web Game
                      </Link>
                      {(user?.user_level || 0) >= 1000 && (
                        <Link
                          href={ROUTES.ADMIN}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                          GM Panel
                        </Link>
                      )}
                      <hr className="my-2 border-slate-700/50" />
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href={ROUTES.LOGIN}>
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href={ROUTES.REGISTER}>
                    <Button size="sm">
                      Join Now
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-slate-950 border-l border-slate-800"
            >
              <div className="p-6 pt-20 space-y-6">
                {/* Mobile Nav Links */}
                <div className="space-y-2">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-lg',
                          'transition-all duration-200',
                          isActive
                            ? 'bg-cyan-500/10 text-white border border-cyan-500/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>

                <hr className="border-slate-800" />

                {/* Mobile Auth */}
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{user?.username}</p>
                        <div className="flex items-center gap-1 text-yellow-400 text-sm">
                          <Coins className="w-3 h-3" />
                          {user?.cp?.toLocaleString() || 0} COMP Credits
                        </div>
                      </div>
                    </div>
                    <Link
                      href={ROUTES.DASHBOARD}
                      className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                    >
                      <User className="w-5 h-5" />
                      Dashboard
                    </Link>
                    {(user?.user_level || 0) >= 1000 && (
                      <Link
                        href={ROUTES.ADMIN}
                        className="flex items-center gap-3 px-4 py-3 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors"
                      >
                        <Shield className="w-5 h-5" />
                        GM Panel
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link href={ROUTES.LOGIN} className="block">
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link href={ROUTES.REGISTER} className="block">
                      <Button className="w-full">
                        Join Now
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
