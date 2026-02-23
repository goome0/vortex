'use client';

import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import TextAlign from '@tiptap/extension-text-align';
import { FontSize, TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import FontFamily from '@tiptap/extension-font-family';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import CharacterCount from '@tiptap/extension-character-count';
import { CommandProps, Node, mergeAttributes } from '@tiptap/core';

import { Button, Input } from '@/components/atoms';
import { Card, CardContent } from '@/components/molecules';
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Code, Eye, Image as ImageIcon, Italic, Link as LinkIcon, List, ListOrdered, Redo, Search, Strikethrough, Table as TableIcon, Type, Underline as UnderlineIcon, Unlink, Video as VideoIcon, Undo, X, Maximize2, Minimize2, Paintbrush, Highlighter, Eraser, Minus, Plus, Smile, SquareDashed } from 'lucide-react';

type Props = {
  label?: string;
  value: string;
  onChange: (nextHtml: string) => void;
  onBlur?: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeightClassName?: string;
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (attrs: { src: string }) => ReturnType;
    };
  }
}

type DialogKind = 'link' | 'image' | 'video' | 'layout' | 'table' | 'search' | null;

type DialogState =
  | { kind: 'link'; href: string; text: string; newTab: boolean }
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'video'; src: string }
  | { kind: 'layout'; layout: 'mediaLeft' | 'mediaRight' | 'mediaTop'; src: string }
  | { kind: 'search'; q: string; replace: string; matchCase: boolean };

function normalizeUrl(raw: string): string | null {
  const v = String(raw ?? '').trim();
  if (!v) return null;
  return v;
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function pickTextInSelection(editor: any): string {
  if (!editor) return '';
  return editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, ' ');
}

type TextSpan = { from: number; to: number; textFrom: number; textTo: number };

function buildTextIndex(editor: any): { text: string; spans: TextSpan[] } {
  const spans: TextSpan[] = [];
  let text = '';
  editor.state.doc.descendants((node: any, pos: number) => {
    if (!node.isText) return true;
    const t = String(node.text ?? '');
    if (!t) return true;
    const textFrom = text.length;
    text += t;
    const textTo = text.length;
    spans.push({ from: pos, to: pos + node.nodeSize, textFrom, textTo });
    return true;
  });
  return { text, spans };
}

function findNextMatch(editor: any, q: string, fromTextIndex: number, matchCase: boolean): { from: number; to: number; nextIndex: number } | null {
  const needle = String(q ?? '');
  if (!needle) return null;
  const { text, spans } = buildTextIndex(editor);
  const hay = matchCase ? text : text.toLowerCase();
  const nd = matchCase ? needle : needle.toLowerCase();
  const start = Math.max(0, Math.min(fromTextIndex, hay.length));
  const idx = hay.indexOf(nd, start);
  const foundAt = idx >= 0 ? idx : hay.indexOf(nd, 0);
  if (foundAt < 0) return null;
  const foundTo = foundAt + nd.length;

  const mapIndexToPos = (i: number) => {
    const span = spans.find((s) => i >= s.textFrom && i < s.textTo);
    if (!span) return null;
    const offset = i - span.textFrom;
    return span.from + 1 + offset;
  };

  const from = mapIndexToPos(foundAt);
  const to = mapIndexToPos(Math.max(foundAt, foundTo - 1));
  if (from == null || to == null) return null;
  return { from, to: to + 1, nextIndex: foundAt + 1 };
}

const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return {
      src: { default: null },
      controls: { default: true },
      preload: { default: 'metadata' },
      playsinline: { default: true },
    };
  },
  parseHTML() {
    return [{ tag: 'video[src]' }];
  },
  renderHTML({ HTMLAttributes }) {
    const { controls, playsinline, preload, ...rest } = HTMLAttributes;
    return [
      'video',
      mergeAttributes(
        {
          ...(controls ? { controls: 'controls' } : {}),
          ...(playsinline ? { playsinline: 'playsinline' } : {}),
          ...(preload ? { preload } : {}),
          class: 'w-full rounded-lg border border-slate-700/50 bg-black',
        },
        rest,
      ),
    ];
  },
  addCommands() {
    return {
      setVideo:
        (attrs: { src: string }) =>
        ({ commands }: CommandProps) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});

function MenuButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className="px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-slate-700/60 transition-colors"
    >
      {children}
    </button>
  );
}

function MenuItem({ disabled, onClick, onMouseEnter, children, danger, right, className }: { disabled?: boolean; onClick?: () => void; onMouseEnter?: () => void; children: ReactNode; danger?: boolean; right?: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={[
        'w-full flex items-center justify-between gap-3 px-4 py-2 text-sm transition-colors text-left relative',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        danger ? 'text-red-300 hover:text-red-200 hover:bg-red-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/50',
        className || '',
      ].join(' ')}
    >
      <span className="flex items-center gap-2">{children}</span>
      {right && <span className="text-xs text-slate-500">{right}</span>}
    </button>
  );
}

function Modal({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative w-full max-w-3xl">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="text-lg font-bold text-white">{title}</div>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

const emojiList = ['😀', '😁', '😂', '😅', '😍', '😎', '🤔', '🔥', '✅', '⚠️', '⭐', '🎁', '🎉', '⚔️', '🛡️', '💎'];
const specialChars = ['—', '•', '…', '™', '©', '®', '✓', '✗', '→', '←', '↑', '↓', '±', '×', '÷', '∞'];
const colorSwatches = ['#ffffff', '#e2e8f0', '#94a3b8', '#64748b', '#0f172a', '#22d3ee', '#38bdf8', '#a78bfa', '#f472b6', '#fb7185', '#f97316', '#facc15', '#4ade80'];

export function RichHtmlEditor({ label, value, onChange, onBlur, placeholder, className, minHeightClassName = 'min-h-[240px]' }: Props) {
  const [mode, setMode] = useState<'visual' | 'html'>('visual');
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tableHover, setTableHover] = useState<{ rows: number; cols: number }>({ rows: 0, cols: 0 });
  const tableGridMax = { rows: 8, cols: 10 };
  const searchIndexRef = useRef(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: 'https' }),
      Image.configure({ allowBase64: false }),
      Video,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      FontFamily,
      TextStyle,
      FontSize,
      Color.configure({ types: ['textStyle'] }),
      Highlight.configure({ multicolor: true }),
      HorizontalRule,
      CharacterCount,
    ],
    content: value ?? '',
    editorProps: {
      attributes: {
        class: [
          'prose prose-invert max-w-none',
          'prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white',
          'prose-a:text-cyan-400 hover:prose-a:text-cyan-300',
          'prose-table:border prose-table:border-slate-700/60',
          'prose-th:border prose-th:border-slate-700/60 prose-td:border prose-td:border-slate-700/60',
          '[&_.selectedCell]:bg-cyan-500/20 [&_.column-resize-handle]:bg-cyan-500',
          'focus:outline-none',
          minHeightClassName,
        ].join(' '),
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onBlur: ({ editor }) => onBlur?.(editor.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    if (mode !== 'visual') return;
    const current = editor.getHTML();
    const next = value ?? '';
    if (current === next) return;
    editor.commands.setContent(next, { emitUpdate: false });
  }, [editor, value, mode]);

  useEffect(() => {
    if (!editor) return;
    if (mode !== 'visual') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dialog) {
        e.preventDefault();
        setDialog(null);
        return;
      }
      if (!e.ctrlKey && !e.metaKey) return;
      const k = e.key.toLowerCase();
      if (k === 'k') {
        e.preventDefault();
        openDialog('link');
      } else if (k === 'f') {
        e.preventDefault();
        openDialog('search');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editor, mode, dialog]);

  const inTable = !!editor?.isActive('table');
  const wordCount = editor?.storage.characterCount?.words?.() ?? 0;
  const wrapClassName = isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-4 overflow-auto' : '';
  const menubarDisabled = !editor || mode !== 'visual' || !!dialog;

  const openDialog = (kind: DialogKind) => {
    if (!editor) return;
    if (kind === 'link') {
      const existingHref = (editor.getAttributes('link')?.href as string | undefined) ?? '';
      const selectedText = pickTextInSelection(editor);
      setDialog({ kind: 'link', href: existingHref, text: selectedText || '', newTab: true })
    } else if (kind === 'image') { 
      setDialog({ kind: 'image', src: '', alt: '' }) 
    } else if (kind === 'video') { 
      setDialog({ kind: 'video', src: '' }) 
    } else if (kind === 'layout') { 
      setDialog({ kind: 'layout', layout: 'mediaLeft', src: '' }) 
    } else if (kind === 'search') {
      setDialog({ kind: 'search', q: '', replace: '', matchCase: false })
      searchIndexRef.current = 0;
    }
  };

  const insertEmoji = (e: string) => editor?.chain().focus().insertContent(e).run();
  const insertChar = (c: string) => editor?.chain().focus().insertContent(c).run();
  const setTextColor = (hex: string) => editor?.chain().focus().setColor(hex).run();
  const setHighlightColor = (hex: string) => editor?.chain().focus().toggleHighlight({ color: hex }).run();

  const closeDialog = () => setDialog(null);
  const isProbablyVideoUrl = (src: string) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(String(src ?? '').trim());

  const applyLink = () => {
    if (!editor || !dialog || dialog.kind !== 'link') return;
    const href = normalizeUrl(dialog.href);
    if (!href) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      closeDialog();
      return;
    }
    const attrs: { href: string; target?: string; rel?: string } = { href };
    if (dialog.newTab) {
      attrs.target = '_blank';
      attrs.rel = 'noopener noreferrer';
    }
    const { from, to } = editor.state.selection;
    const hasSelection = from !== to;
    if (hasSelection) {
      editor.chain().focus().extendMarkRange('link').setLink(attrs).run();
    } else {
      const text = (dialog.text || href).trim();
      editor.chain().focus().insertContent({ type: 'text', text, marks: [{ type: 'link', attrs }] }).run();
    }
    closeDialog();
  };

  const applyImage = () => {
    if (!editor || !dialog || dialog.kind !== 'image') return;
    const src = normalizeUrl(dialog.src);
    if (!src) return;
    editor.chain().focus().setImage({ src, alt: dialog.alt || '' }).run();
    closeDialog();
  };

  const applyVideo = () => {
    if (!editor || !dialog || dialog.kind !== 'video') return;
    const src = normalizeUrl(dialog.src);
    if (!src) return;
    editor.chain().focus().setVideo({ src }).run();
    closeDialog();
  };

  const applyLayout = () => {
    if (!editor || !dialog || dialog.kind !== 'layout') return;
    const src = normalizeUrl(dialog.src);
    if (!src) return;
    const isVideo = isProbablyVideoUrl(src);
    const mediaHtml = isVideo ? `<video controls preload="metadata" playsinline src="${src}"></video>` : `<img src="${src}" alt="" />`;
    if (dialog.layout === 'mediaTop') {
      editor.chain().focus().insertContent(`${mediaHtml}<p></p>`).run();
      closeDialog();
      return;
    }
    if (dialog.layout === 'mediaLeft') {
      editor
        .chain()
        .focus()
        .insertContent(`<table><tbody><tr><td>${mediaHtml}</td><td><p></p></td></tr></tbody></table><p></p>`)
        .run();
    } else {
      editor
        .chain()
        .focus()
        .insertContent(`<table><tbody><tr><td><p></p></td><td>${mediaHtml}</td></tr></tbody></table><p></p>`)
        .run();
    }
    closeDialog();
  };

  const applyTableGrid = (r: number, c: number) => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: r, cols: c, withHeaderRow: true }).run();
  };

  const findNext = () => {
    if (!editor || !dialog || dialog.kind !== 'search') return;
    const match = findNextMatch(editor, dialog.q, searchIndexRef.current, dialog.matchCase);
    if (!match) return;
    editor.commands.setTextSelection({ from: match.from, to: match.to });
    searchIndexRef.current = match.nextIndex;
  };

  const replaceOne = () => {
    if (!editor || !dialog || dialog.kind !== 'search') return;
    const selected = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, ' ');
    const q = String(dialog.q ?? '');
    const sel = dialog.matchCase ? selected : selected.toLowerCase();
    const needle = dialog.matchCase ? q : q.toLowerCase();
    if (needle && sel === needle) {
      editor.chain().focus().insertContent(String(dialog.replace ?? '')).run();
    }
    findNext();
  };

  const blockLabel = useMemo(() => {
    if (!editor) return 'Paragraph';
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    if (editor.isActive('heading', { level: 4 })) return 'Heading 4';
    if (editor.isActive('heading', { level: 5 })) return 'Heading 5';
    if (editor.isActive('heading', { level: 6 })) return 'Heading 6';
    if (editor.isActive('codeBlock')) return 'Preformatted';
    return 'Paragraph';
  }, [editor, editor?.state]);

  const currentFontSize = useMemo(() => {
    const raw = editor?.getAttributes('textStyle')?.fontSize;
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
    return '16px';
  }, [editor, editor?.state]);

  const setFontSizePx = (px: number) => {
    if (!editor) return;
    const v = Math.min(96, Math.max(8, Math.round(px)));
    editor.chain().focus().setFontSize(`${v}px`).run();
  };

  const adjustFontSize = (delta: number) => {
    const n = Number.parseInt(String(currentFontSize).replace('px', ''), 10);
    const base = Number.isFinite(n) ? n : 16;
    setFontSizePx(base + delta);
  };

  return (
    <div className={[className, wrapClassName].filter(Boolean).join(' ')}>
      {label && <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>}

      {isFullscreen && (
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-slate-400">Editor (Fullscreen)</div>
          <Button type="button" variant="outline" size="sm" onClick={() => setIsFullscreen(false)}>
            <Minimize2 className="w-4 h-4" /> Exit
          </Button>
        </div>
      )}

      <div className="mb-2 flex items-center justify-end gap-2">
        <Button type="button" variant={mode === 'visual' ? 'outline' : 'ghost'} size="sm" onClick={() => setMode('visual')}>
          <Eye className="w-4 h-4" /> Visual
        </Button>
        <Button type="button" variant={mode === 'html' ? 'outline' : 'ghost'} size="sm" onClick={() => setMode('html')}>
          <Code className="w-4 h-4" /> HTML
        </Button>
      </div>

      {mode === 'visual' && (
        <div className="mb-2 flex flex-wrap items-center gap-1 rounded-xl border border-slate-800/60 bg-slate-900/40 px-2 py-2">
          <div className="relative group">
            <MenuButton>File</MenuButton>
            <div className="absolute left-0 top-full mt-0.5 w-56 py-2 bg-slate-950 border border-slate-700/60 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
              <MenuItem
                disabled={menubarDisabled}
                onClick={() => editor?.chain().focus().setContent('', { emitUpdate: true }).run()}
              >
                New document
              </MenuItem>
              <div className="my-2 border-t border-slate-800/60" />
              <MenuItem
                disabled={menubarDisabled}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(editor?.getHTML?.() ?? '');
                  } catch {}
                }}
              >
                Copy HTML
              </MenuItem>
              <MenuItem
                disabled={menubarDisabled}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(editor?.getText?.() ?? '');
                  } catch {}
                }}
              >
                Copy text
              </MenuItem>
            </div>
          </div>

          <div className="relative group">
            <MenuButton>Edit</MenuButton>
            <div className="absolute left-0 top-full mt-0.5 w-64 py-2 bg-slate-950 border border-slate-700/60 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
              <MenuItem disabled={menubarDisabled} onClick={() => editor?.chain().focus().undo().run()} right="Ctrl+Z">
                <Undo className="w-4 h-4 text-slate-400" /> Undo
              </MenuItem>
              <MenuItem disabled={menubarDisabled} onClick={() => editor?.chain().focus().redo().run()} right="Ctrl+Y">
                <Redo className="w-4 h-4 text-slate-400" /> Redo
              </MenuItem>
              <div className="my-2 border-t border-slate-800/60" />
              <MenuItem disabled={menubarDisabled} onClick={() => openDialog('search')} right="Ctrl+F">
                <Search className="w-4 h-4 text-slate-400" /> Find & replace…
              </MenuItem>
              <MenuItem
                disabled={menubarDisabled}
                onClick={() =>
                  editor?.chain().focus().setTextSelection({ from: 0, to: editor.state.doc.content.size }).run()
                }
                right="Ctrl+A"
              >
                Select all
              </MenuItem>
            </div>
          </div>

          <div className="relative group">
            <MenuButton>View</MenuButton>
            <div className="absolute left-0 top-full mt-0.5 w-56 py-2 bg-slate-950 border border-slate-700/60 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
              <MenuItem disabled={!editor} onClick={() => setIsFullscreen((p) => !p)}>
                {isFullscreen ? <Minimize2 className="w-4 h-4 text-slate-400" /> : <Maximize2 className="w-4 h-4 text-slate-400" />}{' '}
                {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              </MenuItem>
              <div className="my-2 border-t border-slate-800/60" />
              <MenuItem disabled={!editor} onClick={() => setMode('visual')}>
                <Eye className="w-4 h-4 text-slate-400" /> Visual
              </MenuItem>
              <MenuItem disabled={!editor} onClick={() => setMode('html')}>
                <Code className="w-4 h-4 text-slate-400" /> HTML source
              </MenuItem>
            </div>
          </div>

          <div className="relative group">
            <MenuButton>Insert</MenuButton>
            <div className="absolute left-0 top-full mt-0.5 w-72 py-2 bg-slate-950 border border-slate-700/60 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
              <MenuItem disabled={menubarDisabled} onClick={() => openDialog('image')}>
                <ImageIcon className="w-4 h-4 text-slate-400" /> Image…
              </MenuItem>
              <MenuItem disabled={menubarDisabled} onClick={() => openDialog('video')}>
                <VideoIcon className="w-4 h-4 text-slate-400" /> Media (video)…
              </MenuItem>
              <MenuItem disabled={menubarDisabled} onClick={() => openDialog('link')} right="Ctrl+K">
                <LinkIcon className="w-4 h-4 text-slate-400" /> Link…
              </MenuItem>
              <MenuItem disabled={menubarDisabled} onClick={() => openDialog('layout')}>
                <SquareDashed className="w-4 h-4 text-slate-400" /> Layout…
              </MenuItem>
              <div className="my-2 border-t border-slate-800/60" />
              <MenuItem disabled={menubarDisabled} className="group/table" right="▶">
                <TableIcon className="w-4 h-4 text-slate-400" /> Insert table…
                <div className="absolute top-0 left-full ml-1 w-52 p-2 bg-slate-950 border border-slate-700/60 rounded-xl shadow-xl opacity-0 invisible group-hover/table:opacity-100 group-hover/table:visible transition-all duration-200 z-30 cursor-default">
                  <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${tableGridMax.cols}, minmax(0, 1fr))` }}>
                    {Array.from({ length: tableGridMax.rows * tableGridMax.cols }).map((_, idx) => {
                      const r = Math.floor(idx / tableGridMax.cols) + 1;
                      const c = (idx % tableGridMax.cols) + 1;
                      const active = r <= tableHover.rows && c <= tableHover.cols;
                      return (
                        <div
                          key={`${r}-${c}`}
                          onMouseEnter={() => setTableHover({ rows: r, cols: c })}
                          onClick={(e) => { e.stopPropagation(); applyTableGrid(r, c); }}
                          className={[
                            'h-4 w-4 rounded-sm border cursor-pointer',
                            active ? 'bg-cyan-500 border-cyan-500' : 'bg-slate-900 border-slate-700 hover:border-slate-500',
                          ].join(' ')}
                          aria-label={`${c}x${r}`}
                          title={`${c}x${r}`}
                        />
                      );
                    })}
                  </div>
                  <div className="mt-2 text-center text-xs font-semibold text-cyan-400">
                    {tableHover.cols}x{tableHover.rows}
                  </div>
                </div>
              </MenuItem>
              <MenuItem disabled={menubarDisabled} onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
                <Minus className="w-4 h-4 text-slate-400" /> Horizontal line
              </MenuItem>
              <div className="my-2 border-t border-slate-800/60" />
              <div className="px-4 py-2">
                <div className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                  <Smile className="w-4 h-4" /> Emojis
                </div>
                <div className="flex flex-wrap gap-1">
                  {emojiList.map((e) => (
                    <button
                      key={e}
                      type="button"
                      disabled={menubarDisabled}
                      onClick={() => insertEmoji(e)}
                      className="h-8 w-8 rounded-lg border border-slate-800/60 bg-slate-950/30 hover:bg-white/5 disabled:opacity-50"
                      title={e}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-4 py-2">
                <div className="text-xs text-slate-500 mb-2">Special characters</div>
                <div className="flex flex-wrap gap-1">
                  {specialChars.map((c) => (
                    <button
                      key={c}
                      type="button"
                      disabled={menubarDisabled}
                      onClick={() => insertChar(c)}
                      className="h-8 px-2 rounded-lg border border-slate-800/60 bg-slate-950/30 hover:bg-white/5 text-slate-200 disabled:opacity-50"
                      title={c}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <MenuButton>Format</MenuButton>
            <div className="absolute left-0 top-full mt-0.5 w-80 py-2 bg-slate-950 border border-slate-700/60 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
              <MenuItem disabled={menubarDisabled} onClick={() => editor?.chain().focus().toggleBold().run()} right="Ctrl+B">
                <Bold className="w-4 h-4 text-slate-400" /> Bold
              </MenuItem>
              <MenuItem disabled={menubarDisabled} onClick={() => editor?.chain().focus().toggleItalic().run()} right="Ctrl+I">
                <Italic className="w-4 h-4 text-slate-400" /> Italic
              </MenuItem>
              <MenuItem disabled={menubarDisabled} onClick={() => editor?.chain().focus().toggleUnderline().run()} right="Ctrl+U">
                <UnderlineIcon className="w-4 h-4 text-slate-400" /> Underline
              </MenuItem>
              <MenuItem disabled={menubarDisabled} onClick={() => editor?.chain().focus().toggleStrike().run()}>
                <Strikethrough className="w-4 h-4 text-slate-400" /> Strikethrough
              </MenuItem>
              <div className="my-2 border-t border-slate-800/60" />

              <div className="px-4 py-2">
                <div className="text-xs text-slate-500 mb-2">Align</div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={menubarDisabled} onClick={() => editor?.chain().focus().setTextAlign('left').run()} className="p-2 rounded-lg border border-slate-800/60 bg-slate-950/30 hover:bg-white/5 text-slate-200 disabled:opacity-50">
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button type="button" disabled={menubarDisabled} onClick={() => editor?.chain().focus().setTextAlign('center').run()} className="p-2 rounded-lg border border-slate-800/60 bg-slate-950/30 hover:bg-white/5 text-slate-200 disabled:opacity-50">
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button type="button" disabled={menubarDisabled} onClick={() => editor?.chain().focus().setTextAlign('right').run()} className="p-2 rounded-lg border border-slate-800/60 bg-slate-950/30 hover:bg-white/5 text-slate-200 disabled:opacity-50">
                    <AlignRight className="w-4 h-4" />
                  </button>
                  <button type="button" disabled={menubarDisabled} onClick={() => editor?.chain().focus().setTextAlign('justify').run()} className="p-2 rounded-lg border border-slate-800/60 bg-slate-950/30 hover:bg-white/5 text-slate-200 disabled:opacity-50">
                    <AlignJustify className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="px-4 py-2">
                <div className="text-xs text-slate-500 mb-2">Colors</div>
                <div className="flex flex-wrap gap-2">
                  {colorSwatches.map((hex) => (
                    <button key={hex} type="button" disabled={menubarDisabled} onClick={() => setTextColor(hex)} className="h-7 w-7 rounded-lg border border-slate-800/60 bg-slate-950/30 hover:bg-white/5 disabled:opacity-50" title={hex}>
                      <span className="block h-full w-full rounded-md" style={{ backgroundColor: hex }} />
                    </button>
                  ))}
                  <button type="button" disabled={menubarDisabled} onClick={() => editor?.chain().focus().unsetColor().run()} className="h-7 px-2 rounded-lg border border-slate-800/60 bg-slate-950/30 hover:bg-white/5 text-slate-200 disabled:opacity-50" title="Reset color">
                    <Paintbrush className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-slate-500 mt-2">Background</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {colorSwatches.map((hex) => (
                    <button key={`h-${hex}`} type="button" disabled={menubarDisabled} onClick={() => setHighlightColor(hex)} className="h-7 w-7 rounded-lg border border-slate-800/60 bg-slate-950/30 hover:bg-white/5 disabled:opacity-50" title={hex}>
                      <span className="block h-full w-full rounded-md" style={{ backgroundColor: hex }} />
                    </button>
                  ))}
                  <button type="button" disabled={menubarDisabled} onClick={() => editor?.chain().focus().unsetHighlight().run()} className="h-7 px-2 rounded-lg border border-slate-800/60 bg-slate-950/30 hover:bg-white/5 text-slate-200 disabled:opacity-50" title="Reset highlight">
                    <Highlighter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="my-2 border-t border-slate-800/60" />
              <MenuItem disabled={menubarDisabled} onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}>
                <Eraser className="w-4 h-4 text-slate-400" /> Clear formatting
              </MenuItem>
            </div>
          </div>

          <div className="relative group">
            <MenuButton>Tools</MenuButton>
            <div className="absolute right-0 top-full mt-0.5 w-64 py-2 bg-slate-950 border border-slate-700/60 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
              <div className="px-4 py-2 text-sm text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-slate-400" /> Word count
                </span>
                <span className="text-slate-200">{wordCount}</span>
              </div>
              <div className="my-2 border-t border-slate-800/60" />
              <MenuItem disabled={menubarDisabled} onClick={() => openDialog('search')}>
                <Search className="w-4 h-4 text-slate-400" /> Find & replace…
              </MenuItem>
            </div>
          </div>

          <div className="relative group">
            <MenuButton>Table</MenuButton>
            <div className="absolute right-0 top-full mt-0.5 w-72 py-2 bg-slate-950 border border-slate-700/60 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
              <MenuItem disabled={menubarDisabled} className="group/table" right="▶">
                <TableIcon className="w-4 h-4 text-slate-400" /> Insert table…
                <div className="absolute top-0 left-full ml-1 w-52 p-2 bg-slate-950 border border-slate-700/60 rounded-xl shadow-xl opacity-0 invisible group-hover/table:opacity-100 group-hover/table:visible transition-all duration-200 z-30 cursor-default">
                  <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${tableGridMax.cols}, minmax(0, 1fr))` }}>
                    {Array.from({ length: tableGridMax.rows * tableGridMax.cols }).map((_, idx) => {
                      const r = Math.floor(idx / tableGridMax.cols) + 1;
                      const c = (idx % tableGridMax.cols) + 1;
                      const active = r <= tableHover.rows && c <= tableHover.cols;
                      return (
                        <div
                          key={`${r}-${c}`}
                          onMouseEnter={() => setTableHover({ rows: r, cols: c })}
                          onClick={(e) => { e.stopPropagation(); applyTableGrid(r, c); }}
                          className={[
                            'h-4 w-4 rounded-sm border cursor-pointer',
                            active ? 'bg-cyan-500 border-cyan-500' : 'bg-slate-900 border-slate-700 hover:border-slate-500',
                          ].join(' ')}
                          aria-label={`${c}x${r}`}
                          title={`${c}x${r}`}
                        />
                      );
                    })}
                  </div>
                  <div className="mt-2 text-center text-xs font-semibold text-cyan-400">
                    {tableHover.cols}x{tableHover.rows}
                  </div>
                </div>
              </MenuItem>
              <div className="my-2 border-t border-slate-800/60" />
              <MenuItem disabled={menubarDisabled || !inTable} onClick={() => editor?.chain().focus().addRowBefore().run()}>
                Insert row before
              </MenuItem>
              <MenuItem disabled={menubarDisabled || !inTable} onClick={() => editor?.chain().focus().addRowAfter().run()}>
                Insert row after
              </MenuItem>
              <MenuItem disabled={menubarDisabled || !inTable} onClick={() => editor?.chain().focus().deleteRow().run()}>
                Delete row
              </MenuItem>
              <div className="my-2 border-t border-slate-800/60" />
              <MenuItem disabled={menubarDisabled || !inTable} onClick={() => editor?.chain().focus().addColumnBefore().run()}>
                Insert column before
              </MenuItem>
              <MenuItem disabled={menubarDisabled || !inTable} onClick={() => editor?.chain().focus().addColumnAfter().run()}>
                Insert column after
              </MenuItem>
              <MenuItem disabled={menubarDisabled || !inTable} onClick={() => editor?.chain().focus().deleteColumn().run()}>
                Delete column
              </MenuItem>
              <div className="my-2 border-t border-slate-800/60" />
              <MenuItem disabled={menubarDisabled || !inTable} onClick={() => editor?.chain().focus().mergeCells().run()}>
                Merge cells
              </MenuItem>
              <MenuItem disabled={menubarDisabled || !inTable} onClick={() => editor?.chain().focus().splitCell().run()}>
                Split cell
              </MenuItem>
              <MenuItem disabled={menubarDisabled || !inTable} onClick={() => editor?.chain().focus().toggleHeaderRow().run()}>
                Toggle header row
              </MenuItem>
              <div className="my-2 border-t border-slate-800/60" />
              <MenuItem danger disabled={menubarDisabled || !inTable} onClick={() => editor?.chain().focus().deleteTable().run()}>
                Delete table
              </MenuItem>
            </div>
          </div>

          <div className="relative group">
            <MenuButton>Help</MenuButton>
            <div className="absolute right-0 top-full mt-0.5 w-72 py-2 bg-slate-950 border border-slate-700/60 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
              <div className="px-4 py-2 text-sm text-slate-400">
                Use the menus to insert tables, media, and formatting. Content is saved as HTML.
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'visual' && (
        <div className="mb-2 flex flex-wrap items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-900/40 px-3 py-2">
          <Button type="button" variant="ghost" size="sm" disabled={!editor} onClick={() => editor?.chain().focus().undo().run()}>
            <Undo className="w-4 h-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled={!editor} onClick={() => editor?.chain().focus().redo().run()}>
            <Redo className="w-4 h-4" />
          </Button>

          <div className="w-px h-7 bg-slate-800/80 mx-1" />

          <div className="relative group">
            <button
              type="button"
              disabled={!editor}
              className="px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 border border-slate-800/60 bg-slate-950/30 disabled:opacity-50"
              title="Blocks"
            >
              {blockLabel}
            </button>
            <div className="absolute left-0 top-full mt-0.5 w-56 py-2 bg-slate-950 border border-slate-700/60 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
              <MenuItem disabled={!editor} onClick={() => editor?.chain().focus().setParagraph().run()}>
                Paragraph
              </MenuItem>
              <div className="my-2 border-t border-slate-800/60" />
              {([1, 2, 3, 4, 5, 6] as const).map((level) => (
                <MenuItem key={level} disabled={!editor} onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}>
                  Heading {level}
                </MenuItem>
              ))}
              <div className="my-2 border-t border-slate-800/60" />
              <MenuItem disabled={!editor} onClick={() => editor?.chain().focus().toggleCodeBlock().run()}>
                Preformatted
              </MenuItem>
            </div>
          </div>

          <div className="flex items-center rounded-lg border border-slate-800/60 bg-slate-950/30 overflow-hidden">
            <button
              type="button"
              disabled={!editor}
              onClick={() => adjustFontSize(-1)}
              className="h-9 w-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 disabled:opacity-50"
              title="Decrease font size"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="px-3 text-sm text-slate-200 min-w-[72px] text-center" title="Font size">
              {currentFontSize}
            </div>
            <button
              type="button"
              disabled={!editor}
              onClick={() => adjustFontSize(1)}
              className="h-9 w-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 disabled:opacity-50"
              title="Increase font size"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-7 bg-slate-800/80 mx-1" />

          <button type="button" disabled={!editor} onClick={() => openDialog('search')} className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 disabled:opacity-50" title="Find & replace">
            <Search className="w-4 h-4" />
          </button>

          <button type="button" disabled={!editor} onClick={() => openDialog('image')} className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 disabled:opacity-50" title="Insert image">
            <ImageIcon className="w-4 h-4" />
          </button>
          <button type="button" disabled={!editor} onClick={() => openDialog('link')} className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 disabled:opacity-50" title="Insert link">
            <LinkIcon className="w-4 h-4" />
          </button>
          <button type="button" disabled={!editor} onClick={() => openDialog('video')} className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 disabled:opacity-50" title="Insert media">
            <VideoIcon className="w-4 h-4" />
          </button>

          <div className="w-px h-7 bg-slate-800/80 mx-1" />

          <button type="button" disabled={!editor} onClick={() => editor?.chain().focus().toggleBold().run()} className={['p-2 rounded-lg hover:bg-white/5 disabled:opacity-50', editor?.isActive('bold') ? 'text-cyan-300 bg-cyan-500/10' : 'text-slate-300 hover:text-white'].join(' ')} title="Bold">
            <Bold className="w-4 h-4" />
          </button>
          <button type="button" disabled={!editor} onClick={() => editor?.chain().focus().toggleItalic().run()} className={['p-2 rounded-lg hover:bg-white/5 disabled:opacity-50', editor?.isActive('italic') ? 'text-cyan-300 bg-cyan-500/10' : 'text-slate-300 hover:text-white'].join(' ')} title="Italic">
            <Italic className="w-4 h-4" />
          </button>
          <button type="button" disabled={!editor} onClick={() => editor?.chain().focus().toggleUnderline().run()} className={['p-2 rounded-lg hover:bg-white/5 disabled:opacity-50', editor?.isActive('underline') ? 'text-cyan-300 bg-cyan-500/10' : 'text-slate-300 hover:text-white'].join(' ')} title="Underline">
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button type="button" disabled={!editor} onClick={() => editor?.chain().focus().toggleStrike().run()} className={['p-2 rounded-lg hover:bg-white/5 disabled:opacity-50', editor?.isActive('strike') ? 'text-cyan-300 bg-cyan-500/10' : 'text-slate-300 hover:text-white'].join(' ')} title="Strikethrough">
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="w-px h-7 bg-slate-800/80 mx-1" />

          <button type="button" disabled={!editor} onClick={() => editor?.chain().focus().toggleBulletList().run()} className={['p-2 rounded-lg hover:bg-white/5 disabled:opacity-50', editor?.isActive('bulletList') ? 'text-cyan-300 bg-cyan-500/10' : 'text-slate-300 hover:text-white'].join(' ')} title="Bulleted list">
            <List className="w-4 h-4" />
          </button>
          <button type="button" disabled={!editor} onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={['p-2 rounded-lg hover:bg-white/5 disabled:opacity-50', editor?.isActive('orderedList') ? 'text-cyan-300 bg-cyan-500/10' : 'text-slate-300 hover:text-white'].join(' ')} title="Numbered list">
            <ListOrdered className="w-4 h-4" />
          </button>
          <div className="relative group/inlinetable">
            <button type="button" disabled={!editor} className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 disabled:opacity-50" title="Table">
              <TableIcon className="w-4 h-4" />
            </button>
            <div className="absolute bottom-full left-0 mb-2 w-52 p-2 bg-slate-950 border border-slate-700/60 rounded-xl shadow-xl opacity-0 invisible group-hover/inlinetable:opacity-100 group-hover/inlinetable:visible transition-all duration-200 z-30 cursor-default">
              <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${tableGridMax.cols}, minmax(0, 1fr))` }}>
                {Array.from({ length: tableGridMax.rows * tableGridMax.cols }).map((_, idx) => {
                  const r = Math.floor(idx / tableGridMax.cols) + 1;
                  const c = (idx % tableGridMax.cols) + 1;
                  const active = r <= tableHover.rows && c <= tableHover.cols;
                  return (
                    <div
                      key={`${r}-${c}`}
                      onMouseEnter={() => setTableHover({ rows: r, cols: c })}
                      onClick={(e) => { e.stopPropagation(); applyTableGrid(r, c); }}
                      className={[
                        'h-4 w-4 rounded-sm border cursor-pointer',
                        active ? 'bg-cyan-500 border-cyan-500' : 'bg-slate-900 border-slate-700 hover:border-slate-500',
                      ].join(' ')}
                      aria-label={`${c}x${r}`}
                      title={`${c}x${r}`}
                    />
                  );
                })}
              </div>
              <div className="mt-2 text-center text-xs font-semibold text-cyan-400">
                {tableHover.cols}x{tableHover.rows}
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal title="Insert link" open={dialog?.kind === 'link'} onClose={closeDialog}>
        {dialog?.kind === 'link' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-slate-400 mb-1">URL</div>
                <Input value={dialog.href} onChange={(e) => setDialog({ ...dialog, href: e.target.value })} placeholder="https://…" />
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Text</div>
                <Input value={dialog.text} onChange={(e) => setDialog({ ...dialog, text: e.target.value })} placeholder="Optional (uses URL if empty)" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={dialog.newTab} onChange={(e) => setDialog({ ...dialog, newTab: e.target.checked })} />
              Open in new tab
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  editor?.chain().focus().extendMarkRange('link').unsetLink().run();
                  closeDialog();
                }}
              >
                <Unlink className="w-4 h-4" /> Remove
              </Button>
              <Button type="button" onClick={applyLink}>
                Save
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal title="Insert image" open={dialog?.kind === 'image'} onClose={closeDialog}>
        {dialog?.kind === 'image' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <div className="text-xs text-slate-400 mb-1">Source</div>
                <Input value={dialog.src} onChange={(e) => setDialog({ ...dialog, src: e.target.value })} placeholder="https://…" />
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-slate-400 mb-1">Alt text</div>
                <Input value={dialog.alt} onChange={(e) => setDialog({ ...dialog, alt: e.target.value })} placeholder="Optional" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="button" onClick={applyImage}>
                Insert
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal title="Insert media (video)" open={dialog?.kind === 'video'} onClose={closeDialog}>
        {dialog?.kind === 'video' && (
          <div className="space-y-3">
            <div>
              <div className="text-xs text-slate-400 mb-1">Source</div>
              <Input value={dialog.src} onChange={(e) => setDialog({ ...dialog, src: e.target.value })} placeholder="https://… (mp4/webm)" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="button" onClick={applyVideo}>
                Insert
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal title="Layout" open={dialog?.kind === 'layout'} onClose={closeDialog}>
        {dialog?.kind === 'layout' && (
          <div className="space-y-4">
            <div className="text-sm text-slate-300">
              Choose where the media goes. You can use an image/gif URL or a video URL (mp4/webm).
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant={dialog.layout === 'mediaLeft' ? 'outline' : 'ghost'} onClick={() => setDialog({ ...dialog, layout: 'mediaLeft' })}>
                Media left
              </Button>
              <Button type="button" variant={dialog.layout === 'mediaRight' ? 'outline' : 'ghost'} onClick={() => setDialog({ ...dialog, layout: 'mediaRight' })}>
                Media right
              </Button>
              <Button type="button" variant={dialog.layout === 'mediaTop' ? 'outline' : 'ghost'} onClick={() => setDialog({ ...dialog, layout: 'mediaTop' })}>
                Media top
              </Button>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">Media URL</div>
              <Input value={dialog.src} onChange={(e) => setDialog({ ...dialog, src: e.target.value })} placeholder="https://…" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="button" onClick={applyLayout}>
                Insert
              </Button>
            </div>
          </div>
        )}
      </Modal>



      <Modal title="Find & replace" open={dialog?.kind === 'search'} onClose={closeDialog}>
        {dialog?.kind === 'search' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-slate-400 mb-1">Find</div>
                <Input value={dialog.q} onChange={(e) => setDialog({ ...dialog, q: e.target.value })} placeholder="Text to find" />
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Replace with</div>
                <Input value={dialog.replace} onChange={(e) => setDialog({ ...dialog, replace: e.target.value })} placeholder="Replacement" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={dialog.matchCase} onChange={(e) => setDialog({ ...dialog, matchCase: e.target.checked })} />
              Match case
            </label>
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={closeDialog}>
                Close
              </Button>
              <Button type="button" variant="outline" onClick={findNext}>
                Find next
              </Button>
              <Button type="button" onClick={replaceOne}>
                Replace
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {mode === 'html' ? (
        <textarea
          className={[
            'w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50',
            'text-white placeholder:text-slate-500 transition-all duration-300 focus:outline-none',
            'focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600',
            minHeightClassName,
          ].join(' ')}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onBlur?.(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <div className="w-full px-4 py-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white transition-all duration-300 focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/20 hover:border-slate-600">
          <EditorContent editor={editor} />
        </div>
      )}

      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>Words: {wordCount}</span>
        <span>{blockLabel}</span>
      </div>
    </div>
  );
}
