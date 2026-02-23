'use client';

import { cn } from '@/lib/utils';
import { HTMLMotionProps, motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps extends HTMLMotionProps<'div'> {
  children?: ReactNode;
  className?: string;
  variant?: 'default' | 'glow' | 'danger';
  hover?: boolean;
}

const cardVariants = {
  default: 'bg-slate-900/60 border-slate-700/50',
  glow: 'bg-slate-900/80 border-red-500/30 shadow-lg shadow-red-500/5',
  danger: 'bg-red-950/30 border-red-500/40',
};

export function Card({
  children,
  className,
  variant = 'default',
  hover = false,
  ...props
}: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.01, y: -2 } : undefined}
      transition={{ duration: 0.2 }}
      className={cn(
        'rounded-xl border backdrop-blur-md',
        'transition-all duration-300',
        hover && 'cursor-pointer hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10',
        cardVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('p-6 pb-0', className)}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('p-6 pt-0', className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn('text-xl font-bold text-white', className)}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={cn('text-slate-400 text-sm mt-1', className)}>
      {children}
    </p>
  );
}
