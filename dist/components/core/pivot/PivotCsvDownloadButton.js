import { jsx as _jsx } from "react/jsx-runtime";
/* Copyright (c) 2024-present VENKY Corp. */
import { Button } from '../../../components/ui/button';
import { Download } from 'lucide-react';
import { usePivotColumnCollapseTree } from '../../../components/core/pivot/PivotColumnCollapseTreeContext';
import { usePivotColumnsContext, usePivotDataContext } from '../../../components/core/pivot/PivotContext';
import { buildPivotCsv, downloadCsv } from '../../../components/core/pivot/PivotCsvExport';
import { usePivotRowCollapseTree } from '../../../components/core/pivot/PivotRowCollapseTreeContext';
export default function PivotCsvDownloadButton({ filename = 'pivot-data.csv' } = {}) {
    const pivot = usePivotDataContext();
    const columns = usePivotColumnsContext();
    const rowTree = usePivotRowCollapseTree();
    const columnTree = usePivotColumnCollapseTree();
    function exportToCSV() {
        if (pivot == null) {
            return;
        }
        const csv = buildPivotCsv({ pivot, columns, rowTree, columnTree });
        downloadCsv(csv, filename);
    }
    return (_jsx(Button, { variant: "outline", size: "icon", onClick: exportToCSV, "data-testid": "csv-download", children: _jsx(Download, {}) }));
}
//# sourceMappingURL=PivotCsvDownloadButton.js.map