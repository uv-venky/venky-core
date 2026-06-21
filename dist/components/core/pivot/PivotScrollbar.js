import { jsx as _jsx } from "react/jsx-runtime";
import { useRef } from 'react';
import { getScrollbarSize } from '../../../components/core/pivot/PivotUtils';
let size = 0;
export function scrollbarSize() {
    if (size === 0) {
        // getScrollbarSize() returns 0 on macos when the scrollbar is not visible
        size = Math.max(getScrollbarSize(), 15);
    }
    return size;
}
export function PivotVerticalScrollbar({ height, onScroll, scrollHeight, scrollRef, }) {
    const ref = useRef(null);
    return (_jsx("div", { ref: scrollRef, onScroll: (e) => {
            const el = e.target;
            if (el instanceof HTMLElement) {
                if (ref.current != null) {
                    cancelAnimationFrame(ref.current);
                }
                ref.current = requestAnimationFrame(() => {
                    onScroll(el.scrollTop);
                    ref.current = null;
                });
            }
        }, className: "scrollbar-thin absolute top-0 right-0 min-w-[1px] overflow-y-auto overflow-x-hidden", style: {
            height: `${height}px`,
            width: `${scrollbarSize()}px`,
        }, children: _jsx("div", { style: {
                height: `${scrollHeight}px`,
                width: '1px',
            } }) }));
}
export function PivotHorizontalScrollbar({ onScroll, scrollRef, scrollWidth, width, }) {
    const ref = useRef(null);
    return (_jsx("div", { ref: scrollRef, className: "scrollbar-thin absolute bottom-0 left-0 min-h-[1px] overflow-x-auto overflow-y-hidden", onScroll: (e) => {
            const el = e.target;
            if (el instanceof HTMLElement) {
                if (ref.current != null) {
                    cancelAnimationFrame(ref.current);
                }
                ref.current = requestAnimationFrame(() => {
                    onScroll(el.scrollLeft);
                    ref.current = null;
                });
            }
        }, style: {
            width: `${width}px`,
            height: `${scrollbarSize()}px`,
        }, children: _jsx("div", { style: {
                width: `${scrollWidth}px`,
                height: '1px',
            } }) }));
}
//# sourceMappingURL=PivotScrollbar.js.map