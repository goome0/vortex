'use client';

import { cn, parseLocalDatetimeValue, toLocalDatetimeValue } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type DateTimePickerProps = {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  minuteStep?: number;
  className?: string;
  locale?: string;
  weekStartsOn?: 'sunday' | 'monday';
};

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

function getMonthMatrix(
  year: number,
  month: number,
  weekStartsOn: 'sunday' | 'monday'
): Array<{ date: Date; inMonth: boolean }> {
  const first = new Date(year, month, 1);
  const firstDow = first.getDay(); // 0..6 (Sun..Sat)
  const offset = weekStartsOn === 'monday' ? (firstDow + 6) % 7 : firstDow;
  const start = new Date(year, month, 1 - offset);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return { date: d, inMonth: d.getMonth() === month };
  });
}

export function DateTimePicker({
  className,
  label,
  error,
  icon,
  value,
  onChange,
  placeholder = 'mm/dd/yyyy --:--',
  disabled,
  clearable = true,
  minuteStep = 1,
  locale = 'en-US',
  weekStartsOn = 'sunday',
}: DateTimePickerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    top: 0,
    left: 0,
    width: 0,
    visibility: 'hidden',
  });

  const selectedDate = useMemo(() => parseLocalDatetimeValue(value), [value]);
  const displayValue = useMemo(() => {
    if (!value) return '';
    const d = parseLocalDatetimeValue(value);
    if (!d) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    // Keep 24h time to match backend expectations and existing UI.
    return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }, [value]);

  const [viewYear, setViewYear] = useState(() => (selectedDate ?? new Date()).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (selectedDate ?? new Date()).getMonth());
  const [hour, setHour] = useState(() => (selectedDate ?? new Date()).getHours());
  const [minute, setMinute] = useState(() => (selectedDate ?? new Date()).getMinutes());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !mounted) return;

    const update = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const padding = 8;
      const width = rect.width;
      const maxLeft = Math.max(padding, window.innerWidth - padding - width);
      const left = Math.min(maxLeft, Math.max(padding, rect.left));
      const top = rect.bottom + 8;

      setPopoverStyle({
        position: 'fixed',
        top,
        left,
        width,
        visibility: 'visible',
      });
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, mounted]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const el = rootRef.current;
      const popover = popoverRef.current;
      const target = e.target as Node;
      if (el && el.contains(target)) return;
      if (popover && popover.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const matrix = useMemo(() => getMonthMatrix(viewYear, viewMonth, weekStartsOn), [viewYear, viewMonth, weekStartsOn]);
  const monthLabel = useMemo(() => {
    return new Date(viewYear, viewMonth, 1).toLocaleString(locale, { month: 'long', year: 'numeric' });
  }, [locale, viewYear, viewMonth]);

  const selectedYmd = selectedDate
    ? `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`
    : null;

  const applyDateTime = (next: Date) => {
    const steppedMinute = minuteStep > 1 ? Math.round(next.getMinutes() / minuteStep) * minuteStep : next.getMinutes();
    next.setMinutes(clampInt(steppedMinute, 0, 59));
    next.setSeconds(0, 0);
    onChange(toLocalDatetimeValue(next));
  };

  const applyDay = (d: Date) => {
    const base = selectedDate ?? new Date();
    const next = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour ?? base.getHours(), minute ?? base.getMinutes(), 0, 0);
    applyDateTime(next);
    setOpen(false);
  };

  const adjustMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const setTime = (nextHour: number, nextMinute: number) => {
    setHour(nextHour);
    setMinute(nextMinute);
    const base = selectedDate ?? new Date();
    const next = new Date(base.getFullYear(), base.getMonth(), base.getDate(), nextHour, nextMinute, 0, 0);
    applyDateTime(next);
  };

  return (
    <div className="w-full space-y-1.5" ref={rootRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1">
          {label}
        </label>
      )}

      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white drop-shadow-sm group-focus-within:text-cyan-300 transition-colors">
          {icon ?? <CalendarIcon className="w-5 h-5" />}
        </div>

        <button
          type="button"
          ref={anchorRef}
          disabled={disabled}
          onClick={() => {
            setOpen((v) => {
              const next = !v;
              if (next) {
                const base = selectedDate ?? new Date();
                setViewYear(base.getFullYear());
                setViewMonth(base.getMonth());
                setHour(base.getHours());
                setMinute(base.getMinutes());
              }
              return next;
            });
          }}
          className={cn(
            'w-full px-4 py-3 rounded-lg text-left',
            'bg-slate-900/80 backdrop-blur-sm',
            'border border-slate-700/50',
            'text-white placeholder:text-slate-500',
            'transition-all duration-300',
            'focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20',
            'hover:border-slate-600',
            'pl-10',
            clearable && value && 'pr-10',
            error && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30',
            disabled && 'opacity-60 cursor-not-allowed hover:border-slate-700/50',
            className
          )}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span className={value ? 'text-white' : 'text-slate-500'}>
            {value ? displayValue : placeholder}
          </span>
        </button>

        {clearable && value && !disabled && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Clear date"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {mounted &&
          createPortal(
            <AnimatePresence>
              {open && (
                <motion.div
                  ref={popoverRef}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  style={popoverStyle}
                  className="z-[1000] rounded-xl border border-slate-700/50 bg-slate-950/95 backdrop-blur-xl shadow-2xl overflow-hidden"
                  role="dialog"
                >
                  <div className="px-2 py-1.5 border-b border-slate-800 flex items-center justify-between gap-1">
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-slate-800/60 text-slate-200 transition-colors"
                      onClick={() => adjustMonth(-1)}
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <div className="text-xs font-semibold text-white capitalize truncate">
                      {monthLabel}
                    </div>
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-slate-800/60 text-slate-200 transition-colors"
                      onClick={() => adjustMonth(1)}
                      aria-label="Next month"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-2">
                    <div className="grid grid-cols-7 gap-0.5 text-[10px] text-slate-400 mb-1">
                    {(weekStartsOn === 'monday'
                      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                    ).map((w) => (
                      <div key={w} className="text-center py-0.5">
                        {w}
                      </div>
                    ))}
                  </div>

                    <div className="grid grid-cols-7 gap-0.5">
                      {matrix.map(({ date, inMonth }) => {
                        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                        const isSelected = selectedYmd === key;
                        const isToday = (() => {
                          const t = new Date();
                          return (
                            t.getFullYear() === date.getFullYear() &&
                            t.getMonth() === date.getMonth() &&
                            t.getDate() === date.getDate()
                          );
                        })();

                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => applyDay(date)}
                            className={cn(
                              'h-7 rounded text-xs transition-colors',
                              'hover:bg-slate-800/60',
                              inMonth ? 'text-slate-100' : 'text-slate-600',
                              isToday && 'ring-1 ring-cyan-500/30',
                              isSelected && 'bg-cyan-500/15 text-white ring-1 ring-cyan-500/40 hover:bg-cyan-500/20'
                            )}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Time</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={23}
                          value={hour}
                          onChange={(e) => setTime(clampInt(Number(e.target.value), 0, 23), minute)}
                          className={cn(
                            'w-11 px-1.5 py-1 rounded text-center text-xs',
                            'bg-slate-900/70 border border-slate-700/50 text-white',
                            'focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20'
                          )}
                        />
                        <span className="text-slate-400">:</span>
                        <input
                          type="number"
                          min={0}
                          max={59}
                          step={minuteStep}
                          value={minute}
                          onChange={(e) => setTime(hour, clampInt(Number(e.target.value), 0, 59))}
                          className={cn(
                            'w-11 px-1.5 py-1 rounded text-center text-xs',
                            'bg-slate-900/70 border border-slate-700/50 text-white',
                            'focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20'
                          )}
                        />
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        className="px-2 py-1.5 rounded text-xs bg-slate-800/50 hover:bg-slate-800/80 text-slate-100 transition-colors"
                        onClick={() => {
                          const now = new Date();
                          applyDateTime(now);
                          setOpen(false);
                        }}
                      >
                        Now
                      </button>

                      <button
                        type="button"
                        className="px-2 py-1.5 rounded text-xs bg-cyan-500/15 hover:bg-cyan-500/20 text-cyan-100 border border-cyan-500/30 transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
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
