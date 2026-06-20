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
import { TextInput, ComboboxInput } from '@/components/core/page/fields';
import { Loader2, Check } from 'lucide-react';
import type { LookupTypes } from '@/lib/common/ds/types/core/LookupTypes';
import type { Store } from '@/lib/core/common/types/Store';
import { useCurrentRowSync, useIsStoreDirty, useIsStorePosting } from '@/components/core/hooks/useStoreHooks';
import { showError, showSuccess } from '@/components/core/common/Notification';
import { getErrorMessage } from '@/lib/core/common/error';

interface AddLookupTypeDialogProps {
  store: Store<LookupTypes>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const valueTypeOptions = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
];

export function AddLookupTypeDialog({ store, open, onOpenChange }: AddLookupTypeDialogProps) {
  const row = useCurrentRowSync(store);
  const isDirty = useIsStoreDirty(store);
  const isPosting = useIsStorePosting(store);

  useEffect(() => {
    if (open) {
      store.createNew({
        partialRecord: {
          code: '',
          name: '',
          description: '',
          valueType: 'string',
        },
      });
    }
  }, [open, store]);

  const handleSave = async () => {
    if (!row) return;
    try {
      await store.save();
      showSuccess('Lookup type created successfully');
      onOpenChange(false);
      await store.executeQuery({ force: true });
    } catch (error) {
      showError(`Failed to save lookup type: ${getErrorMessage(error)}`);
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
          <DialogTitle>Add Lookup Type</DialogTitle>
          <DialogDescription>Create a new lookup type to organize lookup values</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <TextInput label="Code" value={row.code ?? ''} onChange={(value) => store.setValue('code', value)} required />
          <TextInput label="Name" value={row.name ?? ''} onChange={(value) => store.setValue('name', value)} required />
          <TextInput
            label="Description"
            value={row.description ?? ''}
            onChange={(value) => store.setValue('description', value)}
          />
          <ComboboxInput
            label="Value Type"
            value={row.valueType ?? 'string'}
            options={valueTypeOptions}
            getValue={(opt) => opt.value}
            getLabel={(opt) => opt.label}
            onSelect={(value) => store.setValue('valueType', value as 'string' | 'number')}
            required
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
