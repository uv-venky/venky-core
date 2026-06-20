/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type React from 'react';
import { lazy, useEffect, useState, useRef } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Gapcursor from '@tiptap/extension-gapcursor';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { useEditor } from '@tiptap/react';
import { TextSelection } from 'prosemirror-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  Code,
  Quote,
  Link as LinkIcon,
  List,
  ListOrdered,
  Indent,
  Eraser,
  Pencil,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Lazily import EditorContent to optimize bundle size
const DynamicEditorContent = lazy(() => import('@tiptap/react').then((mod) => ({ default: mod.EditorContent })));

export interface RichTextEditorFeatures {
  /** Enable H1, H2, H3 heading buttons */
  headings?: boolean;
  /** Enable text alignment (left, center, right) */
  alignment?: boolean;
  /** Enable highlight text button */
  highlight?: boolean;
  /** Enable code block support */
  codeBlock?: boolean;
  /** Enable blockquote support */
  blockquote?: boolean;
  /** Enable horizontal rule divider */
  horizontalRule?: boolean;
  /** Enable undo/redo buttons */
  undoRedo?: boolean;
  /** Enable strikethrough button */
  strikethrough?: boolean;
}

export interface RichTextEditorProps {
  /** Current HTML content value */
  value: string;
  /** Callback when content changes */
  onChange: (value: string) => void;
  /** Optional save callback - when provided, shows a Save button */
  onSave?: (content: string) => Promise<void>;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Feature flags for toolbar buttons */
  features?: RichTextEditorFeatures;
  /** Toolbar position: 'floating' shows on selection, 'fixed-top' always visible */
  toolbarPosition?: 'floating' | 'fixed-top';
  /** Whether the editor is editable */
  editable?: boolean;
  /** External saving state control */
  isSaving?: boolean;
  /** Custom styles for the editor content area */
  contentClassName?: string;
}

const defaultFeatures: RichTextEditorFeatures = {
  headings: false,
  alignment: false,
  highlight: false,
  codeBlock: false,
  blockquote: false,
  horizontalRule: false,
  undoRedo: false,
  strikethrough: false,
};

