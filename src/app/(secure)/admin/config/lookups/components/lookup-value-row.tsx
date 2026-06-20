/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { LookupValues } from '@/lib/common/ds/types/core/LookupValues';
import type { LookupTypes } from '@/lib/common/ds/types/core/LookupTypes';
import type { Store } from '@/lib/core/common/types/Store';
import { useIsStorePosting } from '@/components/core/hooks/useStoreHooks';
import { showError } from '@/components/core/common/Notification';
import { getErrorMessage } from '@/lib/core/common/error';
import { confirmWithUser } from '@/components/core/common';
import { TextInput, NumberInput } from '@/components/core/page/fields';

interface LookupValueRowProps {
  lookupValue: LookupValues;
  lookupType: LookupTypes;
  store: Store<LookupValues>;
}

export function LookupValueRow({ lookupValue, lookupType, store }: LookupValueRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(lookupValue.value);
  const [localLabel, setLocalLabel] = useState(lookupValue.label);
  const [localDescription, setLocalDescription] = useState(lookupValue.description ?? '');
  const [localDisplayOrder, setLocalDisplayOrder] = useState(lookupValue.displayOrder?.toString() ?? '');
  const isPosting = useIsStorePosting(store);

  const handleEdit = async () => {
    const rowId = store.rowId(lookupValue);
    await store.setCurrentRowId(rowId);
    const row = store.currentRow();
    if (row) {
      setLocalValue(row.value ?? '');
      setLocalLabel(row.label ?? '');
      setLocalDescription(row.description ?? '');
      setLocalDisplayOrder(row.displayOrder?.toString() ?? '');
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    const rowId = store.rowId(lookupValue);
    await store.setCurrentRowId(rowId);
    const row = store.currentRow();
    if (!row) return;

    try {
      // Validate value based on value type
      if (lookupType.valueType === 'number') {
        const numValue = Number.parseFloat(localValue);
        if (Number.isNaN(numValue)) {
          showError('Value must be a valid number');
          return;
        }
      }

      store.setValue('value', localValue);
      store.setValue('label', localLabel);
      store.setValue('description', localDescription || null);
      store.setValue('displayOrder', localDisplayOrder ? Number.parseInt(localDisplayOrder, 10) : null);
      if (store.isRowDirty(rowId)) {
        await store.save({ feedback: 'Value updated successfully' });
      }
      setIsEditing(false);
    } catch (error) {
      showError(`Failed to save value: ${getErrorMessage(error)}`);
    }
  };

  const handleCancel = () => {
    setLocalValue(lookupValue.value);
    setLocalLabel(lookupValue.label);
    setLocalDescription(lookupValue.description ?? '');
    setLocalDisplayOrder(lookupValue.displayOrder?.toString() ?? '');
    setIsEditing(false);
    store.resetRow(lookupValue.id);
  };

  const handleToggleActive = async () => {
    const rowId = store.rowId(lookupValue);
    await store.setCurrentRowId(rowId);
    const row = store.currentRow();
    if (!row) return;

    try {
      store.setValue('isActive', !row.isActive);
      await store.save({ feedback: 'NONE' });
    } catch (error) {
      showError(`Failed to update value: ${getErrorMessage(error)}`);
    }
  };

  const handleDelete = async () => {
    const valueLabel = lookupValue.label || lookupValue.value;
    if (
      !(await confirmWithUser({
        title: 'Delete Value',
        content: `Are you sure you want to delete "${valueLabel}"?`,
        confirmButtonLabel: 'Delete',
      }))
    ) {
      return;
    }

    try {
      const rowId = store.rowId(lookupValue);
      await store.deleteRow(rowId);
      await store.save({ feedback: 'Value deleted successfully' });
    } catch (error) {
      showError(`Failed to delete value: ${getErrorMessage(error)}`);
    }
  };

  const handleMoveOrder = async (direction: 'up' | 'down') => {
    // This is a simplified implementation - in a real scenario, you'd need to swap orders with adjacent items
    const rowId = store.rowId(lookupValue);
    await store.setCurrentRowId(rowId);
    const row = store.currentRow();
    if (!row) return;

    const currentOrder = row.displayOrder ?? 0;
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;

    try {
      store.setValue('displayOrder', newOrder);
      await store.save({ feedback: 'NONE' });
    } catch (error) {
      showError(`Failed to reorder value: ${getErrorMessage(error)}`);
    }
  };

  if (isEditing) {
    return (
      <div className="rounded-lg border border-primary bg-accent/50 p-3">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {lookupType.valueType === 'number' ? (
              <NumberInput
                label="Value"
                value={localValue ? Number.parseFloat(localValue) : undefined}
                onChange={(value) => setLocalValue(value?.toString() ?? '')}
              />
            ) : (
              <TextInput label="Value" value={localValue} onChange={(value) => setLocalValue(value ?? '')} />
            )}
            <NumberInput
              label="Display Order"
              value={localDisplayOrder ? Number.parseInt(localDisplayOrder, 10) : undefined}
              onChange={(value) => setLocalDisplayOrder(value?.toString() ?? '')}
            />
          </div>
          <TextInput label="Label" value={localLabel} onChange={(value) => setLocalLabel(value ?? '')} />
          <TextInput
            label="Description"
            value={localDescription}
            onChange={(value) => setLocalDescription(value ?? '')}
            multiline
          />
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel} disabled={isPosting}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isPosting}>
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group rounded-lg border p-3 transition-colors hover:bg-accent',
        !lookupValue.isActive && 'opacity-60',
      )}
    >
      <div className="flex items-start gap-3">
        <div role="button" className="flex-1 cursor-pointer" onClick={handleEdit}>
          <div className="flex items-center gap-2">
            <span className="font-medium">{lookupValue.label}</span>
            <span className="text-muted-foreground text-xs">({lookupValue.value})</span>
            {lookupValue.displayOrder != null && (
              <span className="text-muted-foreground text-xs">Order: {lookupValue.displayOrder}</span>
            )}
          </div>
          {lookupValue.description && (
            <div className="mt-1 text-muted-foreground text-sm">{lookupValue.description}</div>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleMoveOrder('up')}
            data-tip="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleMoveOrder('down')}
            data-tip="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 px-2">
            <Switch checked={lookupValue.isActive} onCheckedChange={handleToggleActive} />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={handleDelete}
            data-tip="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
