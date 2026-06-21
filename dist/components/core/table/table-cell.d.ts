import type { AttributeType } from '../../../lib/core/common/ds/types/AttributeType';
import type { AccessorKeyColumnDef, CellContext, Row } from '@tanstack/react-table';
import type { StringKeyof } from '../../../lib/core/common/ds/types/filter';
import type { Store } from '../../../lib/core/common/types/Store';
import { type CSSProperties, type MouseEvent, type ReactNode } from 'react';
export type DirtyCellIndicatorProps<T extends object> = {
    attributeCode: StringKeyof<T>;
    className?: string;
    store: Store<T>;
    rowId: string;
    children: ReactNode;
    dataTip?: string;
    dataTipHtml?: boolean;
    dataTipMarkdown?: boolean;
    style?: CSSProperties;
    onClick?: (e: MouseEvent<HTMLDivElement>) => void;
    feedbackMask?: boolean;
};
export declare function DirtyCellIndicator<T extends object>(props: DirtyCellIndicatorProps<T>): import("react/jsx-runtime").JSX.Element;
export declare function Cell<T extends object>({ className, children, dataTip, dataTipHtml, dataTipMarkdown, attributeCode, store, rowId, style, onClick, feedbackMask, }: {
    className?: string;
    children?: ReactNode;
    dataTip?: string;
    dataTipHtml?: boolean;
    dataTipMarkdown?: boolean;
    attributeCode: StringKeyof<T>;
    store: Store<T>;
    rowId: string;
    style?: CSSProperties;
    onClick?: (e: MouseEvent<HTMLDivElement>) => void;
    feedbackMask?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export declare function TableRowSelectionCell({ className, row, isDisabled, }: {
    className?: string;
    row: Row<any>;
    isDisabled?: (rowId: string) => boolean;
}): import("react/jsx-runtime").JSX.Element;
export declare function rowSelectionColumnDef<T extends object>(props?: {
    isDisabled?: (rowId: string) => boolean;
    hideHeader?: boolean;
}): AccessorKeyColumnDef<T>;
declare function TableCell({ type, attributeCode, className, row, currency, fractionDigits, dateFormat, children, feedbackMask, }: {
    type: AttributeType;
    attributeCode: string;
    className?: string;
    currency?: boolean;
    fractionDigits?: number;
    dateFormat?: string;
    children?: ReactNode;
    feedbackMask?: boolean;
} & CellContext<any, unknown>): import("react/jsx-runtime").JSX.Element;
declare const _default: import("react").MemoExoticComponent<typeof TableCell>;
export default _default;
//# sourceMappingURL=table-cell.d.ts.map