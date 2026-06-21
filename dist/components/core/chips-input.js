/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';
import { useState } from 'react';
/**
 * Free-form string[] editor: a list of removable chips plus an inline input.
 * Add via Enter or Tab, remove via the X button or Backspace on empty input,
 * commit pending text on blur. Use this in place of a comma-split string when
 * values themselves can contain commas (e.g. "Amazon (FC, excl. FLSD)").
 *
 * The outer wrapper mirrors the shadcn `Input` field shell (border, focus
 * ring) and the remove-chip button uses shadcn `Button` (ghost / icon-xs),
 * so this component looks and behaves like the rest of the form primitives.
 */
export function ChipsInput({ label, values, placeholder, onChange, disabled = false, className, allowDuplicates = false, inputMinWidthRem = 8, }) {
    const [draft, setDraft] = useState('');
    const commit = () => {
        const trimmed = draft.trim();
        if (!trimmed)
            return;
        if (!allowDuplicates && values.includes(trimmed)) {
            setDraft('');
            return;
        }
        onChange([...values, trimmed]);
        setDraft('');
    };
    const remove = (target) => {
        if (disabled)
            return;
        onChange(values.filter((v) => v !== target));
    };
    const handleKey = (e) => {
        if (disabled)
            return;
        if (e.key === 'Enter' || e.key === 'Tab') {
            if (!draft.trim())
                return;
            e.preventDefault();
            commit();
        }
        else if (e.key === 'Backspace' && draft === '' && values.length > 0) {
            e.preventDefault();
            onChange(values.slice(0, -1));
        }
    };
    return (_jsxs("div", { className: cn('grid gap-2', className), children: [label ? _jsx(Label, { children: label }) : null, _jsxs("div", { "data-slot": "input", "aria-disabled": disabled || undefined, className: cn(
                // Mirror @/components/ui/input.tsx: same border, radius, shadow, transitions.
                'flex w-full min-w-0 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 text-base shadow-xs outline-none transition-[color,box-shadow] md:text-sm', 'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50', 'aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50'), children: [values.map((value) => (_jsxs(Badge, { variant: "secondary", className: "gap-1 pr-0.5", children: [_jsx("span", { className: "whitespace-pre", children: value }), _jsx(Button, { type: "button", variant: "ghost", size: "icon-xs", "aria-label": `Remove ${value}`, disabled: disabled, onClick: () => remove(value), className: "hover:bg-muted-foreground/20", children: _jsx(X, {}) })] }, value))), _jsx("input", { type: "text", value: draft, disabled: disabled, onChange: (e) => setDraft(e.target.value), onKeyDown: handleKey, onBlur: commit, placeholder: values.length === 0 ? placeholder : undefined, className: "flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed", style: { minWidth: `${inputMinWidthRem}rem` } })] })] }));
}
//# sourceMappingURL=chips-input.js.map