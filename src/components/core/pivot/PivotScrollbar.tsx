/* Copyright (c) 2024-present VENKY Corp. */

import type * as React from 'react';
import { useRef, type UIEvent } from 'react';
import { getScrollbarSize } from '@/components/core/pivot/PivotUtils';

let size = 0;

export function scrollbarSize(): number {
  if (size === 0) {
    // getScrollbarSize() returns 0 on macos when the scrollbar is not visible
    size = Math.max(getScrollbarSize(), 15);
  }
  return size;
}

export function PivotVerticalScrollbar({
  height,
  onScroll,
  scrollHeight,
  scrollRef,
}: {
  height: number;
  onScroll: (x: number) => void;
  scrollHeight: number;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const ref = useRef<number | null>(null);
  return (
    <div
      ref={scrollRef}
      onScroll={(e: UIEvent<HTMLDivElement>) => {
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
      }}
      className="scrollbar-thin absolute top-0 right-0 min-w-[1px] overflow-y-auto overflow-x-hidden"
      style={{
        height: `${height}px`,
        width: `${scrollbarSize()}px`,
      }}
    >
      <div
        style={{
          height: `${scrollHeight}px`,
          width: '1px',
        }}
      />
    </div>
  );
}

export function PivotHorizontalScrollbar({
  onScroll,
  scrollRef,
  scrollWidth,
  width,
}: {
  onScroll: (x: number) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  scrollWidth: number;
  width: number;
}) {
  const ref = useRef<number | null>(null);
  return (
    <div
      ref={scrollRef}
      className="scrollbar-thin absolute bottom-0 left-0 min-h-[1px] overflow-x-auto overflow-y-hidden"
      onScroll={(e: UIEvent<HTMLDivElement>) => {
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
      }}
      style={{
        width: `${width}px`,
        height: `${scrollbarSize()}px`,
      }}
    >
      <div
        style={{
          width: `${scrollWidth}px`,
          height: '1px',
        }}
      />
    </div>
  );
}
