/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Plus, Search, Upload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../../../../../components/ui/button';
import { Input } from '../../../../../../components/ui/input';
import { useDBRows, useIsStoreLoading } from '../../../../../../components/core/hooks/useStoreHooks';
import { useLookupValuesStore } from '../hooks/use-lookup-values-store';
import { LookupValueRow } from './lookup-value-row';
import { AddLookupValueDialog } from './add-lookup-value-dialog';
import { BulkInsertLookupValuesDialog } from './bulk-insert-lookup-values-dialog';
import { Badge } from '../../../../../../components/ui/badge';
import { Hash, Type } from 'lucide-react';
export function LookupValuesPanel({ lookupType }) {
  const store = useLookupValuesStore();
  const lookupValues = useDBRows(store);
  const isLoading = useIsStoreLoading(store);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkInsertDialogOpen, setIsBulkInsertDialogOpen] = useState(false);
  const { id: lookupTypeId } = lookupType ?? {};
  // Filter values by selected lookup type
  useEffect(() => {
    if (lookupTypeId) {
      store.executeQuery({
        query: {
          data: { lookupTypeId },
          sort: { displayOrder: 1, label: 2 },
        },
      });
    } else {
      store.clearSync();
    }
  }, [lookupTypeId, store]);
  const filteredLookupValues = useMemo(() => {
    if (!searchQuery.trim()) {
      return lookupValues;
    }
    const query = searchQuery.toLowerCase();
    return lookupValues.filter(
      (lv) =>
        lv.value?.toLowerCase().includes(query) ||
        lv.label?.toLowerCase().includes(query) ||
        lv.description?.toLowerCase().includes(query),
    );
  }, [lookupValues, searchQuery]);
  if (!lookupType) {
    return _jsx('div', {
      className: 'flex h-full items-center justify-center text-muted-foreground text-sm',
      children: 'Select a lookup type to view its values',
    });
  }
  return _jsxs('div', {
    className: 'flex h-full flex-col',
    children: [
      _jsx('div', {
        className: 'mb-4 flex items-center gap-2',
        children: _jsxs('div', {
          className: 'flex-1',
          children: [
            _jsxs('div', {
              className: 'flex items-center gap-2',
              children: [
                _jsx('span', { className: 'font-semibold text-lg', children: lookupType.name }),
                _jsxs(Badge, {
                  variant: lookupType.valueType === 'number' ? 'default' : 'secondary',
                  className: 'text-xs',
                  children: [
                    lookupType.valueType === 'number'
                      ? _jsx(Hash, { className: 'mr-1 h-3 w-3' })
                      : _jsx(Type, { className: 'mr-1 h-3 w-3' }),
                    lookupType.valueType,
                  ],
                }),
              ],
            }),
            lookupType.description &&
              _jsx('div', { className: 'mt-1 text-muted-foreground text-sm', children: lookupType.description }),
          ],
        }),
      }),
      _jsxs('div', {
        className: 'mb-4 flex items-center gap-2',
        children: [
          _jsxs('div', {
            className: 'relative flex-1',
            children: [
              _jsx(Search, { className: 'absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-muted-foreground' }),
              _jsx(Input, {
                placeholder: 'Search values...',
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                className: 'pl-8',
              }),
            ],
          }),
          _jsx(Button, {
            onClick: () => setIsBulkInsertDialogOpen(true),
            size: 'icon',
            variant: 'outline',
            'data-tip': 'Bulk insert',
            children: _jsx(Upload, { className: 'h-4 w-4' }),
          }),
          _jsx(Button, {
            onClick: () => setIsAddDialogOpen(true),
            size: 'icon',
            'data-tip': 'Add single value',
            children: _jsx(Plus, { className: 'h-4 w-4' }),
          }),
        ],
      }),
      _jsx('div', {
        className:
          'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex-1 overflow-y-auto',
        children: isLoading
          ? _jsx('div', {
              className: 'space-y-2',
              children: [1, 2, 3].map((i) =>
                _jsx('div', { className: 'h-16 animate-pulse rounded border bg-muted' }, i),
              ),
            })
          : filteredLookupValues.length === 0
            ? _jsx('div', {
                className: 'flex h-full items-center justify-center text-muted-foreground text-sm',
                children: searchQuery ? 'No values found' : 'No values. Click + to add one.',
              })
            : _jsx('div', {
                className: 'space-y-2',
                children: filteredLookupValues.map((lookupValue) =>
                  _jsx(
                    LookupValueRow,
                    { lookupValue: lookupValue, lookupType: lookupType, store: store },
                    lookupValue.id,
                  ),
                ),
              }),
      }),
      _jsx(AddLookupValueDialog, {
        open: isAddDialogOpen,
        onOpenChange: setIsAddDialogOpen,
        store: store,
        lookupType: lookupType,
      }),
      _jsx(BulkInsertLookupValuesDialog, {
        open: isBulkInsertDialogOpen,
        onOpenChange: setIsBulkInsertDialogOpen,
        store: store,
        lookupType: lookupType,
      }),
    ],
  });
}
//# sourceMappingURL=lookup-values-panel.js.map
