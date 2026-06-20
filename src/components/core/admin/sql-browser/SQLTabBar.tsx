'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { History, PlusIcon, Code, X } from 'lucide-react';
import QueryHistory from '@/components/core/admin/sql-browser/QueryHistory';
import { useSQLBrowser } from '@/components/core/admin/sql-browser/SQLBrowserContext';
import { cn } from '@/lib/utils';

interface SQLTabBarProps {
  onFormatSQL: () => void;
}

export default function SQLTabBar({ onFormatSQL }: SQLTabBarProps) {
  const { state, dispatch } = useSQLBrowser();
  const { activeTabId, tabs, showHistory, historyKey } = state;

  return (
    <div className="flex h-11 select-none items-center gap-2 border-b bg-muted/30 px-2">
      {/* Tabs */}
      <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 flex flex-1 gap-1 overflow-x-auto py-1">
        {tabs.map((tab) => (
          <div
            role="button"
            key={tab.id}
            className={cn(
              'flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 transition-all duration-200',
              activeTabId === tab.id
                ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground',
            )}
            onClick={() => dispatch.setActiveTab(tab.id)}
            data-testid={`sql-tab-${tab.id}`}
          >
            <span className="max-w-[150px] truncate text-nowrap text-sm">{tab.name}</span>
            {tabs.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch.closeTab(tab.id);
                }}
                className="flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                data-testid={`sql-tab-close-${tab.id}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch.addTab()}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          data-testid="sql-add-tab"
        >
          <PlusIcon className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-5 w-px bg-border" />

        <Button
          variant="outline"
          size="sm"
          onClick={onFormatSQL}
          className="h-8 gap-1.5 border-border/60 bg-background/50 px-3 text-muted-foreground hover:border-border hover:bg-background hover:text-foreground"
          data-testid="sql-format"
        >
          <Code className="h-3.5 w-3.5" />
          Format
        </Button>

        <Sheet open={showHistory} onOpenChange={dispatch.setShowHistory}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-border/60 bg-background/50 px-3 text-muted-foreground hover:border-border hover:bg-background hover:text-foreground"
              data-testid="sql-history"
            >
              <History className="h-3.5 w-3.5" />
              History
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Query History</SheetTitle>
            </SheetHeader>
            <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex-1 overflow-auto">
              <QueryHistory
                key={historyKey}
                onSelectQuery={(sql) => {
                  dispatch.updateTab(activeTabId, { sql });
                  dispatch.setShowHistory(false);
                }}
                onHistoryUpdated={() => dispatch.incrementHistoryKey()}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
