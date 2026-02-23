'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { CommandProps, Node, mergeAttributes } from '@tiptap/core';
import { Button } from '@/components/ui';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Video as VideoIcon,
  Table as TableIcon,
  Code,
  Eye,
  Edit3,
} from 'lucide-react';

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

function normalizeUrl(raw: string): string | null {
  const v = String(raw ?? '').trim();
  if (!v) return null;
  return v;
}

export function RichHtmlEditor({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  minHeightClassName = 'min-h-[240px]',
}: Props) {
  const [mode, setMode] = useState<'visual' | 'html'>('visual');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      }),
      Image.configure({
        allowBase64: false,
      }),
      Video,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
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
          'focus:outline-none',
          minHeightClassName,
        ].join(' '),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onBlur: ({ editor }) => {
      onBlur?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (mode !== 'visual') return;
    const current = editor.getHTML();
    const next = value ?? '';
    if (current === next) return;
    editor.commands.setContent(next, { emitUpdate: false });
  }, [editor, value, mode]);

  const can = useMemo(() => {
    if (!editor) return null;
    return {
      bold: editor.can().chain().focus().toggleBold().run(),
      italic: editor.can().chain().focus().toggleItalic().run(),
      underline: editor.can().chain().focus().toggleUnderline().run(),
      h2: editor.can().chain().focus().toggleHeading({ level: 2 }).run(),
      h3: editor.can().chain().focus().toggleHeading({ level: 3 }).run(),
      bullet: editor.can().chain().focus().toggleBulletList().run(),
      ordered: editor.can().chain().focus().toggleOrderedList().run(),
      table: editor.can().chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    };
  }, [editor]);

  const toolbarDisabled = !editor || mode !== 'visual';

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>}

      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={toolbarDisabled || !can?.bold}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <Bold className="w-4 h-4" /> Bold
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={toolbarDisabled || !can?.italic}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <Italic className="w-4 h-4" /> Italic
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={toolbarDisabled || !can?.underline}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="w-4 h-4" /> Underline
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={toolbarDisabled || !can?.h2}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="w-4 h-4" /> H2
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={toolbarDisabled || !can?.h3}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 className="w-4 h-4" /> H3
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={toolbarDisabled || !can?.bullet}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <List className="w-4 h-4" /> List
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={toolbarDisabled || !can?.ordered}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="w-4 h-4" /> Ordered
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={toolbarDisabled}
            onClick={() => {
              const url = normalizeUrl(window.prompt('Link URL (https://...)') ?? '');
              if (!url) return;
              editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
            }}
          >
            <LinkIcon className="w-4 h-4" /> Link
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={toolbarDisabled}
            onClick={() => editor?.chain().focus().unsetLink().run()}
          >
            <Unlink className="w-4 h-4" /> Unlink
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={toolbarDisabled}
            onClick={() => {
              const src = normalizeUrl(window.prompt('Image URL (png/jpg/gif/webp/svg)') ?? '');
              if (!src) return;
              const alt = String(window.prompt('Alt (optional)') ?? '').trim();
              editor?.chain().focus().setImage({ src, ...(alt ? { alt } : {}) }).run();
            }}
          >
            <ImageIcon className="w-4 h-4" /> Image
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={toolbarDisabled}
            onClick={() => {
              const src = normalizeUrl(window.prompt('Video URL (mp4/webm)') ?? '');
              if (!src) return;
              editor?.chain().focus().setVideo({ src }).run();
            }}
          >
            <VideoIcon className="w-4 h-4" /> Video
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={toolbarDisabled || !can?.table}
            onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          >
            <TableIcon className="w-4 h-4" /> Table
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={toolbarDisabled}
            onClick={() => {
              const kind = String(
                window.prompt(
                  [
                    'Layout quick insert:',
                    '1 = Image left + text right',
                    '2 = Text left + image right',
                    '3 = Image on top + text below',
                  ].join('\n'),
                ) ?? '',
              ).trim();
              if (!['1', '2', '3'].includes(kind)) return;
              const src = normalizeUrl(window.prompt('Media URL (image gif / video mp4)') ?? '');
              if (!src) return;
              const isVideo = /\.(mp4|webm|ogg)(\?|#|$)/i.test(src);

              const mediaHtml = isVideo
                ? `<video controls preload="metadata" playsinline src="${src}"></video>`
                : `<img src="${src}" alt=""/>`;

              if (kind === '3') {
                editor?.chain().focus().insertContent(`<p>${mediaHtml}</p><p>${placeholder ?? 'Write here...'}</p>`).run();
                return;
              }

              const left = kind === '1' ? mediaHtml : `<p>${placeholder ?? 'Write here...'}</p>`;
              const right = kind === '1' ? `<p>${placeholder ?? 'Write here...'}</p>` : mediaHtml;
              editor
                ?.chain()
                .focus()
                .insertContent(
                  `<table><tbody><tr><td>${left}</td><td>${right}</td></tr></tbody></table><p></p>`,
                )
                .run();
            }}
          >
            <Code className="w-4 h-4" /> Layout
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={mode === 'visual' ? 'outline' : 'ghost'}
            size="sm"
            onClick={() => setMode('visual')}
          >
            <Eye className="w-4 h-4" /> Visual
          </Button>
          <Button
            type="button"
            variant={mode === 'html' ? 'outline' : 'ghost'}
            size="sm"
            onClick={() => setMode('html')}
          >
            <Edit3 className="w-4 h-4" /> HTML
          </Button>
        </div>
      </div>

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
    </div>
  );
}
