/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../../../components/ui/dialog';
import { Button } from '../../../../../../components/ui/button';
import { TextInput, NumberInput } from '../../../../../../components/core/page/fields';
import { Loader2, Check } from 'lucide-react';
import {
  useCurrentRowSync,
  useIsStoreDirty,
  useIsStorePosting,
} from '../../../../../../components/core/hooks/useStoreHooks';
import { showError } from '../../../../../../components/core/common/Notification';
import { getErrorMessage } from '../../../../../../lib/core/common/error';
export function AddLookupValueDialog({ store, lookupType, open, onOpenChange }) {
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
  return _jsx(Dialog, {
    open: open,
    onOpenChange: onOpenChange,
    children: _jsxs(DialogContent, {
      children: [
        _jsxs(DialogHeader, {
          children: [
            _jsx(DialogTitle, { children: 'Add Lookup Value' }),
            _jsxs(DialogDescription, { children: ['Add a new value to ', lookupType.name] }),
          ],
        }),
        _jsxs('div', {
          className: 'space-y-4 py-4',
          children: [
            lookupType.valueType === 'number'
              ? _jsx(NumberInput, {
                  label: 'Value',
                  value: row.value ? Number.parseFloat(row.value) : undefined,
                  onChange: (value) => store.setValue('value', value?.toString() ?? ''),
                  required: true,
                })
              : _jsx(TextInput, {
                  label: 'Value',
                  value: row.value ?? '',
                  onChange: (value) => store.setValue('value', value),
                  required: true,
                }),
            _jsx(TextInput, {
              label: 'Label',
              value: row.label ?? '',
              onChange: (value) => store.setValue('label', value),
              required: true,
            }),
            _jsx(TextInput, {
              label: 'Description',
              value: row.description ?? '',
              onChange: (value) => store.setValue('description', value),
              multiline: true,
            }),
            _jsx(NumberInput, {
              label: 'Display Order',
              value: row.displayOrder ?? undefined,
              onChange: (value) => store.setValue('displayOrder', value ?? null),
            }),
          ],
        }),
        _jsxs(DialogFooter, {
          children: [
            _jsx(Button, { variant: 'outline', onClick: handleCancel, disabled: isPosting, children: 'Cancel' }),
            _jsxs(Button, {
              onClick: handleSave,
              disabled: isPosting || !isDirty,
              children: [
                isPosting
                  ? _jsx(Loader2, { className: 'mr-2 h-4 w-4 animate-spin' })
                  : _jsx(Check, { className: 'mr-2 h-4 w-4' }),
                'Create',
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
//# sourceMappingURL=add-lookup-value-dialog.js.map
