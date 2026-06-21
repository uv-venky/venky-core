import React, { type RefObject } from 'react';
declare global {
    interface Window {
        ResizeObserver: typeof ResizeObserver;
    }
}
export default function useAutoSizer(): {
    width: number;
    height: number;
    scrollWidth: number;
    scrollHeight: number;
    ref: RefObject<HTMLDivElement | null>;
    Container: React.ComponentType<{
        children: React.ReactNode;
        className?: string;
        onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
    }>;
};
//# sourceMappingURL=useAutoSizer.d.ts.map