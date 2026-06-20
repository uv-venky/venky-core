/* Copyright (c) 2024-present VENKY Corp. */

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download } from 'lucide-react';
import Papa from 'papaparse';
import { usePivotColumnCollapseTree } from '@/components/core/pivot/PivotColumnCollapseTreeContext';
import { usePivotColumnsContext, usePivotDataContext } from '@/components/core/pivot/PivotContext';
import { buildPivotCsv, downloadCsv } from '@/components/core/pivot/PivotCsvExport';
import { usePivotRowCollapseTree } from '@/components/core/pivot/PivotRowCollapseTreeContext';

interface Props {
  /**
   * Filename for the downloaded CSV. The pivot-layout export uses this value as-is;
   * the raw-rows export appends a `-raw` suffix before the extension.
   * Defaults to "pivot-data.csv".
   */
  filename?: string;
}

function withSuffix(filename: string, suffix: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot <= 0) {
    return `${filename}${suffix}`;
  }
  return `${filename.slice(0, lastDot)}${suffix}${filename.slice(lastDot)}`;
}

export default function PivotCsvDownloadOptionsButton({ filename = 'pivot-data.csv' }: Props = {}) {
  const pivot = usePivotDataContext<string, unknown>();
  const columns = usePivotColumnsContext<string>();
  const rowTree = usePivotRowCollapseTree();
  const columnTree = usePivotColumnCollapseTree();

  function exportPivotLayoutToCSV() {
    if (pivot == null) {
      return;
    }
    const csv = buildPivotCsv({ pivot, columns, rowTree, columnTree });
    downloadCsv(csv, filename);
  }

  function exportRawRowsToCSV() {
    if (pivot == null) {
      return;
    }

    const sourceRows = pivot.config.data as ReadonlyArray<Readonly<Record<string, unknown>>>;
    if (sourceRows.length === 0) {
      return;
    }

    const labelByKey = new Map(columns.map((column) => [column.key, column.label]));
    const discoveredKeys = new Set<string>();
    for (const row of sourceRows) {
      for (const key of Object.keys(row)) {
        discoveredKeys.add(key);
      }
    }

    const orderedKeys = [
      ...columns.map((column) => column.key).filter((key) => discoveredKeys.has(key)),
      ...Array.from(discoveredKeys).filter((key) => !labelByKey.has(key)),
    ];

    function normalizeValue(value: unknown): string | number | boolean {
      if (value == null) {
        return '';
      }
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value;
      }
      return String(value);
    }

    const maxArrayLengthByKey = new Map<string, number>();
    for (const key of orderedKeys) {
      let maxLength = 0;
      for (const row of sourceRows) {
        const value = row[key];
        if (Array.isArray(value)) {
          maxLength = Math.max(maxLength, value.length);
        }
      }
      if (maxLength > 0) {
        maxArrayLengthByKey.set(key, maxLength);
      }
    }

    const csvColumns: Array<{ key: string; header: string; arrayIndex?: number }> = [];
    for (const key of orderedKeys) {
      const label = labelByKey.get(key) ?? key;
      const maxArrayLength = maxArrayLengthByKey.get(key) ?? 0;
      if (maxArrayLength <= 1) {
        csvColumns.push({ key, header: label });
        continue;
      }
      for (let index = 0; index < maxArrayLength; index += 1) {
        csvColumns.push({ key, header: `${label} ${index + 1}`, arrayIndex: index });
      }
    }

    const rowsForCsv = sourceRows.map((row) => {
      const out: Record<string, string | number | boolean> = {};
      for (const column of csvColumns) {
        const value = row[column.key];
        if (Array.isArray(value)) {
          const arrayValue = column.arrayIndex == null ? value[0] : value[column.arrayIndex];
          out[column.header] = normalizeValue(arrayValue);
          continue;
        }
        if (column.arrayIndex != null) {
          out[column.header] = '';
          continue;
        }
        out[column.header] = normalizeValue(value);
      }
      return out;
    });

    const csv = Papa.unparse(rowsForCsv);
    downloadCsv(csv, withSuffix(filename, '-raw'));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" data-testid="csv-download-options">
          <Download />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportPivotLayoutToCSV}>Download Pivot Layout</DropdownMenuItem>
        <DropdownMenuItem onClick={exportRawRowsToCSV}>Download CSV</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
