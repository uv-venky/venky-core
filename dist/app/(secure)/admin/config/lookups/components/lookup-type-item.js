/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Badge } from '../../../../../../components/ui/badge';
import { cn } from '../../../../../../lib/utils';
import { Hash, Type } from 'lucide-react';
export function LookupTypeItem({ lookupType, isSelected, onClick }) {
    return (_jsx("div", { role: "button", onClick: onClick, className: cn('cursor-pointer rounded-lg border p-3 transition-colors hover:bg-accent', isSelected && 'border-primary bg-accent'), children: _jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-medium", children: lookupType.code }), _jsxs(Badge, { variant: lookupType.valueType === 'number' ? 'default' : 'secondary', className: "text-xs", children: [lookupType.valueType === 'number' ? (_jsx(Hash, { className: "mr-1 h-3 w-3" })) : (_jsx(Type, { className: "mr-1 h-3 w-3" })), lookupType.valueType] })] }), _jsx("div", { className: "mt-1 text-muted-foreground text-sm", children: lookupType.name }), lookupType.description && (_jsx("div", { className: "mt-1 line-clamp-2 text-muted-foreground text-xs", children: lookupType.description }))] }) }) }));
}
//# sourceMappingURL=lookup-type-item.js.map