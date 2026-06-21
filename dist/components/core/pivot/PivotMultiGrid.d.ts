export type OnGridScrollCallback = (props: {
    scrollLeft: number;
    scrollTop: number;
    scrollUpdateWasRequested: boolean;
}) => void;
export default function PivotMultiGrid<T>({ BodyCell, FooterCell, HeaderCell, data, fixedColumnCount, footerRows, getColumnWidth, headerRows, height, maxFooterHeight: maxFooterHeightProp, rowHeight, totalColumns, totalRows, width, }: {
    BodyCell: any;
    FooterCell: any;
    HeaderCell: any;
    data: T;
    fixedColumnCount: number;
    footerRows: number;
    getColumnWidth: (index: number) => number;
    headerRows: number;
    height: number;
    /** Maximum footer height in pixels. Defaults to 40% of total height. */
    maxFooterHeight?: number;
    rowHeight: number;
    totalColumns: number;
    totalRows: number;
    width: number;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=PivotMultiGrid.d.ts.map