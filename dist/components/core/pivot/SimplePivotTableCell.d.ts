import type { CSSProperties, MouseEvent } from 'react';
export declare const paddingStyles: {
    compact: string;
    default: string;
    roomy: string;
    spacious: string;
};
export declare const fontStyles: {
    compact: string;
    default: string;
    roomy: string;
    spacious: string;
};
export declare const alignmentStyles: {
    start: string;
    end: string;
    center: string;
};
export declare function SimplePivotTableCell({ children, columnIndex, endColumnIndex, endRowIndex, hideBodyBottomBorder, hideBorders, onClick, onMouseEnter, onMouseLeave, removeColumnLines, removeRowLines, rowIndex, startColumnIndex, style, type, value, className, dataTestId, }: {
    children: React.ReactNode;
    columnIndex: number;
    endColumnIndex: number;
    endRowIndex: number;
    hideBodyBottomBorder?: boolean;
    hideBorders: boolean;
    onClick?: (e: MouseEvent<HTMLDivElement>) => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    removeColumnLines?: boolean;
    removeRowLines?: boolean;
    rowIndex: number;
    startColumnIndex: number;
    style: CSSProperties;
    type: 'header' | 'body' | 'footer';
    value: string | Array<string>;
    className?: string;
    dataTestId?: string;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=SimplePivotTableCell.d.ts.map