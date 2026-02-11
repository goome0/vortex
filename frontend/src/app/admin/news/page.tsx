'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Badge, Button, Card, CardContent, Input, LoadingSpinner } from '@/components/ui';
import { adminNewsApi, getErrorMessage } from '@/lib/api';
import { Newspaper, Plus, Save, Trash2, Star, Eye, EyeOff } from 'lucide-react';

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

function formatDate(s: string | null | undefined): string {
  if (!s) return '';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return String(s);
  return d.toISOString().slice(0, 10);
}

function variantToBadge(variant: NewsAdminItem['badgeVariant']): 'default' | 'info' | 'warning' | 'danger' {
  return variant ?? 'default';
}

export default function AdminNewsPage() {
  const qc = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [create, setCreate] = useState({
    title: '',
    category: 'Major Update',
    badgeVariant: 'danger' as const,
    excerpt: '',
    content: '',
    imageUrl: '',
    featured: false,
    isPublished: true,
  });

  const listQuery = useQuery({
    queryKey: ['admin', 'news', 'list'],
    queryFn: async () => {
      const res = await adminNewsApi.list({ limit: 200 });
      return (res.data?.data ?? []) as NewsAdminItem[];
    },
  });

  const items = useMemo(() => listQuery.data ?? [], [listQuery.data]);

  const createMutation = useMutation({
    mutationFn: async () => {
      return adminNewsApi.create({
        title: create.title,
        category: create.category || undefined,
        badgeVariant: create.badgeVariant,
        excerpt: create.excerpt || undefined,
        content: create.content || undefined,
        imageUrl: create.imageUrl || undefined,
        featured: create.featured,
        isPublished: create.isPublished,
      });
    },
    onSuccess: async () => {
      setCreate((p) => ({ ...p, title: '', excerpt: '', content: '', imageUrl: '', featured: false }));
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
                  onChange={(e) => setCreate((p) => ({ ...p, badgeVariant: e.target.value as any }))}
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

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300 mb-1">Content</label>
            <textarea
              className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white placeholder:text-slate-500 transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600 min-h-[160px]"
              value={create.content}
              onChange={(e) => setCreate((p) => ({ ...p, content: e.target.value }))}
              placeholder="Content (line breaks are supported)."
            />
          </div>

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
                      <Button variant="ghost" onClick={() => setExpandedId(expanded ? null : n.id)}>
                        {expanded ? 'Close' : 'Edit'}
                      </Button>
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
                            onChange={(e) => updateMutation.mutate({ id: n.id, badgeVariant: e.target.value as any })}
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
                        <label className="block text-sm font-medium text-slate-300 mb-1">Content</label>
                        <textarea
                          className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white placeholder:text-slate-500 transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600 min-h-[160px]"
                          defaultValue={n.content ?? ''}
                          onBlur={(e) => updateMutation.mutate({ id: n.id, content: e.target.value || null })}
                        />
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
        </CardContent>
      </Card>
    </div>
  );
}

