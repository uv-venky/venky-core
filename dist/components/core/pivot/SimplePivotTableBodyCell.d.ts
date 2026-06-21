import React, { type CSSProperties } from 'react';
import type { ItemData, PivotItemDataInternal } from '../../../components/core/pivot/PivotTypes';
declare function SimplePivotTableBodyCell<ColumnKey extends string, Item>(props: {
    columnIndex: number;
    data: ItemData<PivotItemDataInternal<ColumnKey, Item>>;
    isScrolling?: boolean;
    rowIndex: number;
    style: CSSProperties;
}): import("react/jsx-runtime").JSX.Element | null;
declare const _default: React.MemoExoticComponent<typeof SimplePivotTableBodyCell>;
export default _default;
//# sourceMappingURL=SimplePivotTableBodyCell.d.ts.map