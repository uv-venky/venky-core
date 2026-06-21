import type React from 'react';
type Side = 'l' | 'r' | 't' | 'b';
export default function ResizeHandler({ side, size, min, max, onMove, onResizeStart, onResizeStop, onMouseEnter, onMouseLeave, }: {
    min?: number;
    max?: number;
    size: number;
    side: Side;
    onMove: (s: number) => void;
    onResizeStart?: () => void;
    onResizeStop?: () => void;
    onMouseEnter?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onMouseLeave?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}): React.ReactElement;
export {};
//# sourceMappingURL=ResizeHandler.d.ts.map