/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TextInput, NumberInput } from '@/components/core/page/fields';
import { Loader2, Check } from 'lucide-react';
import type { LookupValues } from '@/lib/common/ds/types/core/LookupValues';
import type { LookupTypes } from '@/lib/common/ds/types/core/LookupTypes';
import type { Store } from '@/lib/core/common/types/Store';
import { useCurrentRowSync, useIsStoreDirty, useIsStorePosting } from '@/components/core/hooks/useStoreHooks';
import { showError } from '@/components/core/common/Notification';
import { getErrorMessage } from '@/lib/core/common/error';

interface AddLookupValueDialogProps {
  store: Store<LookupValues>;
  lookupType: LookupTypes;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLookupValueDialog({ store, lookupType, open, onOpenChange }: AddLookupValueDialogProps) {
  const row = useCurrentRowSync(store);
  const isDirty = useIsStoreDirty(store);
  const isPosting = useIsStorePosting(store);

  useEffect(() => {
    if (open) {
      store.createNew({
        partialRecord: {
          lookupTypeId: lookupType.id,
          value: '',
          label: '',
          description: '',
          displayOrder: null,
          isActive: true,
        },
      });
    }
  }, [open, lookupType, store]);

  const handleSave = async () => {
    if (!row) return;
    try {
      // Validate value based on value type
      if (lookupType.valueType === 'number') {
        const numValue = Number.parseFloat(row.value ?? '');
        if (Number.isNaN(numValue)) {
          showError('Value must be a valid number');
          return;
        }
      }

      await store.save({ feedback: 'Lookup value created successfully' });
      onOpenChange(false);
      await store.executeQuery({ force: true });
    } catch (error) {
      showError(`Failed to save lookup value: ${getErrorMessage(error)}`);
    }
  };

  const handleCancel = () => {
    store.clearSync();
    onOpenChange(false);
  };

  if (!row) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Lookup Value</DialogTitle>
          <DialogDescription>Add a new value to {lookupType.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {lookupType.valueType === 'number' ? (
            <NumberInput
              label="Value"
              value={row.value ? Number.parseFloat(row.value) : undefined}
              onChange={(value) => store.setValue('value', value?.toString() ?? '')}
              required
            />
          ) : (
            <TextInput
              label="Value"
              value={row.value ?? ''}
              onChange={(value) => store.setValue('value', value)}
              required
            />
          )}
          <TextInput
            label="Label"
            value={row.label ?? ''}
            onChange={(value) => store.setValue('label', value)}
            required
          />
          <TextInput
            label="Description"
            value={row.description ?? ''}
            onChange={(value) => store.setValue('description', value)}
            multiline
          />
          <NumberInput
            label="Display Order"
            value={row.displayOrder ?? undefined}
            onChange={(value) => store.setValue('displayOrder', value ?? null)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isPosting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPosting || !isDirty}>
            {isPosting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
