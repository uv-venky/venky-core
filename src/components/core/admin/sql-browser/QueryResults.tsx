'use client';

import { useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import type { AccessorKeyColumnDef } from '@tanstack/react-table';
import { useStore } from '@/lib/core/client/store';
import useTable from '@/components/core/page/useTable';
import DataTable from '@/components/core/page/table';
import type { DBRow } from '@/lib/core/common/ds/types/filter';
import HeaderCell from '@/components/core/table/header-cell';
import TableCell from '@/components/core/table/table-cell';
import { startCase } from 'lodash-es';
import type { QueryResult } from '@/components/core/admin/sql-browser/types';
import type { Attribute } from '@/lib/core/common/ds/types/Attribute';
import { DefaultAttribute } from '@/lib/core/common/ds/types/Defaults';

interface QueryResultsProps {
  result: QueryResult;
  forSQLBrowser?: boolean;
}

export default function QueryResults({ result, forSQLBrowser = true }: QueryResultsProps) {
  const store = useStore({
    page: 'sql-browser',
    displayName: 'Query Results',
    datasourceId: 'query-results',
    alias: 'query-results',
    limit: 1000,
    transient: true,
    localStore: true,
    autoQuery: false,
    filterLocally: true,
    ignorePKDuplicate: true,
  });

  useEffect(() => {
    if (result.rows.length > 0) {
      const attributes = result.columns.map((column) => {
        const attribute: Attribute<Record<string, any>> = {
          ...DefaultAttribute,
          name: column.name,
          type: column.type,
          code: column.name,
        };
        return attribute;
      });
      store.setAttributes(attributes);
      store.clearSync();
      store.processServerResponse(result.rows as DBRow<object>[]);
    }
  }, [result.rows, result.columns, store]);

  const tableColumns = useMemo<AccessorKeyColumnDef<Record<string, any>>[]>(() => {
    return result.columns.map((column) => ({
      accessorKey: column.name,
      meta: {
        label: startCase(column.name),
      },
      size: 200,
      header: (props) => {
        return (
          <HeaderCell
            {...props}
            type={column.type}
            store={store}
            accessorKey={column.name}
            title={startCase(column.name)}
          />
        );
      },
      cell: (props) => <TableCell type={column.type} attributeCode={column.name} {...props} />,
    }));
  }, [result.columns, store]);

  const table = useTable({
    store,
    tableColumns,
    disableHeaderFilters: true,
  });

  const exportToCSV = () => {
    if (!result.columns.length || !result.rows.length) return;

    const csvContent = [
      result.columns.map((col) => col.name).join(','),
      ...result.rows.map((row) =>
        result.columns
          .map((col) => {
            const cellStr = String(row[col.name] ?? '');
            return cellStr.includes(',') ? `"${cellStr}"` : cellStr;
          })
          .join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_results_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (result.error) {
    return (
      <div className="border-t bg-muted/30">
        <div className="p-4">
          <div className="mb-2 flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Query Error</span>
          </div>
          <div className="rounded border bg-red-50 p-3 text-red-600 text-sm">{result.error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      {/* Results Header */}
      {forSQLBrowser && (
        <div className="flex items-center justify-between border-b bg-background px-4 py-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium text-sm">Query executed successfully</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="text-xs">{result.executionTime.toFixed(2)}ms</span>
            </div>
            <span className="text-muted-foreground text-xs">
              {result.rowCount} row{result.rowCount !== 1 ? 's' : ''}
            </span>
          </div>

          {result.rows.length > 0 && (
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>
      )}

      {/* Results Table */}
      {result.rows.length > 0 ? (
        <div className="relative flex flex-1 flex-col">
          <DataTable
            table={table}
            store={store}
            variant="default"
            emptyStateTitle="No results returned"
            emptyStateSubtitle=""
          />
        </div>
      ) : (
        <div className="p-4 text-center text-muted-foreground">
          <div className="text-sm">No results returned</div>
        </div>
      )}
    </div>
  );
}
