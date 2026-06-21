/* Copyright (c) 2024-present VENKY Corp. */
import Papa from 'papaparse';
import { COL_VALUE_SPAN, SPANS } from '../../../components/core/pivot/PivotTypes';
/**
 * Maps a single pivot data/footer cell to one or more CSV cells.
 *
 * - String cells (e.g. row dimension labels or span markers) → 1 CSV cell.
 * - Single-element arrays (`[val]`) → 1 CSV cell with the value. These are
 *   already pre-split by the pivot engine (one value per column) and must NOT
 *   be padded out to `valueLabels.length` or they would double the column
 *   count and misalign with the header.
 * - Multi-element arrays (`[v1, v2, ...]`) → N CSV cells. These are the
 *   intentionally bundled cells (e.g. the combined "Total" column or
 *   no-column-dimension layouts). When present, the header has a matching
 *   `COL_VALUE_SPAN` placeholder that expands to N header cells.
 */
function expandCell(val) {
    if (Array.isArray(val)) {
        return val.map((v) => (v == null ? '' : String(v)));
    }
    return [val == null ? '' : String(val)];
}
/**
 * Builds the CSV string for the visible pivot layout (header + body + footer),
 * honouring row/column collapse state, `showRowTotals`, `showColumnTotals`,
 * `showGrandTotal`, and both `valuesPosition` ('rows' | 'columns') modes.
 */
export function buildPivotCsv({ pivot, columns, rowTree, columnTree, }) {
    const totalRows = rowTree.totalVisible();
    const totalColumns = columnTree.totalVisible();
    const header = pivot.getHeader();
    const body = pivot.getTableData();
    const footer = pivot.getFooter();
    const valueLabels = pivot.config.values.map((col) => columns.find((c) => c.key === col)?.label ?? col);
    const visibleHeader = [];
    for (let i = 0; i < header.length; ++i) {
        const row = [];
        const origRow = header[i];
        for (let j = 0; j < totalColumns; ++j) {
            const idx = columnTree.actualIndex(j);
            let label = origRow[idx];
            if (label === COL_VALUE_SPAN) {
                // Bundled value placeholder: expand to one cell per value label so
                // the header matches the bundled body cell width.
                row.push(...valueLabels);
                continue;
            }
            if (i === 0 && idx < pivot.config.rows.length) {
                const colKey = pivot.config.rows[idx];
                label = columns.find((c) => c.key === colKey)?.label ?? colKey;
            }
            row.push(label);
        }
        visibleHeader.push(row);
    }
    const expandRowCells = (origRow) => {
        const out = [];
        for (let j = 0; j < totalColumns; ++j) {
            const idx = columnTree.actualIndex(j);
            const val = origRow[idx];
            if (Array.isArray(val)) {
                out.push(...expandCell(val));
                continue;
            }
            out.push(val == null ? '' : String(val));
        }
        return out;
    };
    const visibleBody = [];
    for (let i = 0; i < totalRows; ++i) {
        const origRow = body[rowTree.actualIndex(i)];
        if (origRow == null)
            continue;
        visibleBody.push(expandRowCells(origRow));
    }
    const visibleFooter = [];
    for (const footerRow of footer) {
        visibleFooter.push(expandRowCells(footerRow));
    }
    const allRows = [...visibleHeader, ...visibleBody, ...visibleFooter].map((row) => row.map((value) => (SPANS.includes(value) ? '' : value)));
    return Papa.unparse(allRows);
}
export function downloadCsv(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
//# sourceMappingURL=PivotCsvExport.js.map