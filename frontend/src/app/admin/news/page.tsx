'use client';

import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Badge, Button, Input, LoadingSpinner } from '@/components/atoms';
import { Card, CardContent } from '@/components/molecules';
import { adminNewsApi, getErrorMessage } from '@/lib/api';
import { RichHtmlEditor } from '@/components/organisms';
import { Newspaper, Plus, Save, Trash2, Star, Eye, EyeOff, Search, RefreshCw } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';
import { cn } from '@/lib/utils';

type NewsAdminItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  badgeVariant: 'default' | 'info' | 'warning' | 'danger';
  featured: boolean;
  readTime: string | null;
  imageUrl: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdByUsername: string | null;
  updatedByUsername: string | null;
  createdAt: string;
  updatedAt: string;
};

type CreateNewsForm = {
  title: string;
  category: string;
  badgeVariant: NewsAdminItem['badgeVariant'];
  excerpt: string;
  contentHtml: string;
  imageUrl: string;
  featured: boolean;
  isPublished: boolean;
};

function formatDate(s: string | null | undefined): string {
  if (!s) return '';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return String(s);
  return d.toISOString().slice(0, 10);
}

function variantToBadge(variant: NewsAdminItem['badgeVariant']): 'default' | 'info' | 'warning' | 'danger' {
  return variant ?? 'default';
}

function htmlToNullable(html: string): string | null {
  const raw = String(html ?? '').trim();
  if (!raw) return null;
  // TipTap often returns "<p></p>" for empty docs.
  if (/^<p>\s*<\/p>$/i.test(raw)) return null;
  return raw;
}

function sanitizeNewsHtml(rawHtml: string): string {
  return DOMPurify.sanitize(String(rawHtml ?? ''), {
    USE_PROFILES: { html: true },
    ADD_TAGS: ['video', 'source'],
    ADD_ATTR: [
      'controls',
      'preload',
      'playsinline',
      'src',
      'href',
      'target',
      'rel',
      'class',
      'style',
      'colspan',
      'rowspan',
    ],
  });
}

