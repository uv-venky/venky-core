/* Copyright (c) 2024-present Venky Corp. */

'use client';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type ColumnOption = { value: string; label: string };

function SortableColumnItem({ id, label, onRemove }: { id: string; label: string; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'group flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-sm hover:bg-muted/60',
        isDragging && 'border-border bg-muted shadow-sm',
      )}
      data-testid={`columns-menu-option-${id}`}
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${label}`}
      >
        <GripVertical className="size-4" />
      </button>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <button
        type="button"
        className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        data-testid={`column-views-remove-${id}`}
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function ColumnViewsColumnsTab({
  columnOptions,
  displayedColumnIds,
  onDisplayedChange,
  onRestore,
}: {
  columnOptions: ColumnOption[];
  displayedColumnIds: string[];
  onDisplayedChange: (ids: string[], visibilityUpdates: Record<string, boolean>) => void;
  onRestore: () => void;
}) {
  const [search, setSearch] = useState('');

  const labelById = useMemo(() => {
    const map = new Map<string, string>();
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
      if (displayedSet.has(option.value)) return false;
      return !q || option.label.toLowerCase().includes(q);
    });
  }, [columnOptions, displayedSet, search]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = displayedColumnIds.indexOf(active.id as string);
    const newIndex = displayedColumnIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    onDisplayedChange(arrayMove(displayedColumnIds, oldIndex, newIndex), {});
  };

  const handleRemove = (id: string) => {
    onDisplayedChange(
      displayedColumnIds.filter((colId) => colId !== id),
      { [id]: false },
    );
  };

  const handleAdd = (id: string) => {
    onDisplayedChange([...displayedColumnIds, id], { [id]: true });
  };

  const handleAddAll = () => {
    const toAdd = availableColumns.map((o) => o.value);
    const visibilityUpdates = toAdd.reduce(
      (acc, id) => {
        acc[id] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    );
    onDisplayedChange([...displayedColumnIds, ...toAdd], visibilityUpdates);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 px-1 py-2">
      <p className="text-muted-foreground text-sm">Edit the column settings on your table.</p>

      <div className="relative">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search columns"
          className="pl-9"
          data-testid="column-views-search"
        />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-4">
        <div className="flex min-h-0 flex-col rounded-md border">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="font-medium text-sm">Displayed columns</span>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={onRestore}>
              Restore
            </Button>
          </div>
          <div
            className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 min-h-0 flex-1 overflow-y-auto p-2"
            data-testid="columns-menu-content"
          >
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={displayedColumnIds} strategy={verticalListSortingStrategy}>
                {filteredDisplayed.length === 0 ? (
                  <p className="px-2 py-4 text-center text-muted-foreground text-sm">No displayed columns</p>
                ) : (
                  filteredDisplayed.map((id) => (
                    <SortableColumnItem
                      key={id}
                      id={id}
                      label={labelById.get(id) ?? id}
                      onRemove={() => handleRemove(id)}
                    />
                  ))
                )}
              </SortableContext>
            </DndContext>
          </div>
        </div>

        <div className="flex min-h-0 flex-col rounded-md border">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="font-medium text-sm">Available columns</span>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={handleAddAll}
              disabled={availableColumns.length === 0}
            >
              Add all
            </Button>
          </div>
          <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 min-h-0 flex-1 overflow-y-auto p-2">
            {availableColumns.length === 0 ? (
              <p className="px-2 py-4 text-center text-muted-foreground text-sm">No available columns</p>
            ) : (
              availableColumns.map((option) => (
                <div
                  key={option.value}
                  className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60"
                >
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  <button
                    type="button"
                    className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                    onClick={() => handleAdd(option.value)}
                    aria-label={`Add ${option.label}`}
                    data-testid={`column-views-add-${option.value}`}
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
