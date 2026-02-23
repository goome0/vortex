'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children?: React.ReactNode;
}

const variants = {
  primary: `
    bg-gradient-to-r from-cyan-600 to-teal-500 
    hover:from-cyan-500 hover:to-teal-400
    text-white font-bold tracking-wide
    shadow-lg shadow-cyan-500/25
    border border-cyan-400/30
  `,
  secondary: `
    bg-gradient-to-r from-slate-700 to-slate-600
    hover:from-slate-600 hover:to-slate-500
    text-white font-medium
    shadow-lg shadow-slate-900/50
    border border-slate-500/30
  `,
  ghost: `
    bg-transparent hover:bg-white/5
    text-slate-300 hover:text-white
    border border-transparent hover:border-slate-700
  `,
  danger: `
    bg-gradient-to-r from-red-700 to-red-600
    hover:from-red-600 hover:to-red-500
    text-white font-medium
    shadow-lg shadow-red-900/50
    border border-red-500/30
  `,
  outline: `
    bg-transparent 
    text-cyan-400 hover:text-cyan-300
    border-2 border-cyan-500/50 hover:border-cyan-400
    hover:bg-cyan-500/10
  `,
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-5 py-2.5 text-base rounded-lg',
  lg: 'px-8 py-3.5 text-lg rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={cn(
          'relative inline-flex items-center justify-center gap-2',
          'transition-all duration-300 ease-out',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-900',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin" />
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
