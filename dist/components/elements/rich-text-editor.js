/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from 'react/jsx-runtime';
import { lazy, useEffect, useState, useRef } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Gapcursor from '@tiptap/extension-gapcursor';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { useEditor } from '@tiptap/react';
import { TextSelection } from 'prosemirror-state';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
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
import { cn } from '../../lib/utils';
// Lazily import EditorContent to optimize bundle size
const DynamicEditorContent = lazy(() => import('@tiptap/react').then((mod) => ({ default: mod.EditorContent })));
const defaultFeatures = {
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
}) {
  const [linkUrl, setLinkUrl] = useState('');
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [bubbleMenuPosition, setBubbleMenuPosition] = useState(null);
  const [toolbarFloatPosition, setToolbarFloatPosition] = useState(null);
  const [hasSelection, setHasSelection] = useState(false);
  const [internalSaving, setInternalSaving] = useState(false);
  const editorRef = useRef(null);
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
        const target = event.target;
        const linkElement = target.closest('a');
        if (linkElement) {
          event.preventDefault();
          event.stopPropagation();
          let linkStart;
          let linkEnd;
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
  const renderToolbarButtons = () =>
    _jsxs(_Fragment, {
      children: [
        mergedFeatures.headings &&
          _jsxs(_Fragment, {
            children: [
              _jsx(Button, {
                type: 'button',
                title: 'Heading 1',
                onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
                variant: editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost',
                size: 'sm',
                className: 'h-7 px-2',
                children: 'H1',
              }),
              _jsx(Button, {
                type: 'button',
                title: 'Heading 2',
                onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
                variant: editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost',
                size: 'sm',
                className: 'h-7 px-2',
                children: 'H2',
              }),
              _jsx(Button, {
                type: 'button',
                title: 'Heading 3',
                onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
                variant: editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost',
                size: 'sm',
                className: 'h-7 px-2',
                children: 'H3',
              }),
            ],
          }),
        _jsx(Button, {
          type: 'button',
          variant: editor.isActive('bold') ? 'default' : 'ghost',
          size: 'sm',
          className: 'h-7 w-7 p-0',
          onClick: () => editor.chain().focus().toggleBold().run(),
          title: 'Bold (Ctrl+B)',
          children: _jsx(Bold, { className: 'h-4 w-4' }),
        }),
        _jsx(Button, {
          type: 'button',
          variant: editor.isActive('italic') ? 'default' : 'ghost',
          size: 'sm',
          className: 'h-7 w-7 p-0',
          onClick: () => editor.chain().focus().toggleItalic().run(),
          title: 'Italic (Ctrl+I)',
          children: _jsx(Italic, { className: 'h-4 w-4' }),
        }),
        _jsx(Button, {
          type: 'button',
          variant: editor.isActive('underline') ? 'default' : 'ghost',
          size: 'sm',
          className: 'h-7 w-7 p-0',
          onClick: () => editor.chain().focus().toggleUnderline().run(),
          title: 'Underline (Ctrl+U)',
          children: _jsx(UnderlineIcon, { className: 'h-4 w-4' }),
        }),
        mergedFeatures.strikethrough &&
          _jsx(Button, {
            type: 'button',
            variant: editor.isActive('strike') ? 'default' : 'ghost',
            size: 'sm',
            className: 'h-7 w-7 p-0',
            onClick: () => editor.chain().focus().toggleStrike().run(),
            title: 'Strikethrough',
            children: _jsx(Strikethrough, { className: 'h-4 w-4' }),
          }),
        mergedFeatures.highlight &&
          _jsx(Button, {
            type: 'button',
            variant: editor.isActive('highlight') ? 'default' : 'ghost',
            size: 'sm',
            className: 'h-7 w-7 p-0',
            onClick: () => editor.chain().focus().toggleHighlight().run(),
            title: 'Highlight',
            children: _jsx(Highlighter, { className: 'h-4 w-4' }),
          }),
        _jsx(Button, {
          type: 'button',
          variant: editor.isActive('link') ? 'default' : 'ghost',
          size: 'sm',
          className: 'h-7 w-7 p-0',
          onClick: setLink,
          title: 'Link',
          children: _jsx(LinkIcon, { className: 'h-4 w-4' }),
        }),
        _jsx(Button, {
          type: 'button',
          variant: editor.isActive('bulletList') ? 'default' : 'ghost',
          size: 'sm',
          className: 'h-7 w-7 p-0',
          onClick: () => {
            ensureParagraph();
            editor.chain().focus().toggleBulletList().run();
          },
          title: 'Bullet List',
          children: _jsx(List, { className: 'h-4 w-4' }),
        }),
        _jsx(Button, {
          type: 'button',
          variant: editor.isActive('orderedList') ? 'default' : 'ghost',
          size: 'sm',
          className: 'h-7 w-7 p-0',
          onClick: () => {
            ensureParagraph();
            editor.chain().focus().toggleOrderedList().run();
          },
          title: 'Numbered List',
          children: _jsx(ListOrdered, { className: 'h-4 w-4' }),
        }),
        _jsx(Button, {
          type: 'button',
          variant: 'ghost',
          size: 'sm',
          className: 'h-7 w-7 p-0',
          onClick: () => editor.chain().focus().liftListItem('listItem').run(),
          title: 'Outdent',
          children: _jsx(Indent, { className: 'h-4 w-4 rotate-180' }),
        }),
        _jsx(Button, {
          type: 'button',
          variant: 'ghost',
          size: 'sm',
          className: 'h-7 w-7 p-0',
          onClick: () => editor.chain().focus().sinkListItem('listItem').run(),
          title: 'Indent',
          children: _jsx(Indent, { className: 'h-4 w-4' }),
        }),
        mergedFeatures.blockquote &&
          _jsx(Button, {
            type: 'button',
            variant: editor.isActive('blockquote') ? 'default' : 'ghost',
            size: 'sm',
            className: 'h-7 w-7 p-0',
            onClick: () => editor.chain().focus().toggleBlockquote().run(),
            title: 'Blockquote',
            children: _jsx(Quote, { className: 'h-4 w-4' }),
          }),
        mergedFeatures.codeBlock &&
          _jsx(Button, {
            type: 'button',
            variant: editor.isActive('codeBlock') ? 'default' : 'ghost',
            size: 'sm',
            className: 'h-7 w-7 p-0',
            onClick: () => editor.chain().focus().toggleCodeBlock().run(),
            title: 'Code Block',
            children: _jsx(Code, { className: 'h-4 w-4' }),
          }),
        mergedFeatures.alignment &&
          _jsxs(_Fragment, {
            children: [
              _jsx(Button, {
                type: 'button',
                variant: editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost',
                size: 'sm',
                className: 'h-7 w-7 p-0',
                onClick: () => editor.chain().focus().setTextAlign('left').run(),
                title: 'Align Left',
                children: _jsx(AlignLeft, { className: 'h-4 w-4' }),
              }),
              _jsx(Button, {
                type: 'button',
                variant: editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost',
                size: 'sm',
                className: 'h-7 w-7 p-0',
                onClick: () => editor.chain().focus().setTextAlign('center').run(),
                title: 'Align Center',
                children: _jsx(AlignCenter, { className: 'h-4 w-4' }),
              }),
              _jsx(Button, {
                type: 'button',
                variant: editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost',
                size: 'sm',
                className: 'h-7 w-7 p-0',
                onClick: () => editor.chain().focus().setTextAlign('right').run(),
                title: 'Align Right',
                children: _jsx(AlignRight, { className: 'h-4 w-4' }),
              }),
            ],
          }),
        mergedFeatures.horizontalRule &&
          _jsx(Button, {
            type: 'button',
            variant: 'ghost',
            size: 'sm',
            className: 'h-7 px-2',
            onClick: () => editor.chain().focus().setHorizontalRule().run(),
            title: 'Horizontal Rule',
            children: '\u2015',
          }),
        mergedFeatures.undoRedo &&
          _jsxs(_Fragment, {
            children: [
              _jsx(Button, {
                type: 'button',
                variant: 'ghost',
                size: 'sm',
                className: 'h-7 w-7 p-0',
                onClick: () => editor.chain().focus().undo().run(),
                title: 'Undo (Ctrl+Z)',
                children: _jsx(Undo, { className: 'h-4 w-4' }),
              }),
              _jsx(Button, {
                type: 'button',
                variant: 'ghost',
                size: 'sm',
                className: 'h-7 w-7 p-0',
                onClick: () => editor.chain().focus().redo().run(),
                title: 'Redo (Ctrl+Y)',
                children: _jsx(Redo, { className: 'h-4 w-4' }),
              }),
            ],
          }),
        _jsx(Button, {
          type: 'button',
          variant: 'ghost',
          size: 'sm',
          className: 'h-7 w-7 p-0',
          onClick: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
          title: 'Clear Formatting',
          children: _jsx(Eraser, { className: 'h-4 w-4' }),
        }),
      ],
    });
  return _jsxs('div', {
    role: 'menubar',
    className: cn('rounded-lg', className),
    children: [
      toolbarPosition === 'fixed-top' &&
        editable &&
        _jsxs('div', {
          className: 'flex flex-col',
          children: [
            onSave &&
              _jsxs('div', {
                className: 'flex flex-row items-center justify-between px-4 py-2',
                children: [
                  _jsx('div', {}),
                  _jsxs(Button, {
                    title: 'Save',
                    onClick: handleSave,
                    variant: 'default',
                    size: 'sm',
                    disabled: saving,
                    children: [saving ? _jsx(Loader2, { className: 'mr-2 h-4 w-4 animate-spin' }) : null, 'Save'],
                  }),
                ],
              }),
            _jsx('div', {
              className: 'flex flex-wrap items-center gap-1 border-b bg-transparent p-1',
              children: renderToolbarButtons(),
            }),
          ],
        }),
      _jsxs('div', {
        ref: editorRef,
        className: 'relative',
        children: [
          _jsx(DynamicEditorContent, { editor: editor }),
          editor.isEmpty &&
            placeholder &&
            _jsx('div', {
              className: 'pointer-events-none absolute top-2 left-0 text-muted-foreground text-sm',
              children: placeholder,
            }),
          toolbarPosition === 'floating' &&
            editor.isActive('link') &&
            bubbleMenuPosition &&
            _jsx('div', {
              role: 'dialog',
              className: 'absolute z-50 flex items-center gap-2 rounded-lg border bg-background p-2 shadow-lg',
              style: {
                top: `${bubbleMenuPosition.top}px`,
                left: `${bubbleMenuPosition.left}px`,
              },
              onClick: (e) => e.stopPropagation(),
              children: isEditingLink
                ? _jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      _jsx(Input, {
                        value: linkUrl,
                        onChange: (e) => setLinkUrl(e.target.value),
                        onKeyDown: (e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            updateLink();
                          } else if (e.key === 'Escape') {
                            setIsEditingLink(false);
                            const { href } = editor.getAttributes('link');
                            setLinkUrl(href || '');
                          }
                        },
                        placeholder: 'Enter URL',
                        className: 'h-8 w-full',
                        autoFocus: true,
                      }),
                      _jsx(Button, {
                        type: 'button',
                        size: 'sm',
                        variant: 'default',
                        onClick: updateLink,
                        className: 'h-8',
                        children: 'Save',
                      }),
                      _jsx(Button, {
                        type: 'button',
                        size: 'sm',
                        variant: 'ghost',
                        onClick: () => {
                          setIsEditingLink(false);
                          const { href } = editor.getAttributes('link');
                          setLinkUrl(href || '');
                        },
                        className: 'h-8',
                        children: 'Cancel',
                      }),
                    ],
                  })
                : _jsxs(_Fragment, {
                    children: [
                      _jsx('a', {
                        href: linkUrl || '#',
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        className: 'text-primary text-sm underline hover:opacity-80',
                        onClick: (e) => e.preventDefault(),
                        children: linkUrl || 'Link',
                      }),
                      _jsx(Button, {
                        type: 'button',
                        size: 'sm',
                        variant: 'ghost',
                        className: 'h-7 w-7 p-0',
                        onClick: () => {
                          const { href } = editor.getAttributes('link');
                          setLinkUrl(href || '');
                          setIsEditingLink(true);
                        },
                        title: 'Edit link',
                        children: _jsx(Pencil, { className: 'h-4 w-4' }),
                      }),
                      _jsx(Button, {
                        type: 'button',
                        size: 'sm',
                        variant: 'ghost',
                        className: 'h-7 w-7 p-0',
                        onClick: unsetLink,
                        title: 'Remove link',
                        children: _jsx(Unlink, { className: 'h-4 w-4' }),
                      }),
                      _jsx(Button, {
                        type: 'button',
                        size: 'sm',
                        variant: 'default',
                        onClick: () => {
                          const { href } = editor.getAttributes('link');
                          setLinkUrl(href || '');
                          setIsEditingLink(true);
                        },
                        className: 'h-8 px-3',
                        children: 'Edit link',
                      }),
                    ],
                  }),
            }),
          toolbarPosition === 'floating' &&
            hasSelection &&
            toolbarFloatPosition &&
            !editor.isActive('link') &&
            editable &&
            _jsx('div', {
              role: 'toolbar',
              className: 'pointer-events-none fixed z-50',
              style: {
                top: `${toolbarFloatPosition.top}px`,
                left: `${toolbarFloatPosition.left}px`,
              },
              children: _jsx('div', {
                role: 'group',
                className:
                  'pointer-events-auto flex flex-wrap items-center gap-1 rounded-lg border bg-background p-1 shadow-lg',
                onMouseDown: (e) => e.stopPropagation(),
                children: renderToolbarButtons(),
              }),
            }),
        ],
      }),
    ],
  });
}
//# sourceMappingURL=rich-text-editor.js.map
