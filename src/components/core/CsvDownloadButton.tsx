import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import Papa from 'papaparse';

export default function CsvDownloadButton({
  data,
  filename = 'export.csv',
}: {
  data: object[] | (() => object[] | Promise<object[]>);
  filename?: string;
}) {
  async function exportToCSV() {
    const rows = typeof data === 'function' ? await data() : data;
    if (!rows || rows.length === 0) {
      return;
    }
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }

  return (
    <Button variant="outline" size="icon" onClick={exportToCSV} data-testid="csv-download">
      <Download className="size-4" />
    </Button>
  );
}
