import { jsx as _jsx } from "react/jsx-runtime";
import { Button } from '../../components/ui/button';
import { Download } from 'lucide-react';
import { exportStoreToCsv } from '../../components/core/download/exportStoreToCsv';
export default function StoreCsvDownloadButton({ store, table, filename = 'export.csv', excludeColumns = [], }) {
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
    return (_jsx(Button, { variant: "outline", size: "icon", onClick: handleExport, "data-testid": "csv-download", children: _jsx(Download, { className: "size-4" }) }));
}
//# sourceMappingURL=StoreCsvDownloadButton.js.map