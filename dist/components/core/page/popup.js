/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '../../../components/ui/dialog';
import { cn } from '../../../lib/utils';
import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import useWindowSize from '../../../components/core/hooks/useWindowSize';
function PopupComponent({ title, onClose, children, footer, description, contentClassName, bodyClassName, headerToolbar, width = 800, height = 600, minWidth = 300, minHeight = 200, maxWidth = 2800, maxHeight = 1600, resizable = true, disableClose = false, modal = true, }) {
    const windowSize = useWindowSize({ debounceMs: 100 });
    // Calculate effective max dimensions (constrained by window size with padding)
    const padding = 32;
    const effectiveMaxWidth = Math.min(maxWidth, windowSize.width - padding);
    const effectiveMaxHeight = Math.min(maxHeight, windowSize.height - padding);
    const [size, setSize] = useState(() => ({
        width: Math.min(width, effectiveMaxWidth),
        height: Math.min(height, effectiveMaxHeight),
    }));
    const [position, setPosition] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
    const dialogRef = useRef(null);
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
    const handleMouseDown = (e) => {
        if (!position)
            return;
        if (e.target === e.currentTarget || e.target.closest('[data-drag-handle]')) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            });
        }
    };
    // Handle resizing
    const handleResizeMouseDown = (e) => {
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
        const handleMouseMove = (e) => {
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
    return (_jsx(Dialog, { modal: modal, open: true, onOpenChange: (open) => {
            if (!open) {
                onClose();
            }
        }, children: _jsxs(DialogContent, { ref: dialogRef, disableClose: disableClose, style: {
                width: size.width,
                height: size.height,
                top: position?.y ?? '50%',
                left: position?.x ?? '50%',
                maxWidth: 'none',
                maxHeight: 'none',
            }, className: cn('flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0', 
            // Override the default centering transforms - use absolute positioning instead
            position ? 'translate-x-0 translate-y-0' : '', (isDragging || isResizing) && 'transition-none', contentClassName), onPointerDownOutside: (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, onInteractOutside: (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, children: [_jsx(DialogHeader, { "data-drag-handle": true, className: cn('shrink-0 p-6', isDragging ? 'cursor-grabbing' : 'cursor-grab'), onMouseDown: (e) => {
                        e.stopPropagation();
                        handleMouseDown(e);
                    }, children: _jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsxs("div", { className: "flex flex-1 flex-col items-start overflow-hidden", children: [_jsx(DialogTitle, { className: "w-full overflow-hidden text-ellipsis whitespace-nowrap", "data-testid": "popup-title", children: title }), description && _jsx(DialogDescription, { "data-testid": "popup-description", children: description })] }), headerToolbar && _jsx("div", { className: "flex shrink-0 items-center gap-2", children: headerToolbar })] }) }), _jsx("div", { className: cn('scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 relative flex-1 overflow-auto px-6 pb-6', bodyClassName), "data-testid": "popup-body", children: children }), footer && (_jsx(DialogFooter, { className: "shrink-0 bg-accent p-4", "data-testid": "popup-footer", children: footer })), resizable && (_jsx("div", { role: "button", className: "absolute right-0 bottom-0 h-4 w-4 cursor-nw-resize", onMouseDown: handleResizeMouseDown, "data-testid": "popup-resize-handle", children: _jsx("svg", { width: "12", height: "12", viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", className: "absolute right-0.5 bottom-0.5 text-muted-foreground/40", children: _jsx("path", { d: "M11 3L3 11M11 7L7 11M11 10L10 11" }) }) })), process.env.NODE_ENV === 'development' && isResizing && (_jsxs("div", { className: "absolute top-0 right-8 z-50 bg-background p-2", children: [size.width, "x", size.height] }))] }) }));
}
export const Popup = memo(PopupComponent);
//# sourceMappingURL=popup.js.map