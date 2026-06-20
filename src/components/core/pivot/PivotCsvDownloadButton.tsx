/* Copyright (c) 2024-present VENKY Corp. */

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { usePivotColumnCollapseTree } from '@/components/core/pivot/PivotColumnCollapseTreeContext';
import { usePivotColumnsContext, usePivotDataContext } from '@/components/core/pivot/PivotContext';
import { buildPivotCsv, downloadCsv } from '@/components/core/pivot/PivotCsvExport';
import { usePivotRowCollapseTree } from '@/components/core/pivot/PivotRowCollapseTreeContext';

interface Props {
  /** Filename for the downloaded CSV. Defaults to "pivot-data.csv". */
  filename?: string;
}

export default function PivotCsvDownloadButton({ filename = 'pivot-data.csv' }: Props = {}) {
  const pivot = usePivotDataContext<string, unknown>();
  const columns = usePivotColumnsContext<string>();
  const rowTree = usePivotRowCollapseTree();
  const columnTree = usePivotColumnCollapseTree();

  function exportToCSV() {
    if (pivot == null) {
      return;
    }
    const csv = buildPivotCsv({ pivot, columns, rowTree, columnTree });
    downloadCsv(csv, filename);
  }

  return (
    <Button variant="outline" size="icon" onClick={exportToCSV} data-testid="csv-download">
      <Download />
    </Button>
  );
}
