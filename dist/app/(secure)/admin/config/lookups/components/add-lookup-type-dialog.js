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
import { TextInput, ComboboxInput } from '../../../../../../components/core/page/fields';
import { Loader2, Check } from 'lucide-react';
import {
  useCurrentRowSync,
  useIsStoreDirty,
  useIsStorePosting,
} from '../../../../../../components/core/hooks/useStoreHooks';
import { showError, showSuccess } from '../../../../../../components/core/common/Notification';
import { getErrorMessage } from '../../../../../../lib/core/common/error';
const valueTypeOptions = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
];
export function AddLookupTypeDialog({ store, open, onOpenChange }) {
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
  return _jsx(Dialog, {
    open: open,
    onOpenChange: onOpenChange,
    children: _jsxs(DialogContent, {
      children: [
        _jsxs(DialogHeader, {
          children: [
            _jsx(DialogTitle, { children: 'Add Lookup Type' }),
            _jsx(DialogDescription, { children: 'Create a new lookup type to organize lookup values' }),
          ],
        }),
        _jsxs('div', {
          className: 'space-y-4 py-4',
          children: [
            _jsx(TextInput, {
              label: 'Code',
              value: row.code ?? '',
              onChange: (value) => store.setValue('code', value),
              required: true,
            }),
            _jsx(TextInput, {
              label: 'Name',
              value: row.name ?? '',
              onChange: (value) => store.setValue('name', value),
              required: true,
            }),
            _jsx(TextInput, {
              label: 'Description',
              value: row.description ?? '',
              onChange: (value) => store.setValue('description', value),
            }),
            _jsx(ComboboxInput, {
              label: 'Value Type',
              value: row.valueType ?? 'string',
              options: valueTypeOptions,
              getValue: (opt) => opt.value,
              getLabel: (opt) => opt.label,
              onSelect: (value) => store.setValue('valueType', value),
              required: true,
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
//# sourceMappingURL=add-lookup-type-dialog.js.map
