import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { Store } from '@/lib/core/common/types/Store';
import type { Table } from '@tanstack/react-table';
import { exportStoreToCsv } from '@/components/core/download/exportStoreToCsv';

interface StoreCsvDownloadButtonProps<T extends object> {
  store: Store<T>;
  table: Table<T>;
  filename?: string;
  excludeColumns?: string[];
}

export default function StoreCsvDownloadButton<T extends object>({
  store,
  table,
  filename = 'export.csv',
  excludeColumns = [],
}: StoreCsvDownloadButtonProps<T>) {
  const handleExport = async () => {
    const filteredTable = {
      ...table,
      getVisibleLeafColumns: () => {
        const columns = table.getVisibleLeafColumns();
        return excludeColumns.length > 0 ? columns.filter((col) => !excludeColumns.includes(col.id)) : columns;
      },
    };

    await exportStoreToCsv({ store, table: filteredTable, filename });
  };

  return (
    <Button variant="outline" size="icon" onClick={handleExport} data-testid="csv-download">
      <Download className="size-4" />
    </Button>
  );
}
