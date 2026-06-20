import type { buttonVariants } from '@/components/ui/button';
import type { Table } from '@tanstack/react-table';
import type { VariantProps } from 'class-variance-authority';
import { useMemo } from 'react';
import {
  Personalization,
  useTableColumnsPersonalizationTab,
  useTableDensityPersonalizationTab,
  useTableStickyPersonalizationTab,
  type PersonalizationTab,
} from '@/components/core/page/personalization';
import type { Store } from '@/lib/core/common/types/Store';

export function TablePersonalization<T extends object>({
  table,
  variant,
  className,
  pageId,
  itemId,
  store,
}: {
  table: Table<T>;
  variant?: VariantProps<typeof buttonVariants>['variant'];
  className?: string;
  pageId: string;
  itemId: string;
  store: Store<T>;
}) {
  const columnsTab = useTableColumnsPersonalizationTab(table);
  const densityTab = useTableDensityPersonalizationTab(table);
  const stickyTab = useTableStickyPersonalizationTab(table);

  const tabs = useMemo((): PersonalizationTab[] => {
    return [columnsTab, densityTab, stickyTab];
  }, [columnsTab, densityTab, stickyTab]);

  return (
    <Personalization
      className={className}
      tabs={tabs}
      pageId={pageId}
      itemId={itemId}
      variant={variant}
      store={store}
    />
  );
}