export function RichTextEditor({
  value,
  onChange,
  onSave,
  placeholder,
  className,
  features = defaultFeatures,
  toolbarPosition = 'floating',
  editable = true,
  isSaving = false,
  contentClassName,
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [bubbleMenuPosition, setBubbleMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [toolbarFloatPosition, setToolbarFloatPosition] = useState<{ top: number; left: number } | null>(null);
  const [hasSelection, setHasSelection] = useState(false);
  const [internalSaving, setInternalSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const mergedFeatures = { ...defaultFeatures, ...features };
  const saving = isSaving || internalSaving;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: mergedFeatures.headings ? {} : false,
        blockquote: mergedFeatures.blockquote ? {} : false,
        codeBlock: mergedFeatures.codeBlock ? {} : false,
        horizontalRule: mergedFeatures.horizontalRule ? {} : false,
        gapcursor: false, // Add once explicitly below to avoid duplicate registration across core + app
      }),
      Gapcursor,
      Underline,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: toolbarPosition === 'fixed-top',
        linkOnPaste: true,
        autolink: true,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value || '',
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm min-h-[40px] max-w-none py-2 text-sm focus:outline-none',
          '[&_ul]:my-2 [&_ul]:ml-6 [&_ul]:list-disc',
          '[&_ol]:my-2 [&_ol]:ml-6 [&_ol]:list-decimal',
          '[&_li]:my-1',
          contentClassName,
        ),
      },
      handleClick: (view, _pos, event) => {
        if (toolbarPosition !== 'floating') return false;

        const target = event.target as HTMLElement;
        const linkElement = target.closest('a');

        if (linkElement) {
          event.preventDefault();
          event.stopPropagation();

          let linkStart: number;
          let linkEnd: number;
          try {
            linkStart = view.posAtDOM(linkElement, 0);
            linkEnd = view.posAtDOM(linkElement, -1) + 1;
          } catch (_error) {
            return false;
          }

          const { state } = view;
          const selection = TextSelection.create(state.doc, linkStart, linkEnd);
          const tr = state.tr.setSelection(selection);
          view.dispatch(tr);

          return true;
        }
        return false;
      },
    },
    enableInputRules: true,
    enablePasteRules: true,
    immediatelyRender: false,
  });

  // Update editor editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  // Update bubble menu and floating toolbar positions
  useEffect(() => {
    if (!editor || toolbarPosition !== 'floating') return;

    const updateBubbleMenu = () => {
      const { from, to } = editor.state.selection;
      const hasTextSelection = from !== to;

      setHasSelection(hasTextSelection);

      if (editor.isActive('link')) {
        const { href } = editor.getAttributes('link');
        setLinkUrl(href || '');

        const { $anchor } = editor.state.selection;
        const pos = editor.view.coordsAtPos($anchor.pos);

        if (editorRef.current) {
          const editorRect = editorRef.current.getBoundingClientRect();
          setBubbleMenuPosition({
            top: pos.top - editorRect.top - 40,
            left: pos.left - editorRect.left,
          });
        }
      } else {
        setBubbleMenuPosition(null);
        setLinkUrl('');
        setIsEditingLink(false);
      }

      if (hasTextSelection && !editor.isActive('link')) {
        const startPos = editor.view.coordsAtPos(from);
        const endPos = editor.view.coordsAtPos(to);

        const centerX = (startPos.left + endPos.left) / 2;
        const centerY = (startPos.top + endPos.bottom) / 2;

        setToolbarFloatPosition({
          top: centerY - 50,
          left: centerX,
        });
      } else {
        setToolbarFloatPosition(null);
      }
    };

    const handleSelectionUpdate = () => {
      requestAnimationFrame(updateBubbleMenu);
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    editor.on('transaction', handleSelectionUpdate);
    updateBubbleMenu();

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
      editor.off('transaction', handleSelectionUpdate);
    };
  }, [editor, toolbarPosition]);

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentContent = editor.getHTML();
      const normalizedCurrent = currentContent.trim() || '<p></p>';
      const normalizedValue = (value || '').trim() || '<p></p>';
      if (normalizedCurrent !== normalizedValue) {
        editor.commands.setContent(value || '<p></p>');
      }
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  const ensureParagraph = () => {
    if (editor.isEmpty) {
      editor.chain().focus().insertContent('<p></p>').run();
    }
  };

  const setLink = () => {
    const url = window.prompt('Enter URL');
    if (url) {
      const formattedUrl = url.trim() || '';
      if (formattedUrl) {
        const finalUrl = formattedUrl.match(/^(https?:\/\/|mailto:|tel:|#)/) ? formattedUrl : `https://${formattedUrl}`;
        editor.chain().focus().extendMarkRange('link').setLink({ href: finalUrl }).run();
      }
    }
  };

  const updateLink = () => {
    if (linkUrl.trim()) {
      const formattedUrl = linkUrl.trim();
      const finalUrl = formattedUrl.match(/^(https?:\/\/|mailto:|tel:|#)/) ? formattedUrl : `https://${formattedUrl}`;
      editor.chain().focus().extendMarkRange('link').setLink({ href: finalUrl }).run();
      setIsEditingLink(false);
    }
  };

  const unsetLink = () => {
    editor.chain().focus().unsetLink().run();
    setLinkUrl('');
    setIsEditingLink(false);
  };

  const handleSave = async () => {
    if (!onSave) return;
    setInternalSaving(true);
    try {
      await onSave(editor.getHTML());
    } finally {
      setInternalSaving(false);
    }
  };

  const renderToolbarButtons = () => (
    <>
      {/* Headings */}
      {mergedFeatures.headings && (
        <>
          <Button
            type="button"
            title="Heading 1"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
            size="sm"
            className="h-7 px-2"
          >
            H1
          </Button>
          <Button
            type="button"
            title="Heading 2"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
            size="sm"
            className="h-7 px-2"
          >
            H2
          </Button>
          <Button
            type="button"
            title="Heading 3"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
            size="sm"
            className="h-7 px-2"
          >
            H3
          </Button>
        </>
      )}

      {/* Basic formatting */}
      <Button
        type="button"
        variant={editor.isActive('bold') ? 'default' : 'ghost'}
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive('italic') ? 'default' : 'ghost'}
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive('underline') ? 'default' : 'ghost'}
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>

      {/* Strikethrough */}
      {mergedFeatures.strikethrough && (
        <Button
          type="button"
          variant={editor.isActive('strike') ? 'default' : 'ghost'}
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
      )}

      {/* Highlight */}
      {mergedFeatures.highlight && (
        <Button
          type="button"
          variant={editor.isActive('highlight') ? 'default' : 'ghost'}
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          title="Highlight"
        >
          <Highlighter className="h-4 w-4" />
        </Button>
      )}

      {/* Link */}
      <Button
        type="button"
        variant={editor.isActive('link') ? 'default' : 'ghost'}
        size="sm"
        className="h-7 w-7 p-0"
        onClick={setLink}
        title="Link"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>

      {/* Lists */}
      <Button
        type="button"
        variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => {
          ensureParagraph();
          editor.chain().focus().toggleBulletList().run();
        }}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => {
          ensureParagraph();
          editor.chain().focus().toggleOrderedList().run();
        }}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      {/* Indent/Outdent for lists */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => editor.chain().focus().liftListItem('listItem').run()}
        title="Outdent"
      >
        <Indent className="h-4 w-4 rotate-180" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
        title="Indent"
      >
        <Indent className="h-4 w-4" />
      </Button>

      {/* Blockquote */}
      {mergedFeatures.blockquote && (
        <Button
          type="button"
          variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </Button>
      )}

      {/* Code Block */}
      {mergedFeatures.codeBlock && (
        <Button
          type="button"
          variant={editor.isActive('codeBlock') ? 'default' : 'ghost'}
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </Button>
      )}

      {/* Alignment */}
      {mergedFeatures.alignment && (
        <>
          <Button
            type="button"
            variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Horizontal Rule */}
      {mergedFeatures.horizontalRule && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          ―
        </Button>
      )}

      {/* Undo/Redo */}
      {mergedFeatures.undoRedo && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Clear Formatting */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        title="Clear Formatting"
      >
        <Eraser className="h-4 w-4" />
      </Button>
    </>
  );

  return (
    <div role="menubar" className={cn('rounded-lg', className)}>
      {/* Fixed Top Toolbar */}
      {toolbarPosition === 'fixed-top' && editable && (
        <div className="flex flex-col">
          {onSave && (
            <div className="flex flex-row items-center justify-between px-4 py-2">
              <div />
              <Button title="Save" onClick={handleSave} variant="default" size="sm" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save
              </Button>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-1 border-b bg-transparent p-1">{renderToolbarButtons()}</div>
        </div>
      )}

      {/* Editor Content */}
      <div ref={editorRef} className="relative">
        <DynamicEditorContent editor={editor} />
        {editor.isEmpty && placeholder && (
          <div className="pointer-events-none absolute top-2 left-0 text-muted-foreground text-sm">{placeholder}</div>
        )}

        {/* Link Bubble Menu (floating mode only) */}
        {toolbarPosition === 'floating' && editor.isActive('link') && bubbleMenuPosition && (
          <div
            role="dialog"
            className="absolute z-50 flex items-center gap-2 rounded-lg border bg-background p-2 shadow-lg"
            style={{
              top: `${bubbleMenuPosition.top}px`,
              left: `${bubbleMenuPosition.left}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {isEditingLink ? (
              <div className="flex items-center gap-2">
                <Input
                  value={linkUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLinkUrl(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      updateLink();
                    } else if (e.key === 'Escape') {
                      setIsEditingLink(false);
                      const { href } = editor.getAttributes('link');
                      setLinkUrl(href || '');
                    }
                  }}
                  placeholder="Enter URL"
                  className="h-8 w-full"
                  autoFocus
                />
                <Button type="button" size="sm" variant="default" onClick={updateLink} className="h-8">
                  Save
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsEditingLink(false);
                    const { href } = editor.getAttributes('link');
                    setLinkUrl(href || '');
                  }}
                  className="h-8"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <a
                  href={linkUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm underline hover:opacity-80"
                  onClick={(e) => e.preventDefault()}
                >
                  {linkUrl || 'Link'}
                </a>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => {
                    const { href } = editor.getAttributes('link');
                    setLinkUrl(href || '');
                    setIsEditingLink(true);
                  }}
                  title="Edit link"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={unsetLink}
                  title="Remove link"
                >
                  <Unlink className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  onClick={() => {
                    const { href } = editor.getAttributes('link');
                    setLinkUrl(href || '');
                    setIsEditingLink(true);
                  }}
                  className="h-8 px-3"
                >
                  Edit link
                </Button>
              </>
            )}
          </div>
        )}

        {/* Floating Toolbar (floating mode only) */}
        {toolbarPosition === 'floating' &&
          hasSelection &&
          toolbarFloatPosition &&
          !editor.isActive('link') &&
          editable && (
            <div
              role="toolbar"
              className="pointer-events-none fixed z-50"
              style={{
                top: `${toolbarFloatPosition.top}px`,
                left: `${toolbarFloatPosition.left}px`,
              }}
            >
              <div
                role="group"
                className="pointer-events-auto flex flex-wrap items-center gap-1 rounded-lg border bg-background p-1 shadow-lg"
                onMouseDown={(e) => e.stopPropagation()}
              >
                {renderToolbarButtons()}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
