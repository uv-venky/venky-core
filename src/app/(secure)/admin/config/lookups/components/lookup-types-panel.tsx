/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDBRows, useIsStoreLoading } from '@/components/core/hooks/useStoreHooks';
import { useLookupTypesStore } from '../hooks/use-lookup-types-store';
import { LookupTypeItem } from './lookup-type-item';
import { AddLookupTypeDialog } from './add-lookup-type-dialog';
import type { LookupTypes } from '@/lib/common/ds/types/core/LookupTypes';

interface LookupTypesPanelProps {
  selectedLookupType: LookupTypes | null;
  onSelectLookupType: (lookupType: LookupTypes | null) => void;
}

export function LookupTypesPanel({ selectedLookupType, onSelectLookupType }: LookupTypesPanelProps) {
  const store = useLookupTypesStore();
  const lookupTypes = useDBRows(store);
  const isLoading = useIsStoreLoading(store);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredLookupTypes = useMemo(() => {
    if (!searchQuery.trim()) {
      return lookupTypes;
    }
    const query = searchQuery.toLowerCase();
    return lookupTypes.filter(
      (lt) =>
        lt.code?.toLowerCase().includes(query) ||
        lt.name?.toLowerCase().includes(query) ||
        lt.description?.toLowerCase().includes(query),
    );
  }, [lookupTypes, searchQuery]);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search lookup types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} size="icon">
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
        ) : filteredLookupTypes.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            {searchQuery ? 'No lookup types found' : 'No lookup types. Click + to add one.'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLookupTypes.map((lookupType) => (
              <LookupTypeItem
                key={lookupType.id}
                lookupType={lookupType}
                isSelected={selectedLookupType?.id === lookupType.id}
                onClick={() => onSelectLookupType(lookupType)}
              />
            ))}
          </div>
        )}
      </div>

      <AddLookupTypeDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} store={store} />
    </div>
  );
}
