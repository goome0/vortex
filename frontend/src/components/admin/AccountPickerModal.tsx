'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Users, X, UserCircle } from 'lucide-react';
import { adminApi, getErrorMessage } from '@/lib/api';
import { Alert, Badge, Button, Input, LoadingSpinner } from '@/components/ui';

type AccountLite = {
  username: string;
  email?: string | null;
  disp_name?: string | null;
  enabled?: boolean | null;
};

type CharacterLookupResult = {
  username: string;
  characterName: string;
  worldId: number | null;
};

function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

export function AccountPickerModal({
  open,
  initialSelectedUsernames,
  title = 'Select users',
  onClose,
  onApply,
}: {
  open: boolean;
  initialSelectedUsernames: string[];
  title?: string;
  onClose: () => void;
  onApply: (usernames: string[]) => void;
}) {
  const [searchMode, setSearchMode] = useState<'username' | 'character'>('username');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [accounts, setAccounts] = useState<AccountLite[]>([]);
  const [characterLookupResults, setCharacterLookupResults] = useState<CharacterLookupResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const initialKey = useMemo(() => initialSelectedUsernames.map(normalizeUsername).sort().join('\n'), [initialSelectedUsernames]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const headerCheckboxRef = useRef<HTMLInputElement | null>(null);

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setCharacterLookupResults([]);
    try {
      const { data: response } = await adminApi.getAccounts({
        q: query.trim() || undefined,
        page,
        limit,
      });
      const items = (response.data?.items ?? []) as AccountLite[];
      setAccounts(items);
      setTotal((response.data?.total ?? items.length) as number);
    } catch (e) {
      setError(getErrorMessage(e));
      setAccounts([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [query, page, limit]);

  const fetchByCharacterName = useCallback(async () => {
    const charName = query.trim();
    if (!charName) return;
    setIsLoading(true);
    setError('');
    setAccounts([]);
    try {
      const { data: response } = await adminApi.lookupAccountByCharacterName(charName);
      const items = (response.data?.items ?? []) as CharacterLookupResult[];
      setCharacterLookupResults(items);
      setTotal(items.length);
    } catch (e) {
      setError(getErrorMessage(e));
      setCharacterLookupResults([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const selectedCount = selected.size;
  const selectedList = useMemo(() => Array.from(selected).sort(), [selected]);
  const previewSelected = useMemo(() => selectedList.slice(0, 20), [selectedList]);

  const displayItems = searchMode === 'character' ? characterLookupResults : accounts;
  const displayUsernames = searchMode === 'character'
    ? characterLookupResults.map((r) => r.username)
    : accounts.map((a) => a.username);

  const allOnPageSelected = useMemo(() => {
    if (displayUsernames.length === 0) return false;
    return displayUsernames.every((u) => selected.has(normalizeUsername(u)));
  }, [displayUsernames, selected]);

  const someOnPageSelected = useMemo(() => {
    if (displayUsernames.length === 0) return false;
    return displayUsernames.some((u) => selected.has(normalizeUsername(u)));
  }, [displayUsernames, selected]);

  useEffect(() => {
    if (!headerCheckboxRef.current) return;
    headerCheckboxRef.current.indeterminate = !allOnPageSelected && someOnPageSelected;
  }, [allOnPageSelected, someOnPageSelected]);

  useEffect(() => {
    if (!open) return;
    setSelected(new Set(initialSelectedUsernames.map(normalizeUsername).filter(Boolean)));
    setError('');
    // Keep search input between opens only if user wants; reset page to avoid stale pagination.
    setPage(1);
  }, [open, initialKey, initialSelectedUsernames]);

  useEffect(() => {
    if (!open) return;
    if (searchMode === 'character') {
      if (query.trim()) {
        // Character mode: only fetch when user clicks Lookup (handled by runSearch)
        setCharacterLookupResults([]);
        setIsLoading(false);
      } else {
        setCharacterLookupResults([]);
        setTotal(0);
        setIsLoading(false);
      }
      return;
    }
    const t = window.setTimeout(() => fetchAccounts(), 250);
    return () => window.clearTimeout(t);
  }, [open, searchMode, query, fetchAccounts]);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setPage(1);
  }, [open, query, limit]);

  const runSearch = () => {
    if (searchMode === 'character') {
      fetchByCharacterName();
    } else {
      setPage(1);
      fetchAccounts();
    }
  };

  const toggleUsername = (username: string, next: boolean) => {
    const key = normalizeUsername(username);
    if (!key) return;
    setSelected((prev) => {
      const copy = new Set(prev);
      if (next) copy.add(key);
      else copy.delete(key);
      return copy;
    });
  };

  const toggleSelectAllOnPage = (next: boolean) => {
    setSelected((prev) => {
      const copy = new Set(prev);
      displayUsernames.forEach((u) => {
        const key = normalizeUsername(u);
        if (!key) return;
        if (next) copy.add(key);
        else copy.delete(key);
      });
      return copy;
    });
  };

  const clearAll = () => setSelected(new Set());

  const apply = () => onApply(Array.from(selected).sort());

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                {title}
              </h3>
              <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <Alert variant="error" dismissible onDismiss={() => setError('')}>
                  {error}
                </Alert>
              )}

              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Button
                    variant={searchMode === 'username' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setSearchMode('username');
                      setCharacterLookupResults([]);
                      setQuery('');
                    }}
                  >
                    <Search className="w-4 h-4" />
                    Username / Email
                  </Button>
                  <Button
                    variant={searchMode === 'character' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setSearchMode('character');
                      setAccounts([]);
                      setQuery('');
                    }}
                  >
                    <UserCircle className="w-4 h-4" />
                    Character name
                  </Button>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-end gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder={
                        searchMode === 'username'
                          ? 'Search by username/email...'
                          : 'Type character name (partial match)...'
                      }
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                      icon={<Search className="w-4 h-4" />}
                    />
                  </div>
                  {searchMode === 'character' && (
                    <Button onClick={runSearch} disabled={!query.trim() || isLoading}>
                      Lookup
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm text-slate-400">
                    Selected <span className="text-white font-medium">{selectedCount}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearAll} disabled={selectedCount === 0}>
                    Clear
                  </Button>
                </div>
              </div>

              {selectedCount > 0 && (
                <div className="flex flex-wrap gap-2">
                  {previewSelected.map((u) => (
                    <span key={u} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50">
                      <Badge>{u}</Badge>
                      <button
                        className="text-slate-400 hover:text-white"
                        onClick={() => toggleUsername(u, false)}
                        aria-label={`Remove ${u}`}
                        type="button"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                  {selectedCount > previewSelected.length && (
                    <span className="text-xs text-slate-500 self-center">+{selectedCount - previewSelected.length} more</span>
                  )}
                </div>
              )}

              <div className="overflow-x-auto rounded-xl border border-slate-800/60">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-slate-800">
                      <th className="py-3 px-4 w-10">
                        <input
                          ref={headerCheckboxRef}
                          type="checkbox"
                          checked={allOnPageSelected}
                          onChange={(e) => toggleSelectAllOnPage(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                          aria-label="Select all on page"
                        />
                      </th>
                      <th className="py-3 pr-4">Username</th>
                      {searchMode === 'username' ? (
                        <>
                          <th className="py-3 pr-4 hidden md:table-cell">Display</th>
                          <th className="py-3 pr-4 hidden lg:table-cell">Email</th>
                          <th className="py-3 pr-4 text-right">Status</th>
                        </>
                      ) : (
                        <>
                          <th className="py-3 pr-4">Character</th>
                          <th className="py-3 pr-4 text-right">World</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr>
                        <td colSpan={5} className="py-10 text-center">
                          <div className="flex items-center justify-center gap-2 text-slate-400">
                            <LoadingSpinner />
                            Loading...
                          </div>
                        </td>
                      </tr>
                    )}
                    {!isLoading &&
                      searchMode === 'username' &&
                      accounts.map((a) => {
                        const key = normalizeUsername(a.username);
                        const checked = selected.has(key);
                        const enabled = a.enabled !== false;
                        return (
                          <tr key={a.username} className="border-b border-slate-900/60 hover:bg-slate-900/30">
                            <td className="py-3 px-4 align-top">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => toggleUsername(a.username, e.target.checked)}
                                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                                aria-label={`Select ${a.username}`}
                              />
                            </td>
                            <td className="py-3 pr-4 align-top">
                              <span className="font-mono font-semibold text-white">{a.username}</span>
                            </td>
                            <td className="py-3 pr-4 align-top hidden md:table-cell">
                              <span className="text-slate-300">{a.disp_name || '—'}</span>
                            </td>
                            <td className="py-3 pr-4 align-top hidden lg:table-cell">
                              <span className="text-slate-300">{a.email || '—'}</span>
                            </td>
                            <td className="py-3 pr-4 align-top text-right">
                              <Badge variant={enabled ? 'success' : 'danger'}>{enabled ? 'Enabled' : 'Disabled'}</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    {!isLoading &&
                      searchMode === 'character' &&
                      characterLookupResults.map((r, idx) => {
                        const key = normalizeUsername(r.username);
                        const checked = selected.has(key);
                        return (
                          <tr key={`${r.username}-${r.characterName}-${idx}`} className="border-b border-slate-900/60 hover:bg-slate-900/30">
                            <td className="py-3 px-4 align-top">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => toggleUsername(r.username, e.target.checked)}
                                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                                aria-label={`Select ${r.username}`}
                              />
                            </td>
                            <td className="py-3 pr-4 align-top">
                              <span className="font-mono font-semibold text-white">{r.username}</span>
                            </td>
                            <td className="py-3 pr-4 align-top">
                              <span className="text-slate-300">{r.characterName}</span>
                            </td>
                            <td className="py-3 pr-4 align-top text-right">
                              <span className="text-slate-400">{r.worldId ?? '—'}</span>
                            </td>
                          </tr>
                        );
                      })}
                    {!isLoading && displayItems.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-500">
                          {searchMode === 'character' && !query.trim()
                            ? 'Type a character name and click Lookup.'
                            : 'No users found.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <p className="text-xs text-slate-500">
                    Total <span className="text-slate-200">{total}</span> • Page <span className="text-slate-200">{page}</span> of{' '}
                    <span className="text-slate-200">{totalPages}</span>
                  </p>
                  <select
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value, 10) || 25)}
                    className="px-3 py-2 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white text-sm transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600"
                    title="Items per page"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || isLoading}>
                    Prev
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages || isLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-6 border-t border-slate-800">
              <Button variant="ghost" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={apply} disabled={selectedCount === 0}>
                Add selected ({selectedCount})
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

