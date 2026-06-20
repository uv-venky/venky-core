/* Copyright (c) 2024-present VENKY Corp. */

import { type RefObject, useEffect } from 'react';
import { useLatest } from '@/components/core/hooks/useLatest';

const isTouchEvent = (nativeEvent: TouchEvent | MouseEvent): nativeEvent is TouchEvent =>
  nativeEvent.type?.indexOf('touch') === 0;

export function handleTouchOrMouseEvent(
  event: React.MouseEvent<HTMLElement | SVGElement> | React.TouchEvent<HTMLElement | SVGElement>,
):
  | {
      clientX: number;
      clientY: number;
      touch: boolean;
      target: EventTarget;
      event: Touch | MouseEvent;
    }
  | undefined {
  const nativeEvent = event.nativeEvent || event;
  let touch = false;
  let target: EventTarget;
  let e: Touch | MouseEvent;

  if (isTouchEvent(nativeEvent)) {
    if (!nativeEvent.changedTouches.length) {
      return;
    }
    e = nativeEvent.changedTouches[0];
    target = e.target;
    touch = true;
  } else {
    e = nativeEvent;
    target = event.target;
    if (e.button > 0) {
      return;
    }
  }
  const { clientX, clientY } = e;
  return { clientX, clientY, touch, target, event: e };
}

export default function useHandleClickOutside<T extends HTMLElement>({
  ref,
  onInteractOutside,
  shouldExcludeElement,
  open = true,
}: {
  ref: RefObject<T | null>;
  onInteractOutside: (e: MouseEvent | TouchEvent, reason?: 'OutSideClick') => void;
  shouldExcludeElement?: (e: HTMLElement) => boolean;
  open?: boolean;
}) {
  const onInteractOutsideRef = useLatest(onInteractOutside);
  const shouldExcludeElementRef = useLatest(shouldExcludeElement);
  useEffect(() => {
    if (open) {
      const handleClickOutside = (e: MouseEvent | TouchEvent) => {
        const result = handleTouchOrMouseEvent(e as unknown as React.MouseEvent<T> | React.TouchEvent<T>);
        if (!result) {
          return;
        }
        const { target } = result;
        if (target) {
          if (ref.current?.contains(target as Node)) {
            return;
          }
          if (shouldExcludeElementRef.current?.(target as HTMLElement)) {
            return;
          }
          let parent: HTMLElement | null = (target as HTMLElement).parentElement;
          while (parent) {
            if ('radixPopperContentWrapper' in parent.dataset) {
              return;
            }
            if (shouldExcludeElementRef.current?.(parent as HTMLElement)) {
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
