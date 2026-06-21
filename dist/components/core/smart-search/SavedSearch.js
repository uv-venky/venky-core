/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '../../../components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { useSmartSearchDispatcher, useSmartSearchState } from '../../../components/core/smart-search/context';
import SavedViewContent from '../../../components/core/smart-search/SavedSearchContent';
export default function SavedSearchComponent(props) {
    const { savedSearches, isLoading, onDeleteView, onCreateView, onUpdateView, stickyFilters } = props;
    const state = useSmartSearchState();
    const dispatch = useSmartSearchDispatcher();
    const [open, setOpen] = useState(false);
    const activeView = savedSearches?.find((o) => o.id === state.activeView?.id);
    return (_jsxs(Popover, { open: open, onOpenChange: setOpen, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", role: "combobox", "data-testid": "saved-search-button", "aria-expanded": open, className: "justify-between border-none shadow-none", "aria-label": activeView?.name ?? 'Saved Searches', children: [activeView?.name ?? 'Saved Searches', _jsx(ChevronsUpDown, { className: "opacity-50" })] }) }), _jsx(PopoverContent, { className: "flex max-h-[calc(var(--radix-popper-available-height)-1em)] flex-col overflow-hidden p-0", children: _jsx(SavedViewContent, { stickyFilters: stickyFilters, activeView: activeView, forSmartSearch: true, savedSearches: savedSearches, isLoading: isLoading, onDeleteView: async (id) => {
                        const activeView = await onDeleteView(id);
                        dispatch({ type: 'setActiveView', activeView });
                        setOpen(false);
                    }, onCreateView: async (view) => {
                        const activeView = await onCreateView(view);
                        dispatch({ type: 'setActiveView', activeView });
                        setOpen(false);
                    }, onUpdateView: async (view) => {
                        await onUpdateView(view);
                        setOpen(false);
                    }, onSelectView: (view) => {
                        dispatch({ type: 'setActiveView', activeView: view });
                        setOpen(false);
                    } }) })] }));
}
//# sourceMappingURL=SavedSearch.js.map