/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '../../../components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '../../../components/ui/sheet';
import clientLogger from '../../../lib/core/client/client-logger';
import { getErrorMessage } from '../../../lib/core/common/error';
import { memo, useEffect, useState } from 'react';
import { showError } from '../../../components/core/common/Notification';
import { useIsStoreDirty } from '../../../components/core/hooks/useStoreHooks';
import { CircleX, GripVertical, Loader2, Save, Trash } from 'lucide-react';
import { cn } from '../../../lib/utils';
import useWindowSize from '../../../components/core/hooks/useWindowSize';
const DEFAULT_SHEET_WIDTH = 540;
function EditSheetComponent({ title, store, open, onClose, children, footerContent, description = `Fill in the form and click save when you're done.`, keepOpen, handleSave, onSaveSuccess, allowDelete, width, minWidth = 320, maxWidth = 1800, resizable = true, bodyClassName, }) {
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
    const handleResizeMouseDown = (e) => {
        e.stopPropagation();
        setIsResizing(true);
        setResizeStart({ x: e.clientX, width: currentWidth });
    };
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing)
                return;
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
    const runSave = async (closeAfterSave) => {
        setIsSaving(true);
        try {
            if (handleSave) {
                await handleSave(closeAfterSave ? onClose : () => { });
                return;
            }
            const result = await store.save();
            if (result) {
                onSaveSuccess?.();
                if (closeAfterSave) {
                    onClose();
                }
            }
        }
        catch (error) {
            showError(`Unexpected error while saving data: ${getErrorMessage(error)}`);
            clientLogger.error({ message: 'save error', error });
        }
        finally {
            setIsSaving(false);
        }
    };
    return (_jsx(Sheet, { open: open, onOpenChange: (isOpen) => {
            if (!isOpen) {
                handleClose();
            }
        }, children: _jsxs(SheetContent, { side: "right", className: cn('flex flex-col gap-0 sm:max-w-none', isResizing && 'transition-none'), style: { width: `${currentWidth}px` }, onInteractOutside: (e) => e.preventDefault(), children: [resizable && (_jsx("div", { role: "button", tabIndex: -1, className: "absolute top-0 left-0 z-10 flex h-full w-2 cursor-col-resize items-center justify-center", onMouseDown: handleResizeMouseDown, "data-testid": "edit-sheet-resize-handle", "aria-label": "Resize sheet", children: _jsx(GripVertical, { className: "size-3.5 text-muted-foreground/40" }) })), _jsxs(SheetHeader, { children: [_jsx(SheetTitle, { "data-testid": "edit-sheet-title", children: title }), description && _jsx(SheetDescription, { "data-testid": "edit-sheet-description", children: description })] }), _jsx("div", { className: cn('scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 relative flex-1 overflow-auto p-4', bodyClassName), "data-testid": "edit-sheet-body", children: children }), _jsxs(SheetFooter, { className: "flex flex-row items-center justify-between gap-2 border-t pt-4", children: [footerContent ? _jsx("div", { className: "flex-1", children: footerContent }) : _jsx("div", { className: "flex-1" }), _jsxs("div", { className: "flex flex-row gap-2", children: [_jsxs(Button, { variant: "outline", "data-testid": "edit-sheet-cancel", onClick: handleClose, children: [_jsx(CircleX, { className: "h-3.5 w-3.5" }), "Cancel"] }), allowDelete && (_jsxs(Button, { type: "button", variant: "destructive", disabled: isSaving, "data-testid": "edit-sheet-delete", onClick: async () => {
                                        try {
                                            const id = store.currentRowId();
                                            if (id) {
                                                if (store.isCurrentRowFromDB()) {
                                                    await store.deleteRow(id);
                                                    await store.save();
                                                }
                                                else {
                                                    await store.deleteRow(id);
                                                }
                                                onClose();
                                            }
                                        }
                                        catch (error) {
                                            showError(`Unexpected error while deleting data: ${getErrorMessage(error)}`);
                                            clientLogger.error({ message: 'delete error', error });
                                        }
                                    }, children: [_jsx(Trash, { className: "h-4 w-4" }), "Delete"] })), keepOpen && (_jsxs(Button, { type: "button", variant: "outline", disabled: isSaving || !isDirty, "data-testid": "edit-sheet-save", onClick: () => runSave(false), children: [isSaving ? _jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : _jsx(Save, { className: "h-3.5 w-3.5" }), "Save"] })), _jsxs(Button, { type: "submit", disabled: isSaving || !isDirty, "data-testid": "edit-sheet-save-close", onClick: () => runSave(true), children: [isSaving ? _jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : _jsx(Save, { className: "h-3.5 w-3.5" }), "Save & close"] })] })] })] }) }));
}
export const EditSheet = memo(EditSheetComponent);
//# sourceMappingURL=edit-sheet.js.map