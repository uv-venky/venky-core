/* Copyright (c) 2024-present VENKY Corp. */

import { type RefObject, useEffect } from 'react';
import { useLatest } from '@/components/core/hooks/useLatest';

function useEventListener<K extends keyof WindowEventMap>(
  element: Window,
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: AddEventListenerOptions,
): void;

function useEventListener<K extends keyof DocumentEventMap>(
  element: Document,
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  options?: AddEventListenerOptions,
): void;

function useEventListener<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: AddEventListenerOptions,
): void;

function useEventListener<K extends keyof HTMLElementEventMap>(
  element: RefObject<HTMLElement | null>,
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: AddEventListenerOptions,
): void;

function useEventListener<K extends string>(
  element: Document | Window | HTMLElement | RefObject<HTMLElement | null>,
  eventName: K,
  handler: (event: unknown) => void,
  options?: AddEventListenerOptions,
): void {
  const savedHandler = useLatest(handler);

  useEffect(
    () => {
      let el: Window | Document | HTMLElement | HTMLElement | null = null;
      if (typeof element === 'object' && 'current' in element) {
        el = element.current;
      } else {
        el = element;
      }
      if (!el) return;
      // Make sure element supports addEventListener
      const isSupported = el.addEventListener;
      if (!isSupported) return;

      // Create event listener that calls handler function stored in ref
      const eventListener = (event: unknown) => savedHandler.current(event);

      // Add event listener
      el.addEventListener(eventName, eventListener, options);

      // Remove event listener on cleanup
      return () => {
        el.removeEventListener(eventName, eventListener, options);
      };
    },
    [eventName, element, options, savedHandler], // Re-run if eventName or element changes
  );
}

export default useEventListener;
