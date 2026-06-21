'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui';
import { cn } from '../../lib/utils';
function ScrollArea({ className, children, ...props }) {
    return (_jsxs(ScrollAreaPrimitive.Root, { type: "always", "data-slot": "scroll-area", className: cn('relative', className), ...props, children: [_jsx(ScrollAreaPrimitive.Viewport, { "data-slot": "scroll-area-viewport", className: "size-full rounded-[inherit] outline-ring/50 ring-ring/10 transition-[color,box-shadow] focus-visible:outline-1 focus-visible:ring-4 dark:outline-ring/40 dark:ring-ring/20", children: children }), _jsx(ScrollBar, {}), _jsx(ScrollBar, { orientation: "horizontal" }), _jsx(ScrollAreaPrimitive.Corner, {})] }));
}
function ScrollBar({ className, orientation = 'vertical', ...props }) {
    return (_jsx(ScrollAreaPrimitive.ScrollAreaScrollbar, { "data-slot": "scroll-area-scrollbar", orientation: orientation, className: cn('flex touch-none select-none p-px transition-colors', orientation === 'vertical' && 'h-full w-3 border-l border-l-transparent', orientation === 'horizontal' && 'h-3 flex-col border-t border-t-transparent', className), ...props, children: _jsx(ScrollAreaPrimitive.ScrollAreaThumb, { "data-slot": "scroll-area-thumb", className: "relative z-20 flex-1 rounded-full bg-scrollbar-thumb" }) }));
}
export { ScrollArea, ScrollBar };
//# sourceMappingURL=scroll-area.js.map