/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import JsonPreview, {} from '../../../../components/core/common/json-preview';
import { useRowValue } from '../../../../components/core/hooks/useStoreHooks';
import { Popup } from '../../../../components/core/page/popup';
import { useCurrentStore } from '../../../../components/core/page/RowIdProvider';
import { assertExists } from '../../../../components/core/utils/assert';
import { Button } from '../../../../components/ui/button';
import { cn } from '../../../../lib/utils';
import { Braces } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useMemo, useState } from 'react';
import { Cell } from '../table-cell';
import { EMPTY_CELL } from './shared';
/** Normalize DB/API JSON values (object or JSON string) for tree viewers. */
export function normalizeJsonForViewer(raw) {
    if (raw == null) {
        return null;
    }
    if (typeof raw === 'string') {
        const t = raw.trim();
        if (t === '') {
            return null;
        }
        try {
            return JSON.parse(t);
        }
        catch {
            return raw;
        }
    }
    return raw;
}
/**
 * Table cell that opens a tree JSON viewer (JsonPreview) for object/array/primitive or JSON strings.
 */
export function JsonViewerCell({ attributeCode, viewerTitle, className, feedbackMask, row, }) {
    const store = useCurrentStore();
    assertExists(store, 'Store not found in JsonViewerCell');
    const raw = useRowValue(store, row.id, attributeCode);
    const data = useMemo(() => normalizeJsonForViewer(raw), [raw]);
    const [open, setOpen] = useState(false);
    const { resolvedTheme } = useTheme();
    const jsonTheme = resolvedTheme === 'dark' ? 'dark' : 'light';
    if (data == null) {
        return EMPTY_CELL;
    }
    return (_jsxs(_Fragment, { children: [_jsx(Cell, { attributeCode: attributeCode, store: store, rowId: row.id, className: cn('min-w-0', className), feedbackMask: feedbackMask, children: _jsxs(Button, { type: "button", variant: "outline", size: "sm", className: "h-7 gap-1.5 px-2 text-xs", onClick: () => setOpen(true), children: [_jsx(Braces, { className: "size-3.5 shrink-0" }), "View"] }) }), open ? (_jsx(Popup, { title: viewerTitle, onClose: () => setOpen(false), width: 760, height: 560, minWidth: 400, minHeight: 280, bodyClassName: "flex min-h-0 flex-col overflow-hidden pb-4", children: _jsx(JsonPreview, { value: data, theme: jsonTheme, className: "max-h-none min-h-0 flex-1" }) })) : null] }));
}
//# sourceMappingURL=JsonViewerCell.js.map