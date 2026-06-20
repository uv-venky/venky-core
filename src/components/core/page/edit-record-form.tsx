'use client';

import { useIsStoreLoading } from '@/components/core/hooks/useStoreHooks';
import type { Store } from '@/lib/core/common/types/Store';
import { memo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

type EditRecordFormProps<T extends object> = {
  title: string;
  store: Store<T>;
  children: React.ReactNode;
  numberOfFields?: number;
};

function EditRecordFormComponent<T extends object>({
  title,
  store,
  children,
  numberOfFields = 20,
}: EditRecordFormProps<T>) {
  const isStoreLoading = useIsStoreLoading(store);
  return (
    <ScrollArea className="h-full">
      <div className="shrink-0 p-6">
        <div className="font-semibold text-xl">{title}</div>
        <div className="font-light text-sm">{`Select Rows to configure, Fill in the form and click save changes after all the changes were done.`}</div>
      </div>
      {isStoreLoading ? (
        <div className="items-center gap-2 px-6">
          {[...Array(numberOfFields)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: index is fine here
            <div key={i} className="grid grid-cols-3 p-2">
              <Skeleton className="col-span-1 mr-2 h-9" />
              <Skeleton className="col-span-2 mr-2 h-9" />
            </div>
          ))}
        </div>
      ) : (
        <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex-1 overflow-auto px-6">
          {children}
        </div>
      )}
    </ScrollArea>
  );
}

export const EditRecordForm = memo(EditRecordFormComponent) as <T extends object>(
  props: EditRecordFormProps<T>,
) => React.ReactNode;
