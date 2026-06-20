/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Button } from '@/components/ui/button';
import { CommandItem } from '@/components/ui/command';
import type { SavedSearch } from '@/lib/common/ds/types/core/SavedSearch';
import { cn } from '@/lib/utils';
import { Check, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { WaveDots } from '@/components/core/common/WaveDots';
import { useClientSession } from '@/components/core/session-context';

type Props<T extends object> = {
  view: SavedSearch<T>;
  activeView?: SavedSearch<T>;
  onDeleteView: (id: string) => Promise<void>;
  onSelectView: (view?: SavedSearch<T>) => void;
};

export default function SavedViewItem<T extends object>(props: Props<T>) {
  const { activeView, view, onDeleteView, onSelectView } = props;
  const [busy, setBusy] = useState(false);
  const session = useClientSession();

  return (
    <CommandItem
      key={view.id}
      value={view.id}
      data-testid={`saved-view-item-${view.id}`}
      onSelect={() => {
        onSelectView(view.id === activeView?.id ? undefined : view);
      }}
      className="group/view flex cursor-pointer items-center justify-between"
    >
      {view.name}
      <div className="flex items-center gap-2">
        {view.isDefault && <Star className="ml-auto" />}
        {view.id === activeView?.id && <Check className="ml-auto" />}
        {(!view.isPublic || view.owner === session.userName) && (
          <Button
            variant="ghost"
            size="icon"
            data-testid={`delete-saved-view-${view.id}`}
            className={cn('hidden h-4 w-4 rounded-full group-hover/view:block', {
              visible: busy,
            })}
            onClick={async (e) => {
              try {
                e.stopPropagation();
                setBusy(true);
                await onDeleteView(view.id);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? <WaveDots active /> : <Trash2 className="text-red-500" />}
          </Button>
        )}
      </div>
    </CommandItem>
  );
}
