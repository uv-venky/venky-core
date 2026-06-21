/* Copyright (c) 2024-present VENKY Corp. */
import { useEffect } from 'react';
import { useLatest } from '../../../components/core/hooks/useLatest';
const isTouchEvent = (nativeEvent) => nativeEvent.type?.indexOf('touch') === 0;
export function handleTouchOrMouseEvent(event) {
    const nativeEvent = event.nativeEvent || event;
    let touch = false;
    let target;
    let e;
    if (isTouchEvent(nativeEvent)) {
        if (!nativeEvent.changedTouches.length) {
            return;
        }
        e = nativeEvent.changedTouches[0];
        target = e.target;
        touch = true;
    }
    else {
        e = nativeEvent;
        target = event.target;
        if (e.button > 0) {
            return;
        }
    }
    const { clientX, clientY } = e;
    return { clientX, clientY, touch, target, event: e };
}
export default function useHandleClickOutside({ ref, onInteractOutside, shouldExcludeElement, open = true, }) {
    const onInteractOutsideRef = useLatest(onInteractOutside);
    const shouldExcludeElementRef = useLatest(shouldExcludeElement);
    useEffect(() => {
        if (open) {
            const handleClickOutside = (e) => {
                const result = handleTouchOrMouseEvent(e);
                if (!result) {
                    return;
                }
                const { target } = result;
                if (target) {
                    if (ref.current?.contains(target)) {
                        return;
                    }
                    if (shouldExcludeElementRef.current?.(target)) {
                        return;
                    }
                    let parent = target.parentElement;
                    while (parent) {
                        if ('radixPopperContentWrapper' in parent.dataset) {
                            return;
                        }
                        if (shouldExcludeElementRef.current?.(parent)) {
                            return;
                        }
                        parent = parent.parentElement;
                    }
                }
                onInteractOutsideRef.current(e, 'OutSideClick');
            };
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('touchstart', handleClickOutside);
            };
        }
    }, [open, ref, onInteractOutsideRef, shouldExcludeElementRef]);
}
//# sourceMappingURL=useHandleClickOutside.js.map