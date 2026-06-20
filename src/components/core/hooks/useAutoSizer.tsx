import { cn } from '@/lib/utils';
import React, { type RefObject, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

declare global {
  interface Window {
    ResizeObserver: typeof ResizeObserver;
  }
}

function getSize(el: HTMLElement | null) {
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

export default function useAutoSizer(): {
  width: number;
  height: number;
  scrollWidth: number;
  scrollHeight: number;
  ref: RefObject<HTMLDivElement | null>;
  Container: React.ComponentType<{
    children: React.ReactNode;
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  }>;
} {
  const [width, setWidth] = useState(process.env.NODE_ENV === 'test' ? 1200 : 0);
  const [height, setHeight] = useState(process.env.NODE_ENV === 'test' ? 800 : 0);
  const [scrollWidth, setScrollWidth] = useState(process.env.NODE_ENV === 'test' ? 1200 : 0);
  const [scrollHeight, setScrollHeight] = useState(process.env.NODE_ENV === 'test' ? 800 : 0);
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const elRef = useRef<HTMLDivElement>(null);
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
    const Component = ({
      children,
      className,
      ...props
    }: {
      children: React.ReactNode;
      className?: string;
      onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
    }) => {
      return (
        <div
          {...props}
          ref={(el) => {
            elRef.current = el;
            setEl(el);
          }}
          className={cn('h-full w-full', className)}
        >
          {children}
        </div>
      );
    };
    Component.displayName = 'Container';
    return Component;
  }, []);

  return { width, height, scrollHeight, scrollWidth, ref: elRef, Container };
}
