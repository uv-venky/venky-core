import clientLogger from '../../../lib/core/client/client-logger';
import { showError } from '../common';
export function getExportableColumns(store, table) {
    return table
        .getVisibleLeafColumns()
        .filter((column) => {
        const accessorKey = column.columnDef.accessorKey;
        if (typeof accessorKey !== 'string' || accessorKey.length === 0) {
            return false;
        }
        const attribute = store.getAttribute(accessorKey);
        if (!attribute) {
            // UI-only columns (e.g. "spacer") should not be exported since the server
            // export endpoint builds SQL SELECT from DataSource attributes.
            return false;
        }
        return attribute.export !== false;
    })
        .map((c) => ({
        code: String(c.columnDef.accessorKey),
        label: c.columnDef.meta?.label ?? String(c.id),
    }));
}
export async function exportStoreToCsv({ store, table, filename, includeMetadata, }) {
    const query = { ...(store.getPreviousQuery() ?? {}) };
    query.sort = store.getSort();
    query.limit = undefined;
    query.offset = undefined;
    const smartFilters = store.smartSearchFilters?.() ?? [];
    const headerFilters = store.headerFilters?.() ?? [];
    if (smartFilters.length) {
        query.filters = [...(query.filters ?? []), ...smartFilters];
    }
    if (headerFilters.length) {
        query.filters = [...(query.filters ?? []), ...headerFilters];
    }
    const columns = getExportableColumns(store, table);
    if (columns.length === 0) {
        showError('No columns to export');
        return;
    }
    const res = await fetch('/api/export-ds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            datasourceId: store.datasourceId,
            query,
            columns,
            ...(includeMetadata && { includeMetadata: true }),
        }),
    });
    if (!res.ok) {
        clientLogger.error({
            message: 'CSV export failed',
            error: await res.text(),
        });
        return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
}
//# sourceMappingURL=exportStoreToCsv.js.map