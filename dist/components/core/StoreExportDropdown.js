/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { exportStoreToCsv } from '../../components/core/download/exportStoreToCsv';
import { exportStoreToExcel } from '../../components/core/download/exportStoreToExcel';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useState } from 'react';
export default function StoreExportDropdown({
  store,
  table,
  filename = 'export',
  excludeColumns = [],
  includeMetadata = false,
  className,
}) {
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
  return _jsxs(DropdownMenu, {
    children: [
      _jsx(DropdownMenuTrigger, {
        asChild: true,
        children: _jsx(Button, {
          variant: 'ghost',
          size: 'icon',
          disabled: isExporting,
          'data-testid': 'export-dropdown',
          'data-tip': 'Export',
          className: className,
          children: _jsx(Download, { className: 'size-4' }),
        }),
      }),
      _jsxs(DropdownMenuContent, {
        align: 'end',
        children: [
          _jsxs(DropdownMenuItem, {
            onSelect: handleExportCsv,
            disabled: isExporting,
            children: [_jsx(FileText, { className: 'size-4' }), 'Download as CSV'],
          }),
          _jsxs(DropdownMenuItem, {
            onSelect: handleExportExcel,
            disabled: isExporting,
            children: [_jsx(FileSpreadsheet, { className: 'size-4' }), 'Download as Excel'],
          }),
        ],
      }),
    ],
  });
}
//# sourceMappingURL=StoreExportDropdown.js.map
