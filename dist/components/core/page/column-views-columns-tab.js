/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { cn } from '../../../lib/utils';
function SortableColumnItem({ id, label, onRemove }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    return (_jsxs("div", { ref: setNodeRef, style: { transform: CSS.Transform.toString(transform), transition }, className: cn('group flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-sm hover:bg-muted/60', isDragging && 'border-border bg-muted shadow-sm'), "data-testid": `columns-menu-option-${id}`, children: [_jsx("button", { type: "button", className: "cursor-grab text-muted-foreground hover:text-foreground", ...attributes, ...listeners, "aria-label": `Reorder ${label}`, children: _jsx(GripVertical, { className: "size-4" }) }), _jsx("span", { className: "min-w-0 flex-1 truncate", children: label }), _jsx("button", { type: "button", className: "rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100", onClick: onRemove, "aria-label": `Remove ${label}`, "data-testid": `column-views-remove-${id}`, children: _jsx(X, { className: "size-4" }) })] }));
}
export function ColumnViewsColumnsTab({ columnOptions, displayedColumnIds, onDisplayedChange, onRestore, }) {
    const [search, setSearch] = useState('');
    const labelById = useMemo(() => {
        const map = new Map();
        for (const option of columnOptions) {
            map.set(option.value, option.label);
        }
        return map;
    }, [columnOptions]);
    const displayedSet = useMemo(() => new Set(displayedColumnIds), [displayedColumnIds]);
    const filteredDisplayed = useMemo(() => {
        const q = search.trim().toLowerCase();
        return displayedColumnIds.filter((id) => {
            const label = labelById.get(id) ?? id;
            return !q || label.toLowerCase().includes(q);
        });
    }, [displayedColumnIds, labelById, search]);
    const availableColumns = useMemo(() => {
        const q = search.trim().toLowerCase();
        return columnOptions.filter((option) => {
            if (displayedSet.has(option.value))
                return false;
            return !q || option.label.toLowerCase().includes(q);
        });
    }, [columnOptions, displayedSet, search]);
    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id)
            return;
        const oldIndex = displayedColumnIds.indexOf(active.id);
        const newIndex = displayedColumnIds.indexOf(over.id);
        if (oldIndex === -1 || newIndex === -1)
            return;
        onDisplayedChange(arrayMove(displayedColumnIds, oldIndex, newIndex), {});
    };
    const handleRemove = (id) => {
        onDisplayedChange(displayedColumnIds.filter((colId) => colId !== id), { [id]: false });
    };
    const handleAdd = (id) => {
        onDisplayedChange([...displayedColumnIds, id], { [id]: true });
    };
    const handleAddAll = () => {
        const toAdd = availableColumns.map((o) => o.value);
        const visibilityUpdates = toAdd.reduce((acc, id) => {
            acc[id] = true;
            return acc;
        }, {});
        onDisplayedChange([...displayedColumnIds, ...toAdd], visibilityUpdates);
    };
    return (_jsxs("div", { className: "flex min-h-0 flex-1 flex-col gap-3 px-1 py-2", children: [_jsx("p", { className: "text-muted-foreground text-sm", children: "Edit the column settings on your table." }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" }), _jsx(Input, { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search columns", className: "pl-9", "data-testid": "column-views-search" })] }), _jsxs("div", { className: "grid min-h-0 flex-1 grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex min-h-0 flex-col rounded-md border", children: [_jsxs("div", { className: "flex items-center justify-between border-b px-3 py-2", children: [_jsx("span", { className: "font-medium text-sm", children: "Displayed columns" }), _jsx(Button, { variant: "link", size: "sm", className: "h-auto p-0 text-xs", onClick: onRestore, children: "Restore" })] }), _jsx("div", { className: "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 min-h-0 flex-1 overflow-y-auto p-2", "data-testid": "columns-menu-content", children: _jsx(DndContext, { sensors: sensors, collisionDetection: closestCenter, onDragEnd: handleDragEnd, children: _jsx(SortableContext, { items: displayedColumnIds, strategy: verticalListSortingStrategy, children: filteredDisplayed.length === 0 ? (_jsx("p", { className: "px-2 py-4 text-center text-muted-foreground text-sm", children: "No displayed columns" })) : (filteredDisplayed.map((id) => (_jsx(SortableColumnItem, { id: id, label: labelById.get(id) ?? id, onRemove: () => handleRemove(id) }, id)))) }) }) })] }), _jsxs("div", { className: "flex min-h-0 flex-col rounded-md border", children: [_jsxs("div", { className: "flex items-center justify-between border-b px-3 py-2", children: [_jsx("span", { className: "font-medium text-sm", children: "Available columns" }), _jsx(Button, { variant: "link", size: "sm", className: "h-auto p-0 text-xs", onClick: handleAddAll, disabled: availableColumns.length === 0, children: "Add all" })] }), _jsx("div", { className: "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 min-h-0 flex-1 overflow-y-auto p-2", children: availableColumns.length === 0 ? (_jsx("p", { className: "px-2 py-4 text-center text-muted-foreground text-sm", children: "No available columns" })) : (availableColumns.map((option) => (_jsxs("div", { className: "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60", children: [_jsx("span", { className: "min-w-0 flex-1 truncate", children: option.label }), _jsx("button", { type: "button", className: "rounded p-0.5 text-muted-foreground hover:text-foreground", onClick: () => handleAdd(option.value), "aria-label": `Add ${option.label}`, "data-testid": `column-views-add-${option.value}`, children: _jsx(Plus, { className: "size-4" }) })] }, option.value)))) })] })] })] }));
}
//# sourceMappingURL=column-views-columns-tab.js.map