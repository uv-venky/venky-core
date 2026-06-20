/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import clientLogger from '@/lib/core/client/client-logger';
import { getErrorMessage } from '@/lib/core/common/error';
import type { Store } from '@/lib/core/common/types/Store';
import { memo, useEffect, useState } from 'react';
import { showError } from '@/components/core/common/Notification';
import { useIsStoreDirty } from '@/components/core/hooks/useStoreHooks';
import { CircleX, GripVertical, Loader2, Save, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import useWindowSize from '@/components/core/hooks/useWindowSize';

const DEFAULT_SHEET_WIDTH = 540;

interface EditSheetProps<T extends object> {
  title: string;
  store: Store<T>;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Optional content rendered at the start of the footer (e.g. secondary actions) */
  footerContent?: React.ReactNode;
  description?: string;
  keepOpen?: boolean;
  handleSave?: (onClose: () => void) => Promise<void>;
  onSaveSuccess?: () => void;
  allowDelete?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  bodyClassName?: string;
}

function EditSheetComponent<T extends object>({
  title,
  store,
  open,
  onClose,
  children,
  footerContent,
  description = `Fill in the form and click save when you're done.`,
  keepOpen,
  handleSave,
  onSaveSuccess,
  allowDelete,
  width,
  minWidth = 320,
  maxWidth = 1800,
  resizable = true,
  bodyClassName,
}: EditSheetProps<T>) {
  const [isSaving, setIsSaving] = useState(false);
  const isDirty = useIsStoreDirty(store);
  const windowSize = useWindowSize({ debounceMs: 100 });

  const padding = 32;
  const effectiveMaxWidth = Math.min(maxWidth, windowSize.width - padding);

  const [currentWidth, setCurrentWidth] = useState(() => {
    const base = width ?? DEFAULT_SHEET_WIDTH;
    const max = effectiveMaxWidth > 0 ? effectiveMaxWidth : base;
    return Math.min(Math.max(base, minWidth), max);
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, width: 0 });

  // Sync currentWidth when sheet opens or width prop changes
  useEffect(() => {
    if (open) {
      const initial = Math.min(Math.max(width ?? DEFAULT_SHEET_WIDTH, minWidth), effectiveMaxWidth);
      setCurrentWidth(initial);
    }
  }, [open, width, minWidth, effectiveMaxWidth]);

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({ x: e.clientX, width: currentWidth });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const deltaX = resizeStart.x - e.clientX;
      const newWidth = Math.min(Math.max(resizeStart.width + deltaX, minWidth), effectiveMaxWidth);
      setCurrentWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing, resizeStart, minWidth, effectiveMaxWidth]);

  const handleClose = () => {
    store.resetStore();
    onClose();
  };

  const runSave = async (closeAfterSave: boolean) => {
    setIsSaving(true);
    try {
      if (handleSave) {
        await handleSave(closeAfterSave ? onClose : () => {});
        return;
      }
      const result = await store.save();
      if (result) {
        onSaveSuccess?.();
        if (closeAfterSave) {
          onClose();
        }
      }
    } catch (error) {
      showError(`Unexpected error while saving data: ${getErrorMessage(error)}`);
      clientLogger.error({ message: 'save error', error });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}
    >
      <SheetContent
        side="right"
        className={cn('flex flex-col gap-0 sm:max-w-none', isResizing && 'transition-none')}
        style={{ width: `${currentWidth}px` }}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {resizable && (
          <div
            role="button"
            tabIndex={-1}
            className="absolute top-0 left-0 z-10 flex h-full w-2 cursor-col-resize items-center justify-center"
            onMouseDown={handleResizeMouseDown}
            data-testid="edit-sheet-resize-handle"
            aria-label="Resize sheet"
          >
            <GripVertical className="size-3.5 text-muted-foreground/40" />
          </div>
        )}
        <SheetHeader>
          <SheetTitle data-testid="edit-sheet-title">{title}</SheetTitle>
          {description && <SheetDescription data-testid="edit-sheet-description">{description}</SheetDescription>}
        </SheetHeader>
        <div
          className={cn(
            'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 relative flex-1 overflow-auto p-4',
            bodyClassName,
          )}
          data-testid="edit-sheet-body"
        >
          {children}
        </div>
        <SheetFooter className="flex flex-row items-center justify-between gap-2 border-t pt-4">
          {footerContent ? <div className="flex-1">{footerContent}</div> : <div className="flex-1" />}
          <div className="flex flex-row gap-2">
            <Button variant="outline" data-testid="edit-sheet-cancel" onClick={handleClose}>
              <CircleX className="h-3.5 w-3.5" />
              Cancel
            </Button>
            {allowDelete && (
              <Button
                type="button"
                variant="destructive"
                disabled={isSaving}
                data-testid="edit-sheet-delete"
                onClick={async () => {
                  try {
                    const id = store.currentRowId();
                    if (id) {
                      if (store.isCurrentRowFromDB()) {
                        await store.deleteRow(id);
                        await store.save();
                      } else {
                        await store.deleteRow(id);
                      }
                      onClose();
                    }
                  } catch (error) {
                    showError(`Unexpected error while deleting data: ${getErrorMessage(error)}`);
                    clientLogger.error({ message: 'delete error', error });
                  }
                }}
              >
                <Trash className="h-4 w-4" />
                Delete
              </Button>
            )}
            {keepOpen && (
              <Button
                type="button"
                variant="outline"
                disabled={isSaving || !isDirty}
                data-testid="edit-sheet-save"
                onClick={() => runSave(false)}
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSaving || !isDirty}
              data-testid="edit-sheet-save-close"
              onClick={() => runSave(true)}
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save & close
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export const EditSheet = memo(EditSheetComponent) as <T extends object>(props: EditSheetProps<T>) => React.ReactNode;
