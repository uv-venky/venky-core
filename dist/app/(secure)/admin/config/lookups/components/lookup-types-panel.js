/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../../../../../../components/ui/button';
import { Input } from '../../../../../../components/ui/input';
import { useDBRows, useIsStoreLoading } from '../../../../../../components/core/hooks/useStoreHooks';
import { useLookupTypesStore } from '../hooks/use-lookup-types-store';
import { LookupTypeItem } from './lookup-type-item';
import { AddLookupTypeDialog } from './add-lookup-type-dialog';
export function LookupTypesPanel({ selectedLookupType, onSelectLookupType }) {
    const store = useLookupTypesStore();
    const lookupTypes = useDBRows(store);
    const isLoading = useIsStoreLoading(store);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const filteredLookupTypes = useMemo(() => {
        if (!searchQuery.trim()) {
            return lookupTypes;
        }
        const query = searchQuery.toLowerCase();
        return lookupTypes.filter((lt) => lt.code?.toLowerCase().includes(query) ||
            lt.name?.toLowerCase().includes(query) ||
            lt.description?.toLowerCase().includes(query));
    }, [lookupTypes, searchQuery]);
    return (_jsxs("div", { className: "flex h-full flex-col", children: [_jsxs("div", { className: "mb-4 flex items-center gap-2", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), _jsx(Input, { placeholder: "Search lookup types...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-8" })] }), _jsx(Button, { onClick: () => setIsAddDialogOpen(true), size: "icon", children: _jsx(Plus, { className: "h-4 w-4" }) })] }), _jsx("div", { className: "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex-1 overflow-y-auto", children: isLoading ? (_jsx("div", { className: "space-y-2", children: [1, 2, 3].map((i) => (_jsx("div", { className: "h-16 animate-pulse rounded border bg-muted" }, i))) })) : filteredLookupTypes.length === 0 ? (_jsx("div", { className: "flex h-full items-center justify-center text-muted-foreground text-sm", children: searchQuery ? 'No lookup types found' : 'No lookup types. Click + to add one.' })) : (_jsx("div", { className: "space-y-2", children: filteredLookupTypes.map((lookupType) => (_jsx(LookupTypeItem, { lookupType: lookupType, isSelected: selectedLookupType?.id === lookupType.id, onClick: () => onSelectLookupType(lookupType) }, lookupType.id))) })) }), _jsx(AddLookupTypeDialog, { open: isAddDialogOpen, onOpenChange: setIsAddDialogOpen, store: store })] }));
}
//# sourceMappingURL=lookup-types-panel.js.map