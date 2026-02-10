'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ROUTES, APP_NAME } from '@/lib/constants';
import {
  Gamepad2,
  Github,
  Twitter,
  MessageCircle,
  Heart,
  ExternalLink,
} from 'lucide-react';

const footerLinks = {
  game: [
    { label: 'Download', href: ROUTES.DOWNLOAD },
    { label: 'News', href: ROUTES.NEWS },
    { label: 'Wiki', href: '#' },
  ],
  community: [
    { label: 'Discord', href: '#', external: true },
    { label: 'Forums', href: '#', external: true },
    { label: 'Support', href: '#' },
    { label: 'Bug Report', href: '#' },
  ],
  legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
};

const socialLinks = [
  { icon: MessageCircle, href: '#', label: 'Discord' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Github, href: '#', label: 'GitHub' },
];

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="relative bg-slate-950 border-t border-slate-800/50">
      {/* Glow Effect */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-12 lg:py-16 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href={ROUTES.HOME} className="inline-flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/25"
              >
                <Gamepad2 className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                  Vortex
                </h2>
                <p className="text-xs text-slate-500 uppercase tracking-widest">
                  Heeho Server
                </p>
              </div>
            </Link>
            <p className="mt-4 text-sm text-slate-400 max-w-xs">
              Enter the wasteland. Survive the chaos. Dominate the realm. 
              Join thousands of players in an epic post-apocalyptic adventure.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all duration-300"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Game Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Game
            </h3>
            <ul className="space-y-3">
              {footerLinks.game.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Community
            </h3>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1"
                    {...(link.external && { target: '_blank', rel: 'noopener noreferrer' })}
                  >
                    {link.label}
                    {link.external && <ExternalLink className="w-3 h-3" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <p className="text-sm text-slate-600 flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500" /> by the Vortex Team
          </p>
        </div>
      </div>
    </footer>
  );
}
