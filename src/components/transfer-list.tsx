'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Item = {
  id: string;
  name: string;
};

type TransferListProps = {
  availableItems: Item[];
  selectedItems?: Item[];
  onChange: (selected: Item[]) => void;
};

const ListItem = ({
  item,
  isSelected,
  onToggle,
}: {
  item: Item;
  isSelected: boolean;
  onToggle: (item: Item) => void;
}) => {
  return (
    <div
      role="button"
      className={cn(
        'flex cursor-pointer items-center rounded-lg p-2 text-sm transition-colors hover:bg-accent/50',
        isSelected && 'bg-accent',
      )}
      onClick={() => onToggle(item)}
    >
      <Checkbox
        id={`item-${item.id}`}
        checked={isSelected}
        onCheckedChange={() => onToggle(item)}
        className="mr-2 data-[state=checked]:bg-primary"
        onClick={(e) => e.stopPropagation()} // This prevents double-triggering
      />
      <span className="truncate">{item.name}</span>
    </div>
  );
};

const ListContainer = ({
  title,
  items,
  selectedItemIds,
  searchTerm,
  onSearchChange,
  onToggleItem,
  filteredItems,
}: {
  title: string;
  items: Item[];
  selectedItemIds: Set<string>;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onToggleItem: (item: Item) => void;
  filteredItems: Item[];
}) => {
  return (
    <div className="flex h-full w-full flex-col rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium text-sm">
          {title}{' '}
          <Badge variant="secondary" className="ml-1 font-normal">
            {items.length}
          </Badge>
        </h3>
      </div>

      <div className="relative mb-3">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <Input
          type="text"
          className="h-8 py-1.5 pl-9 text-sm"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex-grow space-y-0.5 overflow-y-auto">
        {filteredItems.map((item) => (
          <ListItem key={item.id} item={item} isSelected={selectedItemIds.has(item.id)} onToggle={onToggleItem} />
        ))}

        {filteredItems.length === 0 && (
          <div className="py-6 text-center text-muted-foreground text-xs">No items found</div>
        )}
      </div>
    </div>
  );
};

export default function TransferList({ availableItems = [], selectedItems = [], onChange }: TransferListProps) {
  const [available, setAvailable] = useState<Item[]>(availableItems);

  const [leftSearch, setLeftSearch] = useState('');
  const [rightSearch, setRightSearch] = useState('');

  const [leftSelectedIds, setLeftSelectedIds] = useState<Set<string>>(new Set());
  const [rightSelectedIds, setRightSelectedIds] = useState<Set<string>>(new Set());

  // Filter items based on search terms
  const filteredAvailableItems = available.filter((item) => item.name.toLowerCase().includes(leftSearch.toLowerCase()));

  const filteredSelectedItems = selectedItems.filter((item) =>
    item.name.toLowerCase().includes(rightSearch.toLowerCase()),
  );

  // Update available items when props change
  useEffect(() => {
    // Filter out items that are already in the selected list
    const selectedIds = new Set(selectedItems.map((item) => item.id));
    const filteredAvailable = availableItems.filter((item) => !selectedIds.has(item.id));
    setAvailable(filteredAvailable);
  }, [availableItems, selectedItems]);

  const handleToggleLeftItem = useCallback((item: Item) => {
    setLeftSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(item.id)) {
        newSet.delete(item.id);
      } else {
        newSet.add(item.id);
      }
      return newSet;
    });
  }, []);

  const handleToggleRightItem = useCallback((item: Item) => {
    setRightSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(item.id)) {
        newSet.delete(item.id);
      } else {
        newSet.add(item.id);
      }
      return newSet;
    });
  }, []);

  const moveRight = useCallback(() => {
    if (leftSelectedIds.size === 0) return;

    const itemsToMove = available.filter((item) => leftSelectedIds.has(item.id));

    setAvailable((prev) => prev.filter((item) => !leftSelectedIds.has(item.id)));
    setLeftSelectedIds(new Set());

    onChange([...selectedItems, ...itemsToMove]);
  }, [available, leftSelectedIds, selectedItems, onChange]);

  const moveLeft = useCallback(() => {
    if (rightSelectedIds.size === 0) return;

    const itemsToMove = selectedItems.filter((item) => rightSelectedIds.has(item.id));

    setAvailable((prev) => [...prev, ...itemsToMove]);
    setRightSelectedIds(new Set());

    onChange(selectedItems.filter((item) => !rightSelectedIds.has(item.id)));
  }, [selectedItems, rightSelectedIds, onChange]);

  const moveAllRight = useCallback(() => {
    // Only move filtered items when search is active
    const itemsToMove = filteredAvailableItems;

    if (itemsToMove.length === 0) return;

    setAvailable((prev) => prev.filter((item) => !itemsToMove.some((moveItem) => moveItem.id === item.id)));
    setLeftSelectedIds(new Set());

    onChange([...selectedItems, ...itemsToMove]);
  }, [filteredAvailableItems, selectedItems, onChange]);

  const moveAllLeft = useCallback(() => {
    // Only move filtered items when search is active
    const itemsToMove = filteredSelectedItems;

    if (itemsToMove.length === 0) return;

    setAvailable((prev) => [...prev, ...itemsToMove]);
    setRightSelectedIds(new Set());

    onChange(selectedItems.filter((item) => !itemsToMove.some((moveItem) => moveItem.id === item.id)));
  }, [filteredSelectedItems, selectedItems, onChange]);

  return (
    <div className="flex h-[500px] w-full flex-col gap-4 lg:flex-row">
      <div className="h-full w-full lg:w-5/12">
        <ListContainer
          title="Available Options"
          items={available}
          selectedItemIds={leftSelectedIds}
          searchTerm={leftSearch}
          onSearchChange={setLeftSearch}
          onToggleItem={handleToggleLeftItem}
          filteredItems={filteredAvailableItems}
        />
      </div>

      <div className="flex items-center justify-center gap-2 py-4 lg:flex-col">
        <Button
          variant="outline"
          size="icon"
          onClick={moveRight}
          disabled={leftSelectedIds.size === 0}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Move selected to right</span>
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={moveAllRight}
          disabled={filteredAvailableItems.length === 0}
          className="h-8 w-8"
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Move all to right</span>
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={moveLeft}
          disabled={rightSelectedIds.size === 0}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Move selected to left</span>
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={moveAllLeft}
          disabled={filteredSelectedItems.length === 0}
          className="h-8 w-8"
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">Move all to left</span>
        </Button>
      </div>

      <div className="h-full w-full lg:w-5/12">
        <ListContainer
          title="Selected Options"
          items={selectedItems}
          selectedItemIds={rightSelectedIds}
          searchTerm={rightSearch}
          onSearchChange={setRightSearch}
          onToggleItem={handleToggleRightItem}
          filteredItems={filteredSelectedItems}
        />
      </div>
    </div>
  );
}
