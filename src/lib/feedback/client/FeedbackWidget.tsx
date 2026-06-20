'use client';
/* Copyright (c) 2024-present Venky Corp. */

import { useEffect } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useFeedback, useFeedbackRequired } from './useFeedback';
import { FeedbackPanel } from './FeedbackPanel';
import { DropdownMenuItem, DropdownMenuShortcut } from '@/components/ui/dropdown-menu';

function FeedbackWidgetInner() {
  const ctx = useFeedbackRequired();
  const { config, open } = ctx;
  const position = config.widget.position;

  useEffect(() => {
    const shortcut = config.widget.keyboardShortcut;
    if (!shortcut || position === 'about-menu') return;

    const handler = (e: KeyboardEvent) => {
      const parts = shortcut.toLowerCase().split('+');
      const key = parts[parts.length - 1];
      const needsCtrl = parts.includes('ctrl');
      const needsShift = parts.includes('shift');
      const needsAlt = parts.includes('alt');
      const needsMeta = parts.includes('meta') || parts.includes('cmd');

      if (
        e.key.toLowerCase() === key &&
        e.ctrlKey === needsCtrl &&
        e.shiftKey === needsShift &&
        e.altKey === needsAlt &&
        e.metaKey === needsMeta
      ) {
        e.preventDefault();
        open();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [config.widget.keyboardShortcut, open, position]);

  if (position === 'about-menu') return null;
  if (position === 'none') return <FeedbackPanel />;

  return (
    <>
      <div
        className={cn(
          'feedback-block fixed z-50',
          position === 'bottom-right' ? 'right-6 bottom-6' : 'bottom-6 left-6',
        )}
      >
        <Button
          onClick={() => open()}
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        >
          <MessageSquarePlus className="size-6" />
        </Button>
      </div>
      <FeedbackPanel />
    </>
  );
}

export function FeedbackWidget() {
  const ctx = useFeedback();
  if (!ctx) return null;
  return <FeedbackWidgetInner />;
}

export function FeedbackWidgetMenuItem() {
  const ctx = useFeedback();
  if (!ctx) return null;
  const { config, open } = ctx;

  if (config.widget.position !== 'about-menu') return null;

  return (
    <DropdownMenuItem
      onClick={() => {
        setTimeout(() => {
          open();
        }, 1);
      }}
      className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
      data-testid="user-menu-about"
    >
      <MessageSquarePlus />
      Feedback
      <DropdownMenuShortcut>Ctrl+Shift+F</DropdownMenuShortcut>
    </DropdownMenuItem>
  );
}

function FeedbackWidgetMenuItemPanelInner() {
  const ctx = useFeedbackRequired();
  const { config, open } = ctx;
  const position = config.widget.position;

  useEffect(() => {
    const shortcut = config.widget.keyboardShortcut;
    if (!shortcut || position !== 'about-menu') return;

    const handler = (e: KeyboardEvent) => {
      const parts = shortcut.toLowerCase().split('+');
      const key = parts[parts.length - 1];
      const needsCtrl = parts.includes('ctrl');
      const needsShift = parts.includes('shift');
      const needsAlt = parts.includes('alt');
      const needsMeta = parts.includes('meta') || parts.includes('cmd');

      if (
        e.key.toLowerCase() === key &&
        e.ctrlKey === needsCtrl &&
        e.shiftKey === needsShift &&
        e.altKey === needsAlt &&
        e.metaKey === needsMeta
      ) {
        e.preventDefault();
        open();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [config.widget.keyboardShortcut, open, position]);

  if (position !== 'about-menu') return null;

  return <FeedbackPanel />;
}

export function FeedbackWidgetMenuItemPanel() {
  const ctx = useFeedback();
  if (!ctx) return null;
  return <FeedbackWidgetMenuItemPanelInner />;
}
