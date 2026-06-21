/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Button } from '../../../components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { ColumnViewsColumnsTab } from '../../../components/core/page/column-views-columns-tab';
import { ColumnViewsDensityTab } from '../../../components/core/page/column-views-density-tab';
import { ColumnViewsStickyTab } from '../../../components/core/page/column-views-sticky-tab';
import { useColumnViewsDraft } from '../../../components/core/page/use-column-views-draft';
import { cn } from '../../../lib/utils';
import { Settings2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { subscribe } from 'valtio';
function TabLabel({ label, dirty }) {
  return _jsxs('span', {
    className: 'inline-flex items-center gap-1.5',
    children: [
      label,
      dirty ? _jsx('span', { className: 'size-1.5 rounded-full bg-primary', 'aria-hidden': true }) : null,
    ],
  });
}
export function ColumnViewsDialog({
  table,
  preferences: preferencesProp,
  onPreferencesChange: onPreferencesChangeProp,
  variant,
  iconOnly = false,
  className,
  defaultPreferences,
}) {
  const meta = table.options.meta;
  const preferences = preferencesProp ?? meta.preferences;
  const onPreferencesChange = useMemo(
    () =>
      onPreferencesChangeProp ??
      ((prefs) => {
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
    const updateProxy = table.options.meta.updateProxy;
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
    (ids, visibilityUpdates) => {
      updateDraft((prev) => ({
        ...prev,
        displayedColumnIds: ids,
        columnVisibility: {
          ...prev.columnVisibility,
          ...visibilityUpdates,
          ...ids.reduce((acc, id) => {
            acc[id] = true;
            return acc;
          }, {}),
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
  return _jsxs(Popover, {
    open: open,
    onOpenChange: handleOpenChange,
    children: [
      _jsx(PopoverTrigger, {
        asChild: true,
        children: iconOnly
          ? _jsxs(Button, {
              variant: variant ?? 'outline',
              size: 'icon',
              'aria-expanded': open,
              className: cn('size-8 rounded-full', className),
              'data-testid': 'columns-menu-trigger',
              'aria-label': displayLabel,
              children: [
                _jsx(Settings2, { className: 'size-4' }),
                _jsx('span', { className: 'sr-only', children: displayLabel }),
              ],
            })
          : _jsx(Button, {
              variant: variant ?? 'outline',
              'aria-expanded': open,
              className: className,
              'data-testid': 'columns-menu-trigger',
              children: displayLabel,
            }),
      }),
      _jsxs(PopoverContent, {
        align: 'end',
        side: 'bottom',
        sideOffset: 8,
        collisionPadding: 16,
        className: cn(
          'flex w-[min(720px,var(--radix-popper-available-width))] max-w-[calc(var(--radix-popper-available-width)-1rem)] flex-col gap-0 overflow-hidden p-0',
          'max-h-[calc(var(--radix-popper-available-height)-1rem)]',
        ),
        'data-testid': 'column-views-popover',
        children: [
          _jsx('div', {
            className: 'border-b px-4 py-3',
            children: _jsx('h2', { className: 'font-semibold text-base leading-none', children: 'Column views' }),
          }),
          _jsxs(Tabs, {
            value: activeTab,
            onValueChange: (v) => setActiveTab(v),
            className: 'flex min-h-0 flex-1 flex-col gap-0',
            children: [
              _jsxs(TabsList, {
                className: 'h-auto w-full justify-start rounded-none border-b bg-transparent p-0 px-4',
                children: [
                  _jsx(TabsTrigger, {
                    value: 'columns',
                    className:
                      'rounded-none border-transparent border-b-2 bg-transparent px-3 pb-2.5 shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none',
                    children: _jsx(TabLabel, { label: 'Columns', dirty: columnsDirty }),
                  }),
                  _jsx(TabsTrigger, {
                    value: 'density',
                    className:
                      'rounded-none border-transparent border-b-2 bg-transparent px-3 pb-2.5 shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none',
                    children: _jsx(TabLabel, { label: 'Density', dirty: densityDirty }),
                  }),
                  _jsx(TabsTrigger, {
                    value: 'sticky',
                    className:
                      'rounded-none border-transparent border-b-2 bg-transparent px-3 pb-2.5 shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none',
                    children: _jsx(TabLabel, { label: 'Sticky columns', dirty: stickyDirty }),
                  }),
                ],
              }),
              _jsxs('div', {
                className:
                  'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 min-h-0 flex-1 overflow-y-auto px-4 py-3',
                children: [
                  _jsx(TabsContent, {
                    value: 'columns',
                    className: 'mt-0 flex min-h-[280px] flex-col focus:outline-none',
                    children: _jsx(ColumnViewsColumnsTab, {
                      columnOptions: columnOptions,
                      displayedColumnIds: draft.displayedColumnIds,
                      onDisplayedChange: handleDisplayedChange,
                      onRestore: onRestoreColumns,
                    }),
                  }),
                  _jsx(TabsContent, {
                    value: 'density',
                    className: 'mt-0 focus:outline-none',
                    children: _jsx(ColumnViewsDensityTab, {
                      value: draft.preferences.tableVariant,
                      onChange: (tableVariant) =>
                        updateDraft((prev) => ({
                          ...prev,
                          preferences: { ...prev.preferences, tableVariant },
                        })),
                      pageSize: draft.pageSize,
                      onPageSizeChange: (pageSize) => {
                        void updatePageSize(pageSize);
                      },
                      pageSizeDisabled: isPageSizeBusy,
                    }),
                  }),
                  _jsx(TabsContent, {
                    value: 'sticky',
                    className: 'mt-0 focus:outline-none',
                    children: _jsx(ColumnViewsStickyTab, {
                      stickyLeftCount: draft.preferences.stickyLeftCount,
                      stickyRightCount: draft.preferences.stickyRightCount,
                      onStickyLeftChange: (stickyLeftCount) =>
                        updateDraft((prev) => ({
                          ...prev,
                          preferences: { ...prev.preferences, stickyLeftCount },
                        })),
                      onStickyRightChange: (stickyRightCount) =>
                        updateDraft((prev) => ({
                          ...prev,
                          preferences: { ...prev.preferences, stickyRightCount },
                        })),
                    }),
                  }),
                ],
              }),
            ],
          }),
          _jsxs('div', {
            className: 'flex shrink-0 items-center justify-between border-t px-4 py-3',
            children: [
              _jsx(Button, {
                variant: 'ghost',
                size: 'sm',
                onClick: onReset,
                disabled: resetDisabled,
                'data-testid': 'column-views-reset',
                children: 'Reset',
              }),
              _jsxs('div', {
                className: 'flex gap-2',
                children: [
                  _jsx(Button, {
                    variant: 'outline',
                    size: 'sm',
                    onClick: handleCancel,
                    'data-testid': 'column-views-cancel',
                    children: 'Cancel',
                  }),
                  _jsx(Button, {
                    size: 'sm',
                    onClick: onApply,
                    disabled: applyDisabled,
                    'data-testid': 'column-views-apply',
                    children: 'Apply',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
export default ColumnViewsDialog;
//# sourceMappingURL=column-views-dialog.js.map
