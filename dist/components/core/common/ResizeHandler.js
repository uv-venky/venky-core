import { jsx as _jsx } from "react/jsx-runtime";
import { startTransition, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import useMove from '../../../components/core/hooks/useMove';
import { cn } from '../../../lib/utils';
import { GripHorizontalIcon, GripVerticalIcon } from 'lucide-react';
export default function ResizeHandler({ side, size, min = 0, max = 10000, onMove, onResizeStart, onResizeStop, onMouseEnter, onMouseLeave, }) {
    const originRef = useRef(undefined);
    const [moving, setMoving] = useState(false);
    const moveProps = useMove('Resize', ({ status, offset }) => {
        if (status === 'start') {
            originRef.current = size;
            flushSync(() => {
                setMoving(true);
                if (onResizeStart)
                    onResizeStart();
            });
        }
        else if (status === 'end') {
            originRef.current = undefined;
            flushSync(() => {
                setMoving(false);
                if (onResizeStop)
                    onResizeStop();
            });
        }
        else if (originRef.current !== undefined) {
            startTransition(() => {
                if (originRef.current !== undefined) {
                    switch (side) {
                        case 'l':
                            onMove(Math.min(Math.max(originRef.current - offset.x, min), max));
                            break;
                        case 'r':
                            onMove(Math.min(Math.max(originRef.current + offset.x, min), max));
                            break;
                        case 't':
                            onMove(Math.min(Math.max(originRef.current - offset.y, min), max));
                            break;
                        case 'b':
                            onMove(Math.min(Math.max(originRef.current + offset.y, min), max));
                            break;
                    }
                }
            });
        }
    });
    return (_jsx("div", { role: "button", tabIndex: 0, className: cn('invisible absolute z-10 flex items-center justify-center group-hover/resizable:visible group-hover/resizable:bg-border', moving && 'visible bg-yellow-400 group-hover/resizable:bg-yellow-400', {
            'top-0 bottom-0 w-1 cursor-col-resize': side === 'l' || side === 'r',
            'left-0': side === 'l',
            'right-0': side === 'r',
            'right-0 left-0 h-1 cursor-row-resize': side === 't' || side === 'b',
            'top-0': side === 't',
            'bottom-0': side === 'b',
        }), ...moveProps, onMouseEnter: onMouseEnter, onMouseLeave: onMouseLeave, onDragStart: (e) => {
            e.stopPropagation();
            e.preventDefault();
        }, children: side === 'l' || side === 'r' ? (_jsx("div", { className: "z-10 flex h-4 w-3 items-center justify-center rounded-xs border bg-border", children: _jsx(GripVerticalIcon, { className: "size-2.5" }) })) : (_jsx("div", { className: "z-10 flex h-3 w-4 items-center justify-center rounded-xs border bg-border", children: _jsx(GripHorizontalIcon, { className: "size-2.5" }) })) }));
}
//# sourceMappingURL=ResizeHandler.js.map