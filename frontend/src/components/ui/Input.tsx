'use client';

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { forwardRef, InputHTMLAttributes, useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-slate-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-50 group-focus-within:text-cyan-500 transition-colors">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={isPassword && showPassword ? 'text' : type}
            className={cn(
              'w-full px-4 py-3 rounded-lg',
              'bg-slate-900/80 backdrop-blur-sm',
              'border border-slate-700/50',
              'text-white placeholder:text-slate-500',
              'transition-all duration-300',
              'focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20',
              'hover:border-slate-600',
              icon && 'pl-10',
              isPassword && 'pr-10',
              error && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-1.5 text-red-400 text-sm"
            >
              <AlertCircle size={14} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';
