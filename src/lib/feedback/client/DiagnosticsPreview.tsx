'use client';
/* Copyright (c) 2024-present Venky Corp. */

import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { JsonTreeProvider, JsonTreeValue } from '@/components/core/common/json-preview';
import type { FeedbackStoreSnapshot } from '../common/types';
import type { DiagnosticError, DiagnosticLog, DiagnosticNetwork } from './diagnostics';
import { collectDiagnostics } from './diagnostics';
import { collectActiveStores } from './collectContext';

interface DiagnosticsData {
  stores: FeedbackStoreSnapshot[];
  logs: DiagnosticLog[];
  errors: (DiagnosticError | DiagnosticLog)[];
  network: DiagnosticNetwork[];
}

function takeSnapshot(): DiagnosticsData {
  const diag = collectDiagnostics();
  return {
    stores: collectActiveStores(),
    logs: diag.logs,
    errors: diag.errors,
    network: diag.network,
  };
}

function filterEntries<T>(entries: T[], query: string): T[] {
  if (!query) return entries;
  const lower = query.toLowerCase();
  return entries.filter((entry) => {
    try {
      return JSON.stringify(entry).toLowerCase().includes(lower);
    } catch {
      return false;
    }
  });
}

export function DiagnosticsPreview() {
  const [data, setData] = useState<DiagnosticsData | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setData(takeSnapshot());
  }, []);

  const filtered = useMemo(() => {
    if (!data) return null;
    return {
      stores: filterEntries(data.stores, filter),
      logs: filterEntries(data.logs, filter),
      errors: filterEntries(data.errors, filter),
      network: filterEntries(data.network, filter),
    };
  }, [data, filter]);

  if (!filtered) return null;

  const sections = [
    { key: 'stores', label: 'Stores', count: filtered.stores.length, value: filtered.stores },
    { key: 'logs', label: 'Logs', count: filtered.logs.length, value: filtered.logs },
    { key: 'errors', label: 'Errors', count: filtered.errors.length, value: filtered.errors },
    { key: 'network', label: 'Network', count: filtered.network.length, value: filtered.network },
  ] as const;

  return (
    <div className="rounded-md border bg-muted/30">
      <div className="flex items-center gap-1.5 border-b px-2 py-1.5">
        <Search className="h-3 w-3 shrink-0 text-muted-foreground" />
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search diagnostics..."
          className="h-5 border-none bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
        />
      </div>
      {sections.map(({ key, label, count, value }) => (
        <Section key={key} label={label} count={count} value={value} highlight={filter} />
      ))}
    </div>
  );
}

function Section({
  label,
  count,
  value,
  highlight,
}: {
  label: string;
  count: number;
  value: unknown;
  highlight: string;
}) {
  const [open, setOpen] = useState(false);

  // Auto-expand when filter matches entries in this section
  useEffect(() => {
    if (highlight && count > 0) setOpen(true);
  }, [highlight, count]);

  if (count === 0) {
    return (
      <div className="flex items-center gap-2 border-b px-3 py-1.5 last:border-b-0">
        <span className="text-muted-foreground text-xs">{label}</span>
        <Badge variant="secondary" className="h-4 px-1 text-[10px]">
          0
        </Badge>
      </div>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-b last:border-b-0">
      <CollapsibleTrigger className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-muted/50">
        <ChevronRight className={cn('h-3 w-3 transition-transform', open && 'rotate-90')} />
        <span className="text-xs">{label}</span>
        <Badge variant="secondary" className="h-4 px-1 text-[10px]">
          {count}
        </Badge>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="max-h-48 overflow-y-auto border-t bg-background px-3 py-2">
          <JsonTreeProvider>
            <JsonTreeValue
              value={value}
              theme="light"
              defaultExpandedDepth={1}
              maxStringPreviewLength={128}
              maxArrayItems={20}
              maxObjectKeys={20}
            />
          </JsonTreeProvider>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
