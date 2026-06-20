/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TableColumnPreferences } from '@/components/core/page/table-column-preferences';
import { ColumnViewsColumnsTab } from '@/components/core/page/column-views-columns-tab';
import { ColumnViewsDensityTab } from '@/components/core/page/column-views-density-tab';
import { ColumnViewsStickyTab } from '@/components/core/page/column-views-sticky-tab';
import { useColumnViewsDraft, type ColumnViewsTab } from '@/components/core/page/use-column-views-draft';
import { cn } from '@/lib/utils';
import type { Table } from '@tanstack/react-table';
import type { VariantProps } from 'class-variance-authority';
import { Settings2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { subscribe } from 'valtio';

function TabLabel({ label, dirty }: { label: string; dirty: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {label}
      {dirty ? <span className="size-1.5 rounded-full bg-primary" aria-hidden /> : null}
    </span>
  );
}

export function ColumnViewsDialog<T extends object>({
  table,
  preferences: preferencesProp,
  onPreferencesChange: onPreferencesChangeProp,
  variant,
  iconOnly = false,
  className,
  defaultPreferences,
}: {
  table: Table<T>;
  preferences?: TableColumnPreferences;
  onPreferencesChange?: (prefs: TableColumnPreferences) => void;
  variant?: VariantProps<typeof buttonVariants>['variant'];
  iconOnly?: boolean;
  className?: string;
  defaultPreferences?: Partial<TableColumnPreferences>;
}) {
  const meta = table.options.meta as {
    preferences: TableColumnPreferences;
    setPreferences: (prefs: TableColumnPreferences) => void;
  };
  const preferences = preferencesProp ?? meta.preferences;
  const onPreferencesChange = useMemo(
    () =>
      onPreferencesChangeProp ??
      ((prefs: TableColumnPreferences) => {
        meta.setPreferences(prefs);
      }),
    [meta, onPreferencesChangeProp],
  );

  const {
    open,
    activeTab,
    setActiveTab,
    draft,
    updateDraft,
    updatePageSize,
    isPageSizeBusy,
    columnOptions,
    handleOpenChange,
    handleCancel,
    handleApply,
    handleResetTab,
    handleResetAll,
    columnsDirty,
    densityDirty,
    stickyDirty,
    applyDisabled,
    resetDisabled,
  } = useColumnViewsDraft({ table, preferences, onPreferencesChange, defaultPreferences });

  const [tableRevision, setTableRevision] = useState(0);
  useEffect(() => {
    const updateProxy = (table.options.meta as { updateProxy: { count: number } }).updateProxy;
    return subscribe(updateProxy, () => {
      setTableRevision((n) => n + 1);
    });
  }, [table]);

  // tableRevision drives refresh when column visibility/order changes via updateProxy
  void tableRevision;
  const { columnOrder, columnVisibility } = table.getState();
  const optionSet = new Set(columnOptions.map((o) => o.value));
  const visibleCount = columnOrder.filter((id) => optionSet.has(id) && columnVisibility[id] !== false).length;
  const totalCount = columnOptions.length;

  const displayLabel = useMemo(() => {
    if (visibleCount === totalCount) return 'Columns (All)';
    return `Columns (${visibleCount}/${totalCount})`;
  }, [visibleCount, totalCount]);

  const handleDisplayedChange = useCallback(
    (ids: string[], visibilityUpdates: Record<string, boolean>) => {
      updateDraft((prev) => ({
        ...prev,
        displayedColumnIds: ids,
        columnVisibility: {
          ...prev.columnVisibility,
          ...visibilityUpdates,
          ...ids.reduce(
            (acc, id) => {
              acc[id] = true;
              return acc;
            },
            {} as Record<string, boolean>,
          ),
        },
      }));
    },
    [updateDraft],
  );

  const onApply = useCallback(() => {
    handleApply();
  }, [handleApply]);

  const onReset = useCallback(() => {
    handleResetAll();
  }, [handleResetAll]);

  const onRestoreColumns = useCallback(() => {
    handleResetTab('columns');
  }, [handleResetTab]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {iconOnly ? (
          <Button
            variant={variant ?? 'outline'}
            size="icon"
            aria-expanded={open}
            className={cn('size-8 rounded-full', className)}
            data-testid="columns-menu-trigger"
            aria-label={displayLabel}
          >
            <Settings2 className="size-4" />
            <span className="sr-only">{displayLabel}</span>
          </Button>
        ) : (
          <Button
            variant={variant ?? 'outline'}
            aria-expanded={open}
            className={className}
            data-testid="columns-menu-trigger"
          >
            {displayLabel}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        collisionPadding={16}
        className={cn(
          'flex w-[min(720px,var(--radix-popper-available-width))] max-w-[calc(var(--radix-popper-available-width)-1rem)] flex-col gap-0 overflow-hidden p-0',
          'max-h-[calc(var(--radix-popper-available-height)-1rem)]',
        )}
        data-testid="column-views-popover"
      >
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold text-base leading-none">Column views</h2>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as ColumnViewsTab)}
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0 px-4">
            <TabsTrigger
              value="columns"
              className="rounded-none border-transparent border-b-2 bg-transparent px-3 pb-2.5 shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <TabLabel label="Columns" dirty={columnsDirty} />
            </TabsTrigger>
            <TabsTrigger
              value="density"
              className="rounded-none border-transparent border-b-2 bg-transparent px-3 pb-2.5 shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <TabLabel label="Density" dirty={densityDirty} />
            </TabsTrigger>
            <TabsTrigger
              value="sticky"
              className="rounded-none border-transparent border-b-2 bg-transparent px-3 pb-2.5 shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <TabLabel label="Sticky columns" dirty={stickyDirty} />
            </TabsTrigger>
          </TabsList>

          <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 min-h-0 flex-1 overflow-y-auto px-4 py-3">
            <TabsContent value="columns" className="mt-0 flex min-h-[280px] flex-col focus:outline-none">
              <ColumnViewsColumnsTab
                columnOptions={columnOptions}
                displayedColumnIds={draft.displayedColumnIds}
                onDisplayedChange={handleDisplayedChange}
                onRestore={onRestoreColumns}
              />
            </TabsContent>
            <TabsContent value="density" className="mt-0 focus:outline-none">
              <ColumnViewsDensityTab
                value={draft.preferences.tableVariant}
                onChange={(tableVariant) =>
                  updateDraft((prev) => ({
                    ...prev,
                    preferences: { ...prev.preferences, tableVariant },
                  }))
                }
                pageSize={draft.pageSize}
                onPageSizeChange={(pageSize) => {
                  void updatePageSize(pageSize);
                }}
                pageSizeDisabled={isPageSizeBusy}
              />
            </TabsContent>
            <TabsContent value="sticky" className="mt-0 focus:outline-none">
              <ColumnViewsStickyTab
                stickyLeftCount={draft.preferences.stickyLeftCount}
                stickyRightCount={draft.preferences.stickyRightCount}
                onStickyLeftChange={(stickyLeftCount) =>
                  updateDraft((prev) => ({
                    ...prev,
                    preferences: { ...prev.preferences, stickyLeftCount },
                  }))
                }
                onStickyRightChange={(stickyRightCount) =>
                  updateDraft((prev) => ({
                    ...prev,
                    preferences: { ...prev.preferences, stickyRightCount },
                  }))
                }
              />
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex shrink-0 items-center justify-between border-t px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onReset} disabled={resetDisabled} data-testid="column-views-reset">
            Reset
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel} data-testid="column-views-cancel">
              Cancel
            </Button>
            <Button size="sm" onClick={onApply} disabled={applyDisabled} data-testid="column-views-apply">
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ColumnViewsDialog;
