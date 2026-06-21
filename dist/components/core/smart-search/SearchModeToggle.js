/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ListFilter, Sparkles } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '../../../components/ui/toggle-group';
/**
 * Toggles SmartSearch between the chip filter builder and natural-language mode.
 * Only mounted when deployment config and per-page opt-in both enable NL search (see SmartSearch).
 */
export function SearchModeToggle({ mode, onModeChange, disabled }) {
    return (_jsxs(ToggleGroup, { type: "single", size: "sm", variant: "outline", value: mode, disabled: disabled, onValueChange: (value) => {
            // Radix emits '' when the active item is re-clicked; ignore to keep a mode selected.
            if (value === 'chips' || value === 'nl')
                onModeChange(value);
        }, "aria-label": "Search input mode", children: [_jsx(ToggleGroupItem, { value: "chips", "aria-label": "Filter builder", "data-tip": "Filter builder", "data-testid": "search-mode-chips", children: _jsx(ListFilter, { size: 14 }) }), _jsx(ToggleGroupItem, { value: "nl", "aria-label": "Natural language", "data-tip": "Natural language", "data-testid": "search-mode-nl", children: _jsx(Sparkles, { size: 14 }) })] }));
}
//# sourceMappingURL=SearchModeToggle.js.map