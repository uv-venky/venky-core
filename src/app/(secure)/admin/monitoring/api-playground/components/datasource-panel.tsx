'use client';

import { Badge } from '@/components/ui/badge';
import { ComboboxField } from '@/components/core/combobox';
import { Database, PencilOff, KeyIcon, User2, DownloadIcon, Layers } from 'lucide-react';
import type { DataSource } from '../types';
import { isMissingPrimaryKey, getWhoAttributesCount } from './datasource-tab';
import { Button } from '@/components/ui/button';
import { showInfo } from '@/components/core/common/Notification';

interface DataSourceTabProps {
  selectedDataSource: string;
  setSelectedDataSource: (value: string) => void;
  dataSources: DataSource[];
}

function downloadWarnings(dataSources: DataSource[]) {
  const allWarnings: { id: string; warnings: string[] }[] = [];
  dataSources.forEach((ds) => {
    const missingPrimaryKey = isMissingPrimaryKey(ds);
    const whoAttributesCount = getWhoAttributesCount(ds);
    const warnings: string[] = [];
    if (missingPrimaryKey) {
      warnings.push('Missing primary key');
    }
    if (whoAttributesCount !== 4) {
      warnings.push(`Missing ${4 - whoAttributesCount} WHO attributes`);
    }
    if (warnings.length > 0) {
      allWarnings.push({ id: ds.id, warnings });
    }
  });
  if (allWarnings.length === 0) {
    showInfo('No warnings found');
    return;
  }
  const warningsText = allWarnings.map((warning) => `${warning.id}, ${warning.warnings.join(', ')}`).join('\n');
  const blob = new Blob([warningsText], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `warnings.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function DataSourcePanel({ selectedDataSource, setSelectedDataSource, dataSources }: DataSourceTabProps) {
  return (
    <div className="group relative shrink-0 overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Gradient accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/10 to-indigo-500/10">
            <Database className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Data Source</h3>
            <p className="text-muted-foreground text-xs">Select a source to explore</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"
          >
            <Layers className="mr-1 h-3 w-3" />
            {dataSources.length}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            data-tip="Download Warnings"
            onClick={() => downloadWarnings(dataSources)}
            className="h-8 w-8 text-amber-500 hover:bg-amber-500/10 hover:text-amber-600"
          >
            <DownloadIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <ComboboxField<DataSource>
          value={selectedDataSource}
          options={dataSources}
          getValue={(ds) => ds.id}
          getLabel={(ds) => ds.id}
          onSelect={(value) => {
            if (value) setSelectedDataSource(value);
          }}
          placeholder="Search data sources..."
          searchPlaceholder="Type to search..."
          emptyText="No data sources found"
          className="w-full border-violet-200/50 transition-colors focus-within:border-violet-400 dark:border-violet-500/20"
          getIcon={(ds) => (
            <div className="flex items-center gap-1.5">
              {ds.readOnly && (
                <span data-tip="Read Only" className="text-muted-foreground">
                  <PencilOff className="h-3.5 w-3.5" />
                </span>
              )}
              {isMissingPrimaryKey(ds) && (
                <span data-tip="Missing primary key" className="text-amber-500">
                  <KeyIcon className="h-3.5 w-3.5" />
                </span>
              )}
              {getWhoAttributesCount(ds) !== 4 && (
                <span
                  data-tip={`Missing ${4 - getWhoAttributesCount(ds)} WHO attributes`}
                  className="flex items-center gap-0.5 text-amber-500 text-xs"
                >
                  <User2 className="h-3.5 w-3.5" />
                  <span className="font-medium">{4 - getWhoAttributesCount(ds)}</span>
                </span>
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
}
