/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportStoreToCsv } from '@/components/core/download/exportStoreToCsv';
import { exportStoreToExcel } from '@/components/core/download/exportStoreToExcel';
import type { Store } from '@/lib/core/common/types/Store';
import type { Table } from '@tanstack/react-table';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useState } from 'react';

interface StoreExportDropdownProps<T extends object> {
  store: Store<T>;
  table: Table<T>;
  filename?: string;
  excludeColumns?: string[];
  includeMetadata?: boolean;
  className?: string;
}

export default function StoreExportDropdown<T extends object>({
  store,
  table,
  filename = 'export',
  excludeColumns = [],
  includeMetadata = false,
  className,
}: StoreExportDropdownProps<T>) {
  const [isExporting, setIsExporting] = useState(false);

  const filteredTable = {
    ...table,
    getVisibleLeafColumns: () => {
      const columns = table.getVisibleLeafColumns();
      return excludeColumns.length > 0 ? columns.filter((col) => !excludeColumns.includes(col.id)) : columns;
    },
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await exportStoreToCsv({
        store,
        table: filteredTable,
        filename: `${filename}.csv`,
        includeMetadata,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await exportStoreToExcel({
        store,
        table: filteredTable,
        filename,
        includeMetadata,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={isExporting}
          data-testid="export-dropdown"
          data-tip="Export"
          className={className}
        >
          <Download className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={handleExportCsv} disabled={isExporting}>
          <FileText className="size-4" />
          Download as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleExportExcel} disabled={isExporting}>
          <FileSpreadsheet className="size-4" />
          Download as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
