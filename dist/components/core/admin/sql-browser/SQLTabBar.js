'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '../../../../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../../../components/ui/sheet';
import { History, PlusIcon, Code, X } from 'lucide-react';
import QueryHistory from '../../../../components/core/admin/sql-browser/QueryHistory';
import { useSQLBrowser } from '../../../../components/core/admin/sql-browser/SQLBrowserContext';
import { cn } from '../../../../lib/utils';
export default function SQLTabBar({ onFormatSQL }) {
    const { state, dispatch } = useSQLBrowser();
    const { activeTabId, tabs, showHistory, historyKey } = state;
    return (_jsxs("div", { className: "flex h-11 select-none items-center gap-2 border-b bg-muted/30 px-2", children: [_jsx("div", { className: "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 flex flex-1 gap-1 overflow-x-auto py-1", children: tabs.map((tab) => (_jsxs("div", { role: "button", className: cn('flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 transition-all duration-200', activeTabId === tab.id
                        ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                        : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'), onClick: () => dispatch.setActiveTab(tab.id), "data-testid": `sql-tab-${tab.id}`, children: [_jsx("span", { className: "max-w-[150px] truncate text-nowrap text-sm", children: tab.name }), tabs.length > 1 && (_jsx("button", { type: "button", onClick: (e) => {
                                e.stopPropagation();
                                dispatch.closeTab(tab.id);
                            }, className: "flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground", "data-testid": `sql-tab-close-${tab.id}`, children: _jsx(X, { className: "h-3 w-3" }) }))] }, tab.id))) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => dispatch.addTab(), className: "h-8 w-8 p-0 text-muted-foreground hover:text-foreground", "data-testid": "sql-add-tab", children: _jsx(PlusIcon, { className: "h-4 w-4" }) }), _jsx("div", { className: "mx-1 h-5 w-px bg-border" }), _jsxs(Button, { variant: "outline", size: "sm", onClick: onFormatSQL, className: "h-8 gap-1.5 border-border/60 bg-background/50 px-3 text-muted-foreground hover:border-border hover:bg-background hover:text-foreground", "data-testid": "sql-format", children: [_jsx(Code, { className: "h-3.5 w-3.5" }), "Format"] }), _jsxs(Sheet, { open: showHistory, onOpenChange: dispatch.setShowHistory, children: [_jsx(SheetTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", className: "h-8 gap-1.5 border-border/60 bg-background/50 px-3 text-muted-foreground hover:border-border hover:bg-background hover:text-foreground", "data-testid": "sql-history", children: [_jsx(History, { className: "h-3.5 w-3.5" }), "History"] }) }), _jsxs(SheetContent, { side: "right", className: "w-[400px] sm:w-[540px]", children: [_jsx(SheetHeader, { children: _jsx(SheetTitle, { children: "Query History" }) }), _jsx("div", { className: "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex-1 overflow-auto", children: _jsx(QueryHistory, { onSelectQuery: (sql) => {
                                                dispatch.updateTab(activeTabId, { sql });
                                                dispatch.setShowHistory(false);
                                            }, onHistoryUpdated: () => dispatch.incrementHistoryKey() }, historyKey) })] })] })] })] }));
}
//# sourceMappingURL=SQLTabBar.js.map