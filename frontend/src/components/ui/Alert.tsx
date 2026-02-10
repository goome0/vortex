'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { ReactNode, useState } from 'react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const variantStyles: Record<AlertVariant, string> = {
  info: 'bg-blue-950/50 border-blue-500/30 text-blue-100',
  success: 'bg-green-950/50 border-green-500/30 text-green-100',
  warning: 'bg-yellow-950/50 border-yellow-500/30 text-yellow-100',
  error: 'bg-red-950/50 border-red-500/30 text-red-100',
};

const variantIcons: Record<AlertVariant, ReactNode> = {
  info: <Info className="w-5 h-5 text-blue-400" />,
  success: <CheckCircle className="w-5 h-5 text-green-400" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
  error: <AlertCircle className="w-5 h-5 text-red-400" />,
};

export function Alert({
  variant = 'info',
  title,
  children,
  className,
  dismissible = false,
  onDismiss,
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'relative rounded-lg border p-4',
        'backdrop-blur-sm',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {variantIcons[variant]}
        </div>
        <div className="flex-grow">
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          <div className="text-sm opacity-90">{children}</div>
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
