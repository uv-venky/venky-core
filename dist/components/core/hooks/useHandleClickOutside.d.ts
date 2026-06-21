import { type RefObject } from 'react';
export declare function handleTouchOrMouseEvent(event: React.MouseEvent<HTMLElement | SVGElement> | React.TouchEvent<HTMLElement | SVGElement>): {
    clientX: number;
    clientY: number;
    touch: boolean;
    target: EventTarget;
    event: Touch | MouseEvent;
} | undefined;
export default function useHandleClickOutside<T extends HTMLElement>({ ref, onInteractOutside, shouldExcludeElement, open, }: {
    ref: RefObject<T | null>;
    onInteractOutside: (e: MouseEvent | TouchEvent, reason?: 'OutSideClick') => void;
    shouldExcludeElement?: (e: HTMLElement) => boolean;
    open?: boolean;
}): void;
//# sourceMappingURL=useHandleClickOutside.d.ts.map