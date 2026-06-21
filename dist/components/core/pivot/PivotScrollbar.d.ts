import type * as React from 'react';
export declare function scrollbarSize(): number;
export declare function PivotVerticalScrollbar({ height, onScroll, scrollHeight, scrollRef, }: {
    height: number;
    onScroll: (x: number) => void;
    scrollHeight: number;
    scrollRef: React.RefObject<HTMLDivElement | null>;
}): import("react/jsx-runtime").JSX.Element;
export declare function PivotHorizontalScrollbar({ onScroll, scrollRef, scrollWidth, width, }: {
    onScroll: (x: number) => void;
    scrollRef: React.RefObject<HTMLDivElement | null>;
    scrollWidth: number;
    width: number;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=PivotScrollbar.d.ts.map