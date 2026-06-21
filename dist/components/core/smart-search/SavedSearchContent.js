/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandLoading, CommandSeparator, } from '../../../components/ui/command';
import { EMPTY_ARRAY } from '../../../lib/core/common/isEmpty';
import { Eye, EyeOff, Loader2, Pencil, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSmartSearchDispatcher, useSmartSearchState } from '../../../components/core/smart-search/context';
import SavedSearchPopup from '../../../components/core/smart-search/SavedSearchPopup';
import SavedViewItem from '../../../components/core/smart-search/SavedViewItem';
export default function SavedViewContent(props) {
    const { activeView, savedSearches, isLoading, onDeleteView, onCreateView, onUpdateView, onSelectView, forSmartSearch, stickyFilters, } = props;
    const state = useSmartSearchState();
    const [filter, setFilter] = useState('');
    const [editingView, setEditingView] = useState(null);
    const dispatch = useSmartSearchDispatcher();
    const filteredPublicViews = useMemo(() => {
        const options = (savedSearches ?? EMPTY_ARRAY).filter((o) => o.isPublic);
        if (!filter)
            return options;
        return options.filter((o) => o.name.toLowerCase().includes(filter.toLowerCase()));
    }, [filter, savedSearches]);
    const filteredPrivateViews = useMemo(() => {
        const options = (savedSearches ?? EMPTY_ARRAY).filter((o) => !o.isPublic);
        if (!filter)
            return options;
        return options.filter((o) => o.name.toLowerCase().includes(filter.toLowerCase()));
    }, [filter, savedSearches]);
    return (_jsxs(_Fragment, { children: [_jsxs(Command, { shouldFilter: false, "data-testid": "saved-search-dropdown-menu", children: [_jsx(CommandInput, { value: filter, placeholder: "Filter saved views...", className: "h-9", onValueChange: setFilter }), _jsxs(CommandList, { children: [isLoading && (_jsx(CommandLoading, { children: _jsxs("div", { className: "flex flex-row items-center gap-2", children: [_jsx(Loader2, { className: "size-4 animate-spin" }), " loading..."] }) })), !isLoading && _jsx(CommandEmpty, { children: "No private views found" }), _jsx(CommandGroup, { heading: "My Views", children: filteredPrivateViews.length === 0 ? (_jsx(CommandItem, { disabled: true, children: "No private views found" })) : (filteredPrivateViews.map((view, index) => (_jsx(SavedViewItem, { activeView: activeView, onDeleteView: onDeleteView, onSelectView: onSelectView, view: view }, view.id ?? index)))) }), _jsx(CommandSeparator, {}), _jsx(CommandGroup, { heading: "Public Views", children: filteredPublicViews.length === 0 ? (_jsx(CommandItem, { disabled: true, children: "No public views found" })) : (filteredPublicViews.map((view, index) => (_jsx(SavedViewItem, { activeView: activeView, onDeleteView: onDeleteView, onSelectView: onSelectView, view: view }, view.id ?? index)))) }), _jsx(CommandSeparator, {}), _jsxs(CommandGroup, { heading: "Actions", children: [_jsxs(CommandItem, { value: "create-new-view", "data-testid": "create-new-view", onSelect: () => {
                                            setEditingView({
                                                name: '',
                                                isPublic: false,
                                                owner: '',
                                                isDefault: false,
                                                description: '',
                                                payload: {
                                                    filters: state.filters,
                                                },
                                            });
                                        }, className: "cursor-pointer", children: ["Create New View", _jsx(Plus, { className: "ml-auto" })] }), _jsxs(CommandItem, { value: "update-view", "data-testid": "update-view", onSelect: () => {
                                            setEditingView({
                                                ...activeView,
                                                payload: {
                                                    ...activeView?.payload,
                                                    filters: state.filters,
                                                },
                                            });
                                        }, className: "cursor-pointer", disabled: !activeView?.owner, children: ["Update View", _jsx(Pencil, { className: "ml-auto" })] }), forSmartSearch && (_jsxs(CommandItem, { "data-testid": "show-search", value: "show-search", onSelect: () => {
                                            dispatch({
                                                type: 'setShowFilters',
                                                showFilters: !state.showFilters,
                                            });
                                        }, className: "cursor-pointer", children: [state.showFilters ? 'Hide Search' : 'Show Search', state.showFilters ? _jsx(EyeOff, { className: "ml-auto" }) : _jsx(Eye, { className: "ml-auto" })] }))] })] })] }), editingView && (_jsx(SavedSearchPopup, { stickyFilters: stickyFilters, onClose: () => setEditingView(null), onCreate: onCreateView, onUpdate: onUpdateView, view: editingView, forSmartSearch: forSmartSearch }))] }));
}
//# sourceMappingURL=SavedSearchContent.js.map