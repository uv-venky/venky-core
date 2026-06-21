import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../../../lib/utils';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
function getSize(el) {
    if (!el) {
        return {
            width: 0,
            height: 0,
            scrollWidth: 0,
            scrollHeight: 0,
        };
    }
    return {
        width: el.offsetWidth,
        height: el.offsetHeight,
        scrollWidth: el.scrollWidth,
        scrollHeight: el.scrollHeight,
    };
}
export default function useAutoSizer() {
    const [width, setWidth] = useState(process.env.NODE_ENV === 'test' ? 1200 : 0);
    const [height, setHeight] = useState(process.env.NODE_ENV === 'test' ? 800 : 0);
    const [scrollWidth, setScrollWidth] = useState(process.env.NODE_ENV === 'test' ? 1200 : 0);
    const [scrollHeight, setScrollHeight] = useState(process.env.NODE_ENV === 'test' ? 800 : 0);
    const [el, setEl] = useState(null);
    const elRef = useRef(null);
    const handleResize = useCallback(() => {
        const el = elRef.current;
        if (!el || process.env.NODE_ENV === 'test') {
            return;
        }
        const { width: _w, height: _h, scrollHeight: _sh, scrollWidth: _sw } = getSize(el);
        setWidth(_w);
        setHeight(_h);
        setScrollWidth(_sw);
        setScrollHeight(_sh);
    }, []);
    useEffect(() => {
        handleResize();
    }, [handleResize]);
    useLayoutEffect(() => {
        if (!el) {
            return;
        }
        handleResize();
        if (typeof window.ResizeObserver === 'function') {
            const resizeObserver = new window.ResizeObserver(() => {
                handleResize();
            });
            resizeObserver.observe(el);
            return () => {
                resizeObserver.disconnect();
            };
        }
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [handleResize, el]);
    const Container = useMemo(() => {
        const Component = ({ children, className, ...props }) => {
            return (_jsx("div", { ...props, ref: (el) => {
                    elRef.current = el;
                    setEl(el);
                }, className: cn('h-full w-full', className), children: children }));
        };
        Component.displayName = 'Container';
        return Component;
    }, []);
    return { width, height, scrollHeight, scrollWidth, ref: elRef, Container };
}
//# sourceMappingURL=useAutoSizer.js.map