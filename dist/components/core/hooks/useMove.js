/* Copyright (c) 2024-present Venky Corp. */
import useAnimationFrame from '../../../components/core/hooks/useAnimationFrame';
import { useCallback, useEffect, useRef } from 'react';
import { handleTouchOrMouseEvent } from '../../../components/core/hooks/useHandleClickOutside';
import { emptyFunction, isNull } from '../../../lib/core/common/isEmpty';
export const hasPropTillRoot = (target, attr) => {
  const b = !isNull(target[attr]) && target[attr] !== 'inherit';
  if (!b && target.parentElement) {
    return hasPropTillRoot(target.parentElement, attr);
  }
  return b;
};
export function clickOnEnterOrSpace(event, onClick) {
  const { target } = event;
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLButtonElement ||
    hasPropTillRoot(target, 'contentEditable')
  ) {
    return;
  }
  event.stopPropagation();
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      onClick(event);
      break;
    default:
  }
}
export default function useMove(name, fn) {
  const ref = useRef({
    addEventListeners: emptyFunction,
    fn,
    listenersAdded: false,
    moveStarted: false,
    moving: false,
    offset: { x: 0, y: 0 },
    origin: { clientX: 0, clientY: 0 },
    removeEventListeners: emptyFunction,
    shiftKey: false,
    touch: false,
  });
  // fn() is called with status start
  // react state get's updated in inside fn and is being read in moving condition
  // fn() is called with status moving before useEffect is fired
  // but this time, the fn() doesn't have access to the new state value
  // hence always use the latest fn...
  ref.current.fn = fn;
  // useEffect(() => {
  //   ref.current.fn = fn;
  // }, [fn]);
  const isRTL = false;
  const handleMouseMove = useAnimationFrame((event) => {
    const { target } = ref.current;
    if (!(ref.current.moving && target)) {
      return;
    }
    const result = handleTouchOrMouseEvent(event);
    if (!result) {
      return;
    }
    event.stopPropagation();
    const { clientX, clientY } = result;
    const offset = {
      x: clientX - ref.current.origin.clientX,
      y: clientY - ref.current.origin.clientY,
    };
    if (isRTL) {
      offset.x = -offset.x;
    }
    if (!ref.current.moveStarted && Math.max(Math.abs(offset.x), Math.abs(offset.y)) <= 3) {
      return;
    }
    if (!ref.current.moveStarted) {
      ref.current.moveStarted = true;
      ref.current.fn({
        moving: true,
        offset: ref.current.offset,
        origin: ref.current.origin,
        shiftKey: ref.current.shiftKey,
        status: 'start',
        target,
        cancel: () => {
          ref.current.moveStarted = false;
        },
      });
    }
    if (!ref.current.moveStarted) {
      // cancelled
      ref.current.removeEventListeners();
      ref.current.target = undefined;
      ref.current.moving = false;
      ref.current.offset = { x: 0, y: 0 };
      return;
    }
    ref.current.offset = offset;
    ref.current.fn({
      moving: true,
      offset,
      origin: ref.current.origin,
      shiftKey: ref.current.shiftKey,
      status: 'moving',
      target,
    });
  });
  const handleMouseUp = useCallback(() => {
    const { target } = ref.current;
    ref.current.removeEventListeners();
    if (!(ref.current.moving && ref.current.moveStarted && target)) {
      ref.current.target = undefined;
      ref.current.moving = false;
      ref.current.offset = { x: 0, y: 0 };
      return;
    }
    ref.current.fn({
      moving: false,
      offset: ref.current.offset,
      origin: ref.current.origin,
      shiftKey: ref.current.shiftKey,
      status: 'end',
      target,
    });
    ref.current.moveStarted = false;
    ref.current.target = undefined;
    ref.current.moving = false;
    ref.current.offset = { x: 0, y: 0 };
  }, []);
  ref.current.addEventListeners = useCallback(() => {
    if (ref.current.touch) {
      document.addEventListener('touchmove', handleMouseMove, true);
      document.addEventListener('touchcancel', handleMouseUp, true);
      document.addEventListener('touchend', handleMouseUp, true);
    } else {
      document.addEventListener('mousemove', handleMouseMove, true);
      document.addEventListener('mouseup', handleMouseUp, true);
    }
    ref.current.listenersAdded = true;
  }, [handleMouseMove, handleMouseUp]);
  ref.current.removeEventListeners = useCallback(() => {
    if (ref.current.listenersAdded === true) {
      ref.current.listenersAdded = false;
      if (ref.current.touch) {
        document.removeEventListener('touchmove', handleMouseMove, true);
        document.removeEventListener('touchcancel', handleMouseUp, true);
        document.removeEventListener('touchend', handleMouseUp, true);
      } else {
        document.removeEventListener('mousemove', handleMouseMove, true);
        document.removeEventListener('mouseup', handleMouseUp, true);
      }
    }
  }, [handleMouseMove, handleMouseUp]);
  const handleMouseDown = useCallback((event) => {
    const result = handleTouchOrMouseEvent(event);
    if (!result) {
      return;
    }
    const { touch, target, clientX, clientY } = result;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLButtonElement ||
      hasPropTillRoot(target, 'contentEditable')
    ) {
      // ignore when clicked on an input element
      return;
    }
    event.stopPropagation();
    // preventDefault to disable drag start on parent elements
    event.preventDefault();
    const origin = {
      clientX,
      clientY,
    };
    ref.current.addEventListeners();
    ref.current.moveStarted = false;
    ref.current.moving = true;
    ref.current.origin = origin;
    ref.current.shiftKey = event.shiftKey;
    ref.current.target = target;
    ref.current.touch = touch;
  }, []);
  useEffect(() => {
    return () => {
      if (name) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        const { removeEventListeners, listenersAdded } = ref.current;
        if (listenersAdded) {
          removeEventListeners();
        }
      }
    };
  }, [name]);
  return {
    onMouseDown: handleMouseDown,
    onTouchStart: handleMouseDown,
  };
}
//# sourceMappingURL=useMove.js.map
