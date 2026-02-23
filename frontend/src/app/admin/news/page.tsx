'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Badge, Button, Card, CardContent, Input, LoadingSpinner } from '@/components/ui';
import { adminNewsApi, getErrorMessage } from '@/lib/api';
import { RichHtmlEditor } from '@/components/admin/RichHtmlEditor';
import { Newspaper, Plus, Save, Trash2, Star, Eye, EyeOff } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';

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
    queryKey: ['admin', 'news', 'list', { page, limit }],
    queryFn: async () => {
      const res = await adminNewsApi.list({ page, limit });
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
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-white">All News</h2>
            {listQuery.isLoading && <LoadingSpinner size="sm" />}
          </div>

          {listQuery.isError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
              {getErrorMessage(listQuery.error)}
            </div>
          )}

          {items.length === 0 && !listQuery.isLoading && (
            <p className="text-slate-500">No news yet.</p>
          )}

          <div className="space-y-3">
            {items.map((n) => {
              const expanded = expandedId === n.id;
              return (
                <div key={n.id} className="rounded-xl border border-slate-800/60 bg-slate-900/40 overflow-hidden">
                  <div className="p-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-white truncate max-w-[520px]">{n.title}</h3>
                        <Badge variant={variantToBadge(n.badgeVariant)}>{n.category ?? 'News'}</Badge>
                        {n.featured && <Badge variant="danger">Featured</Badge>}
                        <Badge variant={n.isPublished ? 'success' : 'warning'}>
                          {n.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        slug: <span className="text-slate-300">{n.slug}</span> • {formatDate(n.publishedAt ?? n.createdAt)}
                      </p>
                      {n.excerpt && <p className="text-sm text-slate-400 mt-2 line-clamp-2">{n.excerpt}</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          if (expanded) {
                            setExpandedId(null);
                            return;
                          }
                          setContentDraftById((p) =>
                            p[n.id] !== undefined ? p : { ...p, [n.id]: n.content ?? '' },
                          );
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
                        onClick={() => updateMutation.mutate({ id: n.id, isPublished: !n.isPublished })}
                        disabled={updateMutation.isPending}
                      >
                        {n.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {n.isPublished ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button
                        variant={n.featured ? 'outline' : 'ghost'}
                        onClick={() => updateMutation.mutate({ id: n.id, featured: true })}
                        disabled={updateMutation.isPending}
                        title="Set as featured (only one)"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-red-400"
                        onClick={() => {
                          if (confirm(`Delete "${n.title}"?`)) deleteMutation.mutate(n.id);
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="border-t border-slate-800/60 p-4 space-y-4">
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

                      {updateMutation.isError && (
                        <div className="text-sm text-red-400">{getErrorMessage(updateMutation.error)}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
