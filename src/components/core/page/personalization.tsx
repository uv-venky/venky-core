import { Button, type buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SavedSearch, SavedSearchPayload } from '@/lib/common/ds/types/core/SavedSearch';
import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';
import { Settings2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import useSavedViews from '@/components/core/hooks/useSavedViews';
import SavedViewContent from '@/components/core/smart-search/SavedSearchContent';
import type { AccessorKeyColumnDef, Table } from '@tanstack/react-table';
import type { Store } from '@/lib/core/common/types/Store';
import { ReorderableComboboxNoPopover } from '@/components/core/common/reorderable-combobox';
import { mergeSavedColumnOrder, resetTableColumnLayout } from '@/components/core/page/useTable';
import {
  applySavedPageSize,
  applySavedTablePreferences,
  applyTablePageSize,
  getDefaultPageSize,
  getDefaultTableColumnPreferences,
  getTablePreferencesCustomPayload,
  type TableColumnPreferences,
} from '@/components/core/page/table-column-preferences';
import { ColumnViewsDensityTab } from '@/components/core/page/column-views-density-tab';
import { ColumnViewsStickyTab } from '@/components/core/page/column-views-sticky-tab';

export type PersonalizationTab = {
  key: string;
  label: string;
  tabContent: React.ReactNode;
  onSelectView: (payload?: SavedSearchPayload<unknown>) => void;
  updatePayload: (payload: SavedSearchPayload<unknown>) => SavedSearchPayload<unknown>;
};

export function Personalization({
  variant,
  className,
  pageId,
  itemId,
  tabs,
  store,
}: {
  variant?: VariantProps<typeof buttonVariants>['variant'];
  className?: string;
  pageId: string;
  itemId: string;
  tabs: Array<PersonalizationTab>;
  store: Store<any>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('views');
  const [activeView, setActiveView] = useState<SavedSearch<unknown> | undefined>();

  const onSelectView = useCallback(
    (view?: SavedSearch<unknown>) => {
      tabs.forEach((tab) => {
        tab.onSelectView(view?.payload);
      });

      setActiveView(view);
    },
    [tabs],
  );

  const { savedSearches, createSavedSearch, updateSavedSearch, deleteSavedSearch, isLoading } = useSavedViews<any>(
    pageId,
    itemId,
    onSelectView,
    store,
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant ?? 'ghost'}
          size="icon"
          className={cn('h-8 w-8 rounded-full p-0 transition-colors hover:bg-muted', className)}
        >
          <Settings2 className="h-4 w-4" />
          <span className="sr-only">Personalization settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="flex max-h-[calc(var(--radix-popper-available-height)-1rem)] w-80 flex-col overflow-hidden rounded-lg border border-border/50 p-0 shadow-lg dark:shadow-dark"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 gap-0 overflow-hidden">
          <TabsList className="flex w-full items-center rounded-none">
            <TabsTrigger
              value="views"
              className="flex-1 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Views
            </TabsTrigger>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="flex-1 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="views" className="flex flex-1 flex-col overflow-hidden pb-2 focus:outline-none">
            <div className="shrink-0 px-3 py-1.5">
              <h3 className="font-medium text-foreground/90 text-sm">Personalization Views</h3>
              <p className="mt-0.5 text-muted-foreground text-xs">Manage your saved configurations</p>
            </div>
            <DropdownMenuSeparator className="my-1 shrink-0" />
            <SavedViewContent
              activeView={activeView}
              isLoading={isLoading}
              savedSearches={savedSearches}
              onDeleteView={async (id) => {
                await deleteSavedSearch(id);
                setIsOpen(false);
              }}
              onCreateView={async (view) => {
                let payload = { ...view.payload };
                tabs.forEach((tab) => {
                  payload = tab.updatePayload(payload);
                });
                const newView = {
                  ...view,
                  payload,
                };
                const currentView = await createSavedSearch(newView);
                setActiveView(currentView);
                setIsOpen(false);
              }}
              onUpdateView={async (view) => {
                let payload = { ...view.payload };
                tabs.forEach((tab) => {
                  payload = tab.updatePayload(payload);
                });
                const newView = {
                  ...view,
                  payload,
                };
                await updateSavedSearch(newView);
                setIsOpen(false);
              }}
              onSelectView={(view) => {
                onSelectView(view);
                setIsOpen(false);
              }}
            />
          </TabsContent>

          {tabs.map((tab) => (
            <TabsContent
              key={tab.key}
              value={tab.key}
              className="flex flex-1 flex-col overflow-hidden pb-2 focus:outline-none"
            >
              {tab.tabContent}
            </TabsContent>
          ))}
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function useTableColumnsPersonalizationTab<T extends object>(table: Table<T>) {
  return useMemo((): PersonalizationTab => {
    const tab: PersonalizationTab = {
      key: 'columns',
      label: 'Columns',
      tabContent: (
        <>
          <div className="shrink-0 px-3 py-1.5">
            <h3 className="font-medium text-foreground/90 text-sm">Toggle Columns</h3>
            <p className="mt-0.5 text-muted-foreground text-xs">Select which columns to display in the table</p>
          </div>
          <DropdownMenuSeparator className="my-1" />
          <div className="flex flex-1 flex-col overflow-hidden">
            <ReorderableComboboxNoPopover
              onChange={(keys) => {
                table.setColumnOrder(keys);
                const meta = table.options.meta as {
                  updateProxy: { count: number };
                };
                meta.updateProxy.count++;
              }}
              options={table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => ({
                  value: column.id,
                  label: (column.columnDef.meta as { label: string })?.label ?? column.id,
                }))}
              onToggle={(value, isSelected) => {
                table.getColumn(value)?.toggleVisibility(isSelected);
              }}
              values={table.getState().columnOrder}
              emptyMessage="No columns found"
              placeholder="Columns"
            />
          </div>
        </>
      ),
      onSelectView: (payload) => {
        if (payload) {
          const { custom } = payload;
          if (custom?.columnOrder) {
            const tableColumns = (table.options.meta as { tableColumns?: AccessorKeyColumnDef<T>[] })?.tableColumns;
            table.setColumnOrder(
              tableColumns?.length ? mergeSavedColumnOrder(custom.columnOrder, tableColumns) : custom.columnOrder,
            );
          }
          if (custom?.columnVisibility) {
            table.setColumnVisibility(custom.columnVisibility);
          }
          if (custom?.columnSizing) {
            table.setColumnSizing(custom.columnSizing);
          } else {
            table.resetColumnSizing();
          }
          if (custom) {
            applySavedTablePreferences(table, custom);
            void applySavedPageSize(table, custom.pageSize);
          }
        } else {
          void resetTableColumnLayout(table);
        }
      },
      updatePayload: (payload) => {
        payload.custom = getTablePreferencesCustomPayload(table);
        return payload;
      },
    };
    return tab;
  }, [table]);
}

export function useTableDensityPersonalizationTab<T extends object>(table: Table<T>) {
  return useMemo((): PersonalizationTab => {
    const meta = table.options.meta as {
      preferences: TableColumnPreferences;
      setPreferences: (p: TableColumnPreferences) => void;
    };
    return {
      key: 'density',
      label: 'Density',
      tabContent: (
        <>
          <div className="shrink-0 px-3 py-1.5">
            <h3 className="font-medium text-foreground/90 text-sm">Density</h3>
            <p className="mt-0.5 text-muted-foreground text-xs">Adjust row height and rows per page</p>
          </div>
          <DropdownMenuSeparator className="my-1" />
          <div className="px-3 pb-2">
            <ColumnViewsDensityTab
              value={meta.preferences.tableVariant}
              onChange={(tableVariant) => {
                meta.setPreferences({ ...meta.preferences, tableVariant });
                const updateProxy = (table.options.meta as { updateProxy: { count: number } }).updateProxy;
                updateProxy.count++;
              }}
              pageSize={table.getState().pagination.pageSize}
              onPageSizeChange={(pageSize) => {
                void applyTablePageSize(table, pageSize);
              }}
            />
          </div>
        </>
      ),
      onSelectView: (payload) => {
        if (payload?.custom) {
          applySavedTablePreferences(table, payload.custom);
          void applySavedPageSize(table, payload.custom.pageSize);
        } else {
          meta.setPreferences(getDefaultTableColumnPreferences(table));
          void applyTablePageSize(table, getDefaultPageSize(table));
        }
      },
      updatePayload: (payload) => {
        payload.custom = { ...payload.custom, ...getTablePreferencesCustomPayload(table) };
        return payload;
      },
    };
  }, [table]);
}

export function useTableStickyPersonalizationTab<T extends object>(table: Table<T>) {
  return useMemo((): PersonalizationTab => {
    const meta = table.options.meta as {
      preferences: TableColumnPreferences;
      setPreferences: (p: TableColumnPreferences) => void;
    };
    return {
      key: 'sticky',
      label: 'Sticky',
      tabContent: (
        <>
          <div className="shrink-0 px-3 py-1.5">
            <h3 className="font-medium text-foreground/90 text-sm">Sticky columns</h3>
            <p className="mt-0.5 text-muted-foreground text-xs">Freeze columns while scrolling</p>
          </div>
          <DropdownMenuSeparator className="my-1" />
          <div className="px-3 pb-2">
            <ColumnViewsStickyTab
              stickyLeftCount={meta.preferences.stickyLeftCount}
              stickyRightCount={meta.preferences.stickyRightCount}
              onStickyLeftChange={(stickyLeftCount) => {
                meta.setPreferences({ ...meta.preferences, stickyLeftCount });
                const updateProxy = (table.options.meta as { updateProxy: { count: number } }).updateProxy;
                updateProxy.count++;
              }}
              onStickyRightChange={(stickyRightCount) => {
                meta.setPreferences({ ...meta.preferences, stickyRightCount });
                const updateProxy = (table.options.meta as { updateProxy: { count: number } }).updateProxy;
                updateProxy.count++;
              }}
            />
          </div>
        </>
      ),
      onSelectView: (payload) => {
        if (payload?.custom) {
          applySavedTablePreferences(table, payload.custom);
        } else {
          meta.setPreferences(getDefaultTableColumnPreferences(table));
        }
      },
      updatePayload: (payload) => {
        payload.custom = { ...payload.custom, ...getTablePreferencesCustomPayload(table) };
        return payload;
      },
    };
  }, [table]);
}