export default function AdminNewsPage() {
  const qc = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [published, setPublished] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [featured, setFeatured] = useState<'ALL' | 'FEATURED' | 'NOT_FEATURED'>('ALL');
  const [badgeVariant, setBadgeVariant] = useState<'ALL' | 'default' | 'info' | 'warning' | 'danger'>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const headerCheckboxRef = useRef<HTMLInputElement | null>(null);
  const [bulkError, setBulkError] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [contentDraftById, setContentDraftById] = useState<Record<string, string>>({});
  const [showCreatePreview, setShowCreatePreview] = useState(false);
  const [showPreviewById, setShowPreviewById] = useState<Record<string, boolean>>({});

  const [create, setCreate] = useState<CreateNewsForm>({
    title: '',
    category: 'Major Update',
    badgeVariant: 'danger',
    excerpt: '',
    contentHtml: '',
    imageUrl: '',
    featured: false,
    isPublished: true,
  });

  const listQuery = useQuery({
    queryKey: ['admin', 'news', 'list', { page, limit, q: debouncedSearch, category, published, featured, badgeVariant }],
    queryFn: async () => {
      const res = await adminNewsApi.list({
        q: debouncedSearch.trim() || undefined,
        category: category.trim() || undefined,
        published: published === 'ALL' ? undefined : published === 'PUBLISHED',
        featured: featured === 'ALL' ? undefined : featured === 'FEATURED',
        badgeVariant: badgeVariant === 'ALL' ? undefined : badgeVariant,
        page,
        limit,
      });
      return (res.data?.data ?? { items: [], total: 0, page, limit }) as {
        items: NewsAdminItem[];
        total: number;
        page: number;
        limit: number;
      };
    },
  });

  const items = useMemo(() => (listQuery.data?.items ?? []) as NewsAdminItem[], [listQuery.data]);
  const total = (listQuery.data?.total ?? 0) as number;
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, published, featured, badgeVariant, limit]);

  useEffect(() => {
    setSelectedIds(new Set());
    setBulkError('');
  }, [page, debouncedSearch, category, published, featured, badgeVariant, limit]);

  useEffect(() => {
    if (!expandedId) return;
    if (items.some((n) => n.id === expandedId)) return;
    setExpandedId(null);
  }, [expandedId, items]);

  const pageIds = useMemo(() => items.map((n) => n.id), [items]);
  const allSelectedOnPage = useMemo(
    () => pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id)),
    [pageIds, selectedIds]
  );
  const someSelectedOnPage = useMemo(
    () => pageIds.some((id) => selectedIds.has(id)) && !allSelectedOnPage,
    [pageIds, selectedIds, allSelectedOnPage]
  );

  useEffect(() => {
    if (!headerCheckboxRef.current) return;
    headerCheckboxRef.current.indeterminate = someSelectedOnPage;
  }, [someSelectedOnPage]);

  const toggleSelectAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelectedOnPage) {
        for (const id of pageIds) next.delete(id);
        return next;
      }
      for (const id of pageIds) next.add(id);
      return next;
    });
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedCount = selectedIds.size;

  const runBulkUpdate = async (fn: (id: string) => Promise<unknown>) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkLoading(true);
    setBulkError('');
    try {
      await Promise.all(ids.map((id) => fn(id)));
      setSelectedIds(new Set());
      await qc.invalidateQueries({ queryKey: ['admin', 'news', 'list'] });
    } catch (e: unknown) {
      setBulkError(getErrorMessage(e));
    } finally {
      setBulkLoading(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      return adminNewsApi.create({
        title: create.title,
        category: create.category || undefined,
        badgeVariant: create.badgeVariant,
        excerpt: create.excerpt || undefined,
        contentHtml: create.contentHtml || undefined,
        imageUrl: create.imageUrl || undefined,
        featured: create.featured,
        isPublished: create.isPublished,
      });
    },
    onSuccess: async () => {
      setCreate((p) => ({ ...p, title: '', excerpt: '', contentHtml: '', imageUrl: '', featured: false }));
      setShowCreatePreview(false);
      await qc.invalidateQueries({ queryKey: ['admin', 'news', 'list'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Parameters<typeof adminNewsApi.update>[0]) => adminNewsApi.update(data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'news', 'list'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => adminNewsApi.delete(id),
    onSuccess: async () => {
      setExpandedId(null);
      await qc.invalidateQueries({ queryKey: ['admin', 'news', 'list'] });
    },
  });

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Newspaper className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white">News</h1>
            <p className="text-slate-400">Full CRUD for announcements/news (visible on page /news and in the updater).</p>
          </div>
        </div>
      </motion.div>

      {/* Create */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-slate-400" /> Create News
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant={create.isPublished ? 'outline' : 'ghost'}
                onClick={() => setCreate((p) => ({ ...p, isPublished: !p.isPublished }))}
              >
                {create.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {create.isPublished ? 'Published' : 'Draft'}
              </Button>
              <Button
                variant={create.featured ? 'outline' : 'ghost'}
                onClick={() => setCreate((p) => ({ ...p, featured: !p.featured }))}
              >
                <Star className="w-4 h-4" />
                Featured
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Input
              label="Title"
              value={create.title}
              onChange={(e) => setCreate((p) => ({ ...p, title: e.target.value }))}
              placeholder="Ex: Season 4 is live!"
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300 mb-1">Category / Variant</label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600"
                  value={create.category}
                  onChange={(e) => setCreate((p) => ({ ...p, category: e.target.value }))}
                >
                  <option>Major Update</option>
                  <option>Event</option>
                  <option>Content</option>
                  <option>Maintenance</option>
                  <option>Patch Notes</option>
                </select>
                <select
                  className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600"
                  value={create.badgeVariant}
                  onChange={(e) =>
                    setCreate((p) => ({ ...p, badgeVariant: e.target.value as NewsAdminItem['badgeVariant'] }))
                  }
                >
                  <option value="danger">danger</option>
                  <option value="warning">warning</option>
                  <option value="info">info</option>
                  <option value="default">default</option>
                </select>
              </div>
            </div>
          </div>

          <Input
            label="Image URL (optional)"
            value={create.imageUrl}
            onChange={(e) => setCreate((p) => ({ ...p, imageUrl: e.target.value }))}
            placeholder="https://..."
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300 mb-1">Excerpt</label>
            <textarea
              className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white placeholder:text-slate-500 transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600 min-h-[90px]"
              value={create.excerpt}
              onChange={(e) => setCreate((p) => ({ ...p, excerpt: e.target.value }))}
              placeholder="Short summary that appears on the cards"
            />
          </div>

          <RichHtmlEditor
            label="Content (HTML)"
            value={create.contentHtml}
            onChange={(nextHtml) => setCreate((p) => ({ ...p, contentHtml: nextHtml }))}
            placeholder="Write your news content here..."
            minHeightClassName="min-h-[260px]"
          />

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant={showCreatePreview ? 'outline' : 'ghost'}
              size="sm"
              onClick={() => setShowCreatePreview((v) => !v)}
            >
              {showCreatePreview ? 'Hide preview' : 'Preview'}
            </Button>
          </div>

          {showCreatePreview && (
            <div className="rounded-xl border border-slate-800/60 bg-slate-950/30 p-4">
              <div
                className="prose prose-invert max-w-none prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-table:border prose-table:border-slate-700/60 prose-th:border prose-th:border-slate-700/60 prose-td:border prose-td:border-slate-700/60"
                dangerouslySetInnerHTML={{ __html: sanitizeNewsHtml(create.contentHtml) }}
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            {createMutation.isError && (
              <span className="text-sm text-red-400">{getErrorMessage(createMutation.error)}</span>
            )}
            <Button
              variant="outline"
              disabled={!create.title.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
              Create
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">All News</h2>
              <p className="text-slate-400 text-sm mt-1">
                <span className="text-white font-medium">{total}</span> total news
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  if (page === 1) void listQuery.refetch();
                  else setPage(1);
                }}
                disabled={listQuery.isFetching}
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              {listQuery.isFetching && <LoadingSpinner size="sm" />}
            </div>
          </div>

          {bulkError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-start justify-between gap-4">
              <div className="text-sm">{bulkError}</div>
              <button
                type="button"
                className="text-red-300 hover:text-red-200 transition-colors"
                onClick={() => setBulkError('')}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end">
            <div className="lg:col-span-2 space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, slug, excerpt..."
                  className="w-full pl-9 pr-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white placeholder:text-slate-500 transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600"
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <Input
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="(optional)"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Published</label>
              <select
                value={published}
                onChange={(e) => setPublished(e.target.value as typeof published)}
                className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600"
              >
                <option value="ALL">All</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Featured</label>
              <select
                value={featured}
                onChange={(e) => setFeatured(e.target.value as typeof featured)}
                className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600"
              >
                <option value="ALL">All</option>
                <option value="FEATURED">Featured</option>
                <option value="NOT_FEATURED">Not featured</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Badge Variant</label>
              <select
                value={badgeVariant}
                onChange={(e) => setBadgeVariant(e.target.value as typeof badgeVariant)}
                className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600"
              >
                <option value="ALL">All</option>
                <option value="default">default</option>
                <option value="info">info</option>
                <option value="warning">warning</option>
                <option value="danger">danger</option>
              </select>
            </div>
          </div>

          {selectedCount > 0 && (
            <div className="rounded-xl border border-slate-800/60 bg-slate-950/30 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-slate-300">
                Selected <span className="text-white font-semibold">{selectedCount}</span>
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={bulkLoading}
                  onClick={() => runBulkUpdate((id) => adminNewsApi.update({ id, isPublished: true }))}
                >
                  <Eye className="w-4 h-4" />
                  Publish
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={bulkLoading}
                  onClick={() => runBulkUpdate((id) => adminNewsApi.update({ id, isPublished: false }))}
                >
                  <EyeOff className="w-4 h-4" />
                  Unpublish
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={bulkLoading}
                  onClick={() => runBulkUpdate((id) => adminNewsApi.update({ id, featured: true }))}
                >
                  <Star className="w-4 h-4" />
                  Feature
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={bulkLoading}
                  onClick={() => runBulkUpdate((id) => adminNewsApi.update({ id, featured: false }))}
                >
                  <Star className="w-4 h-4" />
                  Unfeature
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={bulkLoading}
                  onClick={() => {
                    if (!confirm(`Delete ${selectedCount} news item(s)? This cannot be undone.`)) return;
                    void runBulkUpdate((id) => adminNewsApi.delete(id));
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {listQuery.isError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
              {getErrorMessage(listQuery.error)}
            </div>
          )}

          {items.length === 0 && !listQuery.isLoading && (
            <p className="text-slate-500">No news yet.</p>
          )}

          <div className="overflow-x-auto rounded-xl border border-slate-800/60 bg-slate-900/40">
            <table className="w-full min-w-[920px]">
              <thead>
                <tr className="border-b border-slate-800/60">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-slate-400 w-[44px]">
                    <input
                      ref={headerCheckboxRef}
                      type="checkbox"
                      checked={allSelectedOnPage}
                      onChange={toggleSelectAllOnPage}
                      className="h-4 w-4 accent-cyan-500"
                      aria-label="Select all on page"
                    />
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-slate-400">Title</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-slate-400 w-[160px]">Category</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-slate-400 w-[120px]">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-slate-400 w-[120px]">Featured</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-slate-400 w-[120px]">Updated</th>
                  <th className="py-3 px-4 text-right text-sm font-semibold text-slate-400 w-[420px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.flatMap((n, idx) => {
                  const expanded = expandedId === n.id;
                  const rows: ReactElement[] = [];

                  rows.push(
                    <motion.tr
                      key={n.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                      className={cn('border-b border-slate-800/60 hover:bg-slate-800/20 transition-colors')}
                    >
                      <td className="py-3 px-4 align-top">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(n.id)}
                          onChange={() => toggleSelected(n.id)}
                          className="h-4 w-4 accent-cyan-500"
                          aria-label={`Select ${n.title}`}
                        />
                      </td>
                      <td className="py-3 px-4 align-top">
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            slug: <span className="text-slate-300">{n.slug}</span> •{' '}
                            {formatDate(n.publishedAt ?? n.updatedAt ?? n.createdAt)}
                          </p>
                          {n.excerpt && <p className="text-sm text-slate-400 mt-1 line-clamp-1">{n.excerpt}</p>}
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top">
                        <Badge variant={variantToBadge(n.badgeVariant)}>{n.category ?? 'News'}</Badge>
                      </td>
                      <td className="py-3 px-4 align-top">
                        <Badge variant={n.isPublished ? 'success' : 'warning'}>{n.isPublished ? 'Published' : 'Draft'}</Badge>
                      </td>
                      <td className="py-3 px-4 align-top">
                        {n.featured ? <Badge variant="danger">Featured</Badge> : <span className="text-slate-500 text-sm">-</span>}
                      </td>
                      <td className="py-3 px-4 align-top text-sm text-slate-300">{formatDate(n.updatedAt ?? n.createdAt)}</td>
                      <td className="py-3 px-4 align-top">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (expanded) {
                                setExpandedId(null);
                                return;
                              }
                              setContentDraftById((p) => (p[n.id] !== undefined ? p : { ...p, [n.id]: n.content ?? '' }));
                              setExpandedId(n.id);
                            }}
                          >
                            {expanded ? 'Close' : 'Edit'}
                          </Button>
                          {expanded && (
                            <Button
                              type="button"
                              variant={showPreviewById[n.id] ? 'outline' : 'ghost'}
                              size="sm"
                              onClick={() => setShowPreviewById((p) => ({ ...p, [n.id]: !p[n.id] }))}
                            >
                              {showPreviewById[n.id] ? 'Hide preview' : 'Preview'}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateMutation.mutate({ id: n.id, isPublished: !n.isPublished })}
                            disabled={updateMutation.isPending}
                          >
                            {n.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {n.isPublished ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button
                            variant={n.featured ? 'outline' : 'ghost'}
                            size="sm"
                            onClick={() => updateMutation.mutate({ id: n.id, featured: !n.featured })}
                            disabled={updateMutation.isPending}
                          >
                            <Star className="w-4 h-4" />
                            {n.featured ? 'Featured' : 'Feature'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400"
                            onClick={() => {
                              if (confirm(`Delete "${n.title}"?`)) deleteMutation.mutate(n.id);
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );

                  if (expanded) {
                    rows.push(
                      <tr key={`${n.id}__expanded`} className="border-b border-slate-800/60">
                        <td colSpan={7} className="p-4 bg-slate-950/30">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <Input
                                label="Title"
                                defaultValue={n.title}
                                onBlur={(e) => {
                                  const v = e.target.value.trim();
                                  if (v && v !== n.title) updateMutation.mutate({ id: n.id, title: v });
                                }}
                              />
                              <Input
                                label="Slug"
                                defaultValue={n.slug}
                                onBlur={(e) => {
                                  const v = e.target.value.trim();
                                  if (v && v !== n.slug) updateMutation.mutate({ id: n.id, slug: v });
                                }}
                              />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                                <input
                                  className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white placeholder:text-slate-500 transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600"
                                  defaultValue={n.category ?? ''}
                                  onBlur={(e) => updateMutation.mutate({ id: n.id, category: e.target.value.trim() || null })}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-slate-300 mb-1">Badge Variant</label>
                                <select
                                  className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600"
                                  defaultValue={n.badgeVariant}
                                  onChange={(e) =>
                                    updateMutation.mutate({
                                      id: n.id,
                                      badgeVariant: e.target.value as NewsAdminItem['badgeVariant'],
                                    })
                                  }
                                >
                                  <option value="danger">danger</option>
                                  <option value="warning">warning</option>
                                  <option value="info">info</option>
                                  <option value="default">default</option>
                                </select>
                              </div>
                            </div>

                            <Input
                              label="Image URL"
                              defaultValue={n.imageUrl ?? ''}
                              onBlur={(e) => updateMutation.mutate({ id: n.id, imageUrl: e.target.value.trim() || null })}
                            />

                            <div className="space-y-1.5">
                              <label className="block text-sm font-medium text-slate-300 mb-1">Excerpt</label>
                              <textarea
                                className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white placeholder:text-slate-500 transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600 min-h-[90px]"
                                defaultValue={n.excerpt ?? ''}
                                onBlur={(e) => updateMutation.mutate({ id: n.id, excerpt: e.target.value.trim() || null })}
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-sm font-medium text-slate-300 mb-1">Content (HTML)</label>
                              <RichHtmlEditor
                                value={contentDraftById[n.id] ?? n.content ?? ''}
                                onChange={(nextHtml) => setContentDraftById((p) => ({ ...p, [n.id]: nextHtml }))}
                                placeholder="Write content..."
                                minHeightClassName="min-h-[260px]"
                              />
                              <div className="flex items-center justify-end pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    updateMutation.mutate({
                                      id: n.id,
                                      contentHtml: htmlToNullable(contentDraftById[n.id] ?? n.content ?? ''),
                                    })
                                  }
                                  disabled={updateMutation.isPending}
                                >
                                  <Save className="w-4 h-4" />
                                  Save content
                                </Button>
                              </div>

                              {!!showPreviewById[n.id] && (
                                <div className="rounded-xl border border-slate-800/60 bg-slate-950/30 p-4 mt-2">
                                  <div
                                    className="prose prose-invert max-w-none prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-table:border prose-table:border-slate-700/60 prose-th:border prose-th:border-slate-700/60 prose-td:border prose-td:border-slate-700/60"
                                    dangerouslySetInnerHTML={{
                                      __html: sanitizeNewsHtml(contentDraftById[n.id] ?? n.content ?? ''),
                                    }}
                                  />
                                </div>
                              )}
                            </div>

                            {updateMutation.isError && <div className="text-sm text-red-400">{getErrorMessage(updateMutation.error)}</div>}
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return rows;
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="text-xs text-slate-500">
                Total <span className="text-slate-200">{total}</span> • Page{' '}
                <span className="text-slate-200">{page}</span> of{' '}
                <span className="text-slate-200">{totalPages}</span>
              </p>

              <div className="w-full sm:w-40 space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Items per page</label>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(parseInt(e.target.value, 10) || 25);
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || listQuery.isLoading}
              >
                Prev
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || listQuery.isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
