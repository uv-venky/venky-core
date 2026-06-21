import React, { type CSSProperties } from 'react';
import type { ItemData, PivotItemDataInternal } from '../../../components/core/pivot/PivotTypes';
declare function SimplePivotTableFooterCell<ColumnKey extends string, Item>({ columnIndex, data, isScrolling, rowIndex, style, }: {
    columnIndex: number;
    data: ItemData<PivotItemDataInternal<ColumnKey, Item>>;
    isScrolling?: boolean;
    rowIndex: number;
    style: CSSProperties;
}): import("react/jsx-runtime").JSX.Element | null;
declare const _default: React.MemoExoticComponent<typeof SimplePivotTableFooterCell>;
export default _default;
//# sourceMappingURL=SimplePivotTableFooterCell.d.ts.map