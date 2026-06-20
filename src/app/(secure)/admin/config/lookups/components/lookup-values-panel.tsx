/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Plus, Search, Upload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDBRows, useIsStoreLoading } from '@/components/core/hooks/useStoreHooks';
import { useLookupValuesStore } from '../hooks/use-lookup-values-store';
import { LookupValueRow } from './lookup-value-row';
import { AddLookupValueDialog } from './add-lookup-value-dialog';
import { BulkInsertLookupValuesDialog } from './bulk-insert-lookup-values-dialog';
import type { LookupTypes } from '@/lib/common/ds/types/core/LookupTypes';
import { Badge } from '@/components/ui/badge';
import { Hash, Type } from 'lucide-react';

interface LookupValuesPanelProps {
  lookupType: LookupTypes | null;
}

export function LookupValuesPanel({ lookupType }: LookupValuesPanelProps) {
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
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
        Select a lookup type to view its values
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">{lookupType.name}</span>
            <Badge variant={lookupType.valueType === 'number' ? 'default' : 'secondary'} className="text-xs">
              {lookupType.valueType === 'number' ? (
                <Hash className="mr-1 h-3 w-3" />
              ) : (
                <Type className="mr-1 h-3 w-3" />
              )}
              {lookupType.valueType}
            </Badge>
          </div>
          {lookupType.description && <div className="mt-1 text-muted-foreground text-sm">{lookupType.description}</div>}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search values..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={() => setIsBulkInsertDialogOpen(true)} size="icon" variant="outline" data-tip="Bulk insert">
          <Upload className="h-4 w-4" />
        </Button>
        <Button onClick={() => setIsAddDialogOpen(true)} size="icon" data-tip="Add single value">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded border bg-muted" />
            ))}
          </div>
        ) : filteredLookupValues.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            {searchQuery ? 'No values found' : 'No values. Click + to add one.'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLookupValues.map((lookupValue) => (
              <LookupValueRow key={lookupValue.id} lookupValue={lookupValue} lookupType={lookupType} store={store} />
            ))}
          </div>
        )}
      </div>

      <AddLookupValueDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        store={store}
        lookupType={lookupType}
      />
      <BulkInsertLookupValuesDialog
        open={isBulkInsertDialogOpen}
        onOpenChange={setIsBulkInsertDialogOpen}
        store={store}
        lookupType={lookupType}
      />
    </div>
  );
}
