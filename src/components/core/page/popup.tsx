/* Copyright (c) 2024-present Venky Corp. */

'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import useWindowSize from '@/components/core/hooks/useWindowSize';

export interface PopupProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  description?: string;
  contentClassName?: string;
  headerToolbar?: React.ReactNode;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  resizable?: boolean;
  disableClose?: boolean;
  bodyClassName?: string;
  modal?: boolean;
}

function PopupComponent({
  title,
  onClose,
  children,
  footer,
  description,
  contentClassName,
  bodyClassName,
  headerToolbar,
  width = 800,
  height = 600,
  minWidth = 300,
  minHeight = 200,
  maxWidth = 2800,
  maxHeight = 1600,
  resizable = true,
  disableClose = false,
  modal = true,
}: PopupProps) {
  const windowSize = useWindowSize({ debounceMs: 100 });

  // Calculate effective max dimensions (constrained by window size with padding)
  const padding = 32;
  const effectiveMaxWidth = Math.min(maxWidth, windowSize.width - padding);
  const effectiveMaxHeight = Math.min(maxHeight, windowSize.height - padding);

  const [size, setSize] = useState(() => ({
    width: Math.min(width, effectiveMaxWidth),
    height: Math.min(height, effectiveMaxHeight),
  }));
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const dialogRef = useRef<HTMLDivElement>(null);

  // Calculate initial centered position on mount
  useLayoutEffect(() => {
    const constrainedWidth = Math.min(width, effectiveMaxWidth);
    const constrainedHeight = Math.min(height, effectiveMaxHeight);
    const initialX = Math.max(0, (windowSize.width - constrainedWidth) / 2);
    const initialY = Math.max(0, (windowSize.height - constrainedHeight) / 2);
    setPosition({ x: initialX, y: initialY });
    setSize({ width: constrainedWidth, height: constrainedHeight });
  }, [width, height, effectiveMaxWidth, effectiveMaxHeight, windowSize.width, windowSize.height]);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!position) return;
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('[data-drag-handle]')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  // Handle resizing
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
  };

  // Mouse move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        const newWidth = Math.min(Math.max(resizeStart.width + deltaX, minWidth), effectiveMaxWidth);
        const newHeight = Math.min(Math.max(resizeStart.height + deltaY, minHeight), effectiveMaxHeight);

        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = isDragging ? 'grabbing' : 'nw-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, isResizing, dragStart, resizeStart, minWidth, minHeight, effectiveMaxWidth, effectiveMaxHeight]);

  return (
    <Dialog
      modal={modal}
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        ref={dialogRef}
        disableClose={disableClose}
        style={{
          width: size.width,
          height: size.height,
          top: position?.y ?? '50%',
          left: position?.x ?? '50%',
          maxWidth: 'none',
          maxHeight: 'none',
        }}
        className={cn(
          'flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0',
          // Override the default centering transforms - use absolute positioning instead
          position ? 'translate-x-0 translate-y-0' : '',
          (isDragging || isResizing) && 'transition-none',
          contentClassName,
        )}
        onPointerDownOutside={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <DialogHeader
          data-drag-handle
          className={cn('shrink-0 p-6', isDragging ? 'cursor-grabbing' : 'cursor-grab')}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleMouseDown(e);
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-1 flex-col items-start overflow-hidden">
              <DialogTitle className="w-full overflow-hidden text-ellipsis whitespace-nowrap" data-testid="popup-title">
                {title}
              </DialogTitle>
              {description && <DialogDescription data-testid="popup-description">{description}</DialogDescription>}
            </div>
            {headerToolbar && <div className="flex shrink-0 items-center gap-2">{headerToolbar}</div>}
          </div>
        </DialogHeader>
        <div
          className={cn(
            'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 relative flex-1 overflow-auto px-6 pb-6',
            bodyClassName,
          )}
          data-testid="popup-body"
        >
          {children}
        </div>
        {footer && (
          <DialogFooter className="shrink-0 bg-accent p-4" data-testid="popup-footer">
            {footer}
          </DialogFooter>
        )}

        {/* Resize Handle */}
        {resizable && (
          <div
            role="button"
            className="absolute right-0 bottom-0 h-4 w-4 cursor-nw-resize"
            onMouseDown={handleResizeMouseDown}
            data-testid="popup-resize-handle"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="absolute right-0.5 bottom-0.5 text-muted-foreground/40"
            >
              <path d="M11 3L3 11M11 7L7 11M11 10L10 11" />
            </svg>
          </div>
        )}
        {process.env.NODE_ENV === 'development' && isResizing && (
          <div className="absolute top-0 right-8 z-50 bg-background p-2">
            {size.width}x{size.height}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export const Popup = memo(PopupComponent) as (props: PopupProps) => React.ReactNode;
