import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button } from '../../../components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger, } from '../../../components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { cn } from '../../../lib/utils';
import { Settings2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import useSavedViews from '../../../components/core/hooks/useSavedViews';
import SavedViewContent from '../../../components/core/smart-search/SavedSearchContent';
import { ReorderableComboboxNoPopover } from '../../../components/core/common/reorderable-combobox';
import { mergeSavedColumnOrder, resetTableColumnLayout } from '../../../components/core/page/useTable';
import { applySavedPageSize, applySavedTablePreferences, applyTablePageSize, getDefaultPageSize, getDefaultTableColumnPreferences, getTablePreferencesCustomPayload, } from '../../../components/core/page/table-column-preferences';
import { ColumnViewsDensityTab } from '../../../components/core/page/column-views-density-tab';
import { ColumnViewsStickyTab } from '../../../components/core/page/column-views-sticky-tab';
export function Personalization({ variant, className, pageId, itemId, tabs, store, }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('views');
    const [activeView, setActiveView] = useState();
    const onSelectView = useCallback((view) => {
        tabs.forEach((tab) => {
            tab.onSelectView(view?.payload);
        });
        setActiveView(view);
    }, [tabs]);
    const { savedSearches, createSavedSearch, updateSavedSearch, deleteSavedSearch, isLoading } = useSavedViews(pageId, itemId, onSelectView, store);
    return (_jsxs(DropdownMenu, { open: isOpen, onOpenChange: setIsOpen, children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: variant ?? 'ghost', size: "icon", className: cn('h-8 w-8 rounded-full p-0 transition-colors hover:bg-muted', className), children: [_jsx(Settings2, { className: "h-4 w-4" }), _jsx("span", { className: "sr-only", children: "Personalization settings" })] }) }), _jsx(DropdownMenuContent, { align: "end", className: "flex max-h-[calc(var(--radix-popper-available-height)-1rem)] w-80 flex-col overflow-hidden rounded-lg border border-border/50 p-0 shadow-lg dark:shadow-dark", children: _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full flex-1 gap-0 overflow-hidden", children: [_jsxs(TabsList, { className: "flex w-full items-center rounded-none", children: [_jsx(TabsTrigger, { value: "views", className: "flex-1 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm", children: "Views" }), tabs.map((tab) => (_jsx(TabsTrigger, { value: tab.key, className: "flex-1 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm", children: tab.label }, tab.key)))] }), _jsxs(TabsContent, { value: "views", className: "flex flex-1 flex-col overflow-hidden pb-2 focus:outline-none", children: [_jsxs("div", { className: "shrink-0 px-3 py-1.5", children: [_jsx("h3", { className: "font-medium text-foreground/90 text-sm", children: "Personalization Views" }), _jsx("p", { className: "mt-0.5 text-muted-foreground text-xs", children: "Manage your saved configurations" })] }), _jsx(DropdownMenuSeparator, { className: "my-1 shrink-0" }), _jsx(SavedViewContent, { activeView: activeView, isLoading: isLoading, savedSearches: savedSearches, onDeleteView: async (id) => {
                                        await deleteSavedSearch(id);
                                        setIsOpen(false);
                                    }, onCreateView: async (view) => {
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
                                    }, onUpdateView: async (view) => {
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
                                    }, onSelectView: (view) => {
                                        onSelectView(view);
                                        setIsOpen(false);
                                    } })] }), tabs.map((tab) => (_jsx(TabsContent, { value: tab.key, className: "flex flex-1 flex-col overflow-hidden pb-2 focus:outline-none", children: tab.tabContent }, tab.key)))] }) })] }));
}
export function useTableColumnsPersonalizationTab(table) {
    return useMemo(() => {
        const tab = {
            key: 'columns',
            label: 'Columns',
            tabContent: (_jsxs(_Fragment, { children: [_jsxs("div", { className: "shrink-0 px-3 py-1.5", children: [_jsx("h3", { className: "font-medium text-foreground/90 text-sm", children: "Toggle Columns" }), _jsx("p", { className: "mt-0.5 text-muted-foreground text-xs", children: "Select which columns to display in the table" })] }), _jsx(DropdownMenuSeparator, { className: "my-1" }), _jsx("div", { className: "flex flex-1 flex-col overflow-hidden", children: _jsx(ReorderableComboboxNoPopover, { onChange: (keys) => {
                                table.setColumnOrder(keys);
                                const meta = table.options.meta;
                                meta.updateProxy.count++;
                            }, options: table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => ({
                                value: column.id,
                                label: column.columnDef.meta?.label ?? column.id,
                            })), onToggle: (value, isSelected) => {
                                table.getColumn(value)?.toggleVisibility(isSelected);
                            }, values: table.getState().columnOrder, emptyMessage: "No columns found", placeholder: "Columns" }) })] })),
            onSelectView: (payload) => {
                if (payload) {
                    const { custom } = payload;
                    if (custom?.columnOrder) {
                        const tableColumns = table.options.meta?.tableColumns;
                        table.setColumnOrder(tableColumns?.length ? mergeSavedColumnOrder(custom.columnOrder, tableColumns) : custom.columnOrder);
                    }
                    if (custom?.columnVisibility) {
                        table.setColumnVisibility(custom.columnVisibility);
                    }
                    if (custom?.columnSizing) {
                        table.setColumnSizing(custom.columnSizing);
                    }
                    else {
                        table.resetColumnSizing();
                    }
                    if (custom) {
                        applySavedTablePreferences(table, custom);
                        void applySavedPageSize(table, custom.pageSize);
                    }
                }
                else {
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
export function useTableDensityPersonalizationTab(table) {
    return useMemo(() => {
        const meta = table.options.meta;
        return {
            key: 'density',
            label: 'Density',
            tabContent: (_jsxs(_Fragment, { children: [_jsxs("div", { className: "shrink-0 px-3 py-1.5", children: [_jsx("h3", { className: "font-medium text-foreground/90 text-sm", children: "Density" }), _jsx("p", { className: "mt-0.5 text-muted-foreground text-xs", children: "Adjust row height and rows per page" })] }), _jsx(DropdownMenuSeparator, { className: "my-1" }), _jsx("div", { className: "px-3 pb-2", children: _jsx(ColumnViewsDensityTab, { value: meta.preferences.tableVariant, onChange: (tableVariant) => {
                                meta.setPreferences({ ...meta.preferences, tableVariant });
                                const updateProxy = table.options.meta.updateProxy;
                                updateProxy.count++;
                            }, pageSize: table.getState().pagination.pageSize, onPageSizeChange: (pageSize) => {
                                void applyTablePageSize(table, pageSize);
                            } }) })] })),
            onSelectView: (payload) => {
                if (payload?.custom) {
                    applySavedTablePreferences(table, payload.custom);
                    void applySavedPageSize(table, payload.custom.pageSize);
                }
                else {
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
export function useTableStickyPersonalizationTab(table) {
    return useMemo(() => {
        const meta = table.options.meta;
        return {
            key: 'sticky',
            label: 'Sticky',
            tabContent: (_jsxs(_Fragment, { children: [_jsxs("div", { className: "shrink-0 px-3 py-1.5", children: [_jsx("h3", { className: "font-medium text-foreground/90 text-sm", children: "Sticky columns" }), _jsx("p", { className: "mt-0.5 text-muted-foreground text-xs", children: "Freeze columns while scrolling" })] }), _jsx(DropdownMenuSeparator, { className: "my-1" }), _jsx("div", { className: "px-3 pb-2", children: _jsx(ColumnViewsStickyTab, { stickyLeftCount: meta.preferences.stickyLeftCount, stickyRightCount: meta.preferences.stickyRightCount, onStickyLeftChange: (stickyLeftCount) => {
                                meta.setPreferences({ ...meta.preferences, stickyLeftCount });
                                const updateProxy = table.options.meta.updateProxy;
                                updateProxy.count++;
                            }, onStickyRightChange: (stickyRightCount) => {
                                meta.setPreferences({ ...meta.preferences, stickyRightCount });
                                const updateProxy = table.options.meta.updateProxy;
                                updateProxy.count++;
                            } }) })] })),
            onSelectView: (payload) => {
                if (payload?.custom) {
                    applySavedTablePreferences(table, payload.custom);
                }
                else {
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
//# sourceMappingURL=personalization.js.map