'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
  pulse?: boolean;
}

const variants = {
  default: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
  success: 'bg-green-900/50 text-green-400 border-green-500/30',
  warning: 'bg-yellow-900/50 text-yellow-400 border-yellow-500/30',
  danger: 'bg-red-900/50 text-red-400 border-red-500/30',
  info: 'bg-blue-900/50 text-blue-400 border-blue-500/30',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export function Badge({ children, variant = 'default', size = 'sm', className, pulse }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {pulse && (
        <motion.span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            variant === 'success' && 'bg-green-400',
            variant === 'warning' && 'bg-yellow-400',
            variant === 'danger' && 'bg-red-400',
            variant === 'info' && 'bg-blue-400',
            variant === 'default' && 'bg-slate-400'
          )}
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      {children}
    </span>
  );
}
