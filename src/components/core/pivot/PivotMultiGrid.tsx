/* Copyright (c) 2024-present VENKY Corp. */

import { cn } from '@/lib/utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GridImperativeAPI } from 'react-window';
import { Grid } from 'react-window';
import {
  PivotHorizontalScrollbar,
  PivotVerticalScrollbar,
  scrollbarSize,
} from '@/components/core/pivot/PivotScrollbar';
import type { ItemData } from '@/components/core/pivot/PivotTypes';

const RESIZE_HANDLE_HEIGHT = 4;

const styles = {
  grid: 'overflow-hidden',
  hideScrollbar: 'scrollbar-hide',
  borderRight: 'flex flex-shrink-0 overflow-hidden border-r-2 border-r-solid border-r-neutral-400',
};

export type OnGridScrollCallback = (props: {
  scrollLeft: number;
  scrollTop: number;
  scrollUpdateWasRequested: boolean;
}) => void;

export default function PivotMultiGrid<T>({
  BodyCell,
  FooterCell,
  HeaderCell,
  data,
  fixedColumnCount,
  footerRows,
  getColumnWidth,
  headerRows,
  height,
  maxFooterHeight: maxFooterHeightProp,
  rowHeight,
  totalColumns,
  totalRows,
  width,
}: {
  BodyCell: any;
  FooterCell: any;
  HeaderCell: any;
  data: T;
  fixedColumnCount: number;
  footerRows: number;
  getColumnWidth: (index: number) => number;
  headerRows: number;
  height: number;
  /** Maximum footer height in pixels. Defaults to 40% of total height. */
  maxFooterHeight?: number;
  rowHeight: number;
  totalColumns: number;
  totalRows: number;
  width: number;
}) {
  const bodyGridRef = useRef<GridImperativeAPI>(null);
  const headerGridRef = useRef<GridImperativeAPI>(null);
  const footerGridRef = useRef<GridImperativeAPI>(null);
  const fixedBodyGridRef = useRef<GridImperativeAPI>(null);
  const fixedHeaderGridRef = useRef<GridImperativeAPI>(null);
  const fixedFooterGridRef = useRef<GridImperativeAPI>(null);
  const mainBodyRef = useRef<HTMLDivElement | null>(null);
  const mainHeaderRef = useRef<HTMLDivElement | null>(null);
  const mainFooterRef = useRef<HTMLDivElement | null>(null);
  const leftBodyRef = useRef<HTMLDivElement | null>(null);
  const leftHeaderRef = useRef<HTMLDivElement | null>(null);
  const leftFooterRef = useRef<HTMLDivElement | null>(null);
  const vScrollRef = useRef<HTMLDivElement | null>(null);
  const footerVScrollRef = useRef<HTMLDivElement | null>(null);
  const hScrollRef = useRef<HTMLDivElement | null>(null);
  const leftHScrollRef = useRef<HTMLDivElement | null>(null);
  const [userFooterHeight, setUserFooterHeight] = useState<number | null>(null);

  const headerHeight = headerRows * rowHeight;
  const naturalFooterHeight = footerRows * rowHeight;
  const defaultMaxFooterHeight = Math.floor(height * 0.4);
  const effectiveMaxFooterHeight = maxFooterHeightProp ?? defaultMaxFooterHeight;
  const showResizeHandle = footerRows > 1;
  const resizeHandleHeight = showResizeHandle ? RESIZE_HANDLE_HEIGHT : 0;

  const effectiveFooterHeight =
    userFooterHeight != null
      ? Math.max(rowHeight, Math.min(userFooterHeight, naturalFooterHeight))
      : Math.min(naturalFooterHeight, effectiveMaxFooterHeight);
  const footerOverflows = naturalFooterHeight > effectiveFooterHeight;

  const bodyHeight = Math.max(rowHeight, height - headerHeight - effectiveFooterHeight - resizeHandleHeight);
  const scrollBarSize = useMemo(() => scrollbarSize(), []);

  useEffect(() => {
    setUserFooterHeight(null);
  }, [footerRows]);

  const leftScrollableWidth = useMemo(() => {
    let width = 0;
    for (let i = 0; i < fixedColumnCount; i++) {
      width += getColumnWidth(i);
    }
    return width;
  }, [getColumnWidth, fixedColumnCount]);

  const _getScrollableColumnWidth = useCallback(
    (index: number): number => {
      // Logic to determine column width, potentially variable
      return getColumnWidth(index + fixedColumnCount);
    },
    [fixedColumnCount, getColumnWidth],
  );

  const scrollableWidth = useMemo(() => {
    let width = 0;
    const scrollableCount = totalColumns - fixedColumnCount;
    for (let i = 0; i < scrollableCount; i++) {
      width += _getScrollableColumnWidth(i);
    }
    return width;
  }, [fixedColumnCount, totalColumns, _getScrollableColumnWidth]);

  let fixedWidth = Math.min(width / 2, leftScrollableWidth);
  const showVerticalScrollbar = bodyHeight < totalRows * rowHeight;

  let extraWidth = useMemo(() => {
    let w = width - fixedWidth - scrollableWidth - (showVerticalScrollbar ? scrollBarSize : 0);
    if (w < 0) {
      w = 0;
    }
    return w;
  }, [width, fixedWidth, scrollableWidth, showVerticalScrollbar, scrollBarSize]);

  if (fixedWidth < leftScrollableWidth && extraWidth > 0) {
    // If there is extra space, we can use it to reduce the scroll on the fixed section
    const w = Math.min(leftScrollableWidth - fixedWidth, extraWidth);
    extraWidth -= w;
    fixedWidth += w;
  }

  const getScrollableColumnWidthWithExtraWidth = useCallback(
    (index: number): number => {
      let w = getColumnWidth(index + fixedColumnCount);
      if (extraWidth > 0) {
        const share = Math.floor(extraWidth / (totalColumns - fixedColumnCount));
        w += share;
      }
      return w;
    },
    [extraWidth, fixedColumnCount, getColumnWidth, totalColumns],
  );

  useEffect(() => {
    // In react-window 2.0, we don't have resetAfterColumnIndex.
    // Instead, the component should re-render if its props change.
    // If needed, we could change a 'key' to force a full reset.
  }, [getColumnWidth, getScrollableColumnWidthWithExtraWidth]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = mainBodyRef.current;
    const headerEl = mainHeaderRef.current;
    if (!el || !headerEl) {
      return;
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(() => {
        const x = e.deltaX;
        const y = e.deltaY;
        let el = hScrollRef.current;
        if (Math.abs(x) > Math.abs(y) && el) {
          el.scrollLeft += x;
        }
        el = vScrollRef.current;
        if (Math.abs(x) <= Math.abs(y) && el) {
          el.scrollTop += y;
        }
        rafRef.current = null;
      });
    };
    el.addEventListener('wheel', onWheel, { capture: true });
    headerEl.addEventListener('wheel', onWheel, { capture: true });
    return () => {
      el.removeEventListener('wheel', onWheel, { capture: true });
      headerEl.removeEventListener('wheel', onWheel, { capture: true });
    };
  }, []);

  useEffect(() => {
    const el = leftBodyRef.current;
    const headerEl = leftHeaderRef.current;
    if (!el || !headerEl) {
      return;
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(() => {
        const x = e.deltaX;
        const y = e.deltaY;
        let el = leftHScrollRef.current;
        if (Math.abs(x) > Math.abs(y) && el) {
          el.scrollLeft += x;
        }
        el = vScrollRef.current;
        if (Math.abs(x) <= Math.abs(y) && el) {
          el.scrollTop += y;
        }
        rafRef.current = null;
      });
    };
    el.addEventListener('wheel', onWheel, { capture: true });
    headerEl.addEventListener('wheel', onWheel, { capture: true });
    return () => {
      el.removeEventListener('wheel', onWheel, { capture: true });
      headerEl.removeEventListener('wheel', onWheel, { capture: true });
    };
  }, []);

  const footerOverflowsRef = useRef(footerOverflows);
  footerOverflowsRef.current = footerOverflows;

  useEffect(() => {
    const footerEl = mainFooterRef.current;
    if (!footerEl) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(() => {
        const x = e.deltaX;
        const y = e.deltaY;
        if (Math.abs(x) > Math.abs(y)) {
          const el = hScrollRef.current;
          if (el) el.scrollLeft += x;
        } else {
          const el = footerOverflowsRef.current ? footerVScrollRef.current : vScrollRef.current;
          if (el) el.scrollTop += y;
        }
        rafRef.current = null;
      });
    };
    footerEl.addEventListener('wheel', onWheel, { capture: true });
    return () => {
      footerEl.removeEventListener('wheel', onWheel, { capture: true });
    };
  }, []);

  useEffect(() => {
    const footerEl = leftFooterRef.current;
    if (!footerEl) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(() => {
        const x = e.deltaX;
        const y = e.deltaY;
        if (Math.abs(x) > Math.abs(y)) {
          const el = leftHScrollRef.current;
          if (el) el.scrollLeft += x;
        } else {
          const el = footerOverflowsRef.current ? footerVScrollRef.current : vScrollRef.current;
          if (el) el.scrollTop += y;
        }
        rafRef.current = null;
      });
    };
    footerEl.addEventListener('wheel', onWheel, { capture: true });
    return () => {
      footerEl.removeEventListener('wheel', onWheel, { capture: true });
    };
  }, []);

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startY = e.clientY;
      const startHeight = effectiveFooterHeight;

      const handleMouseMove = (ev: MouseEvent) => {
        const delta = startY - ev.clientY;
        const minH = rowHeight;
        const maxH = Math.min(naturalFooterHeight, height - headerHeight - rowHeight - resizeHandleHeight);
        setUserFooterHeight(Math.max(minH, Math.min(maxH, startHeight + delta)));
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [effectiveFooterHeight, rowHeight, naturalFooterHeight, height, headerHeight, resizeHandleHeight],
  );

  const bodyWidth = width - fixedWidth;

  const fixedHeaderData = useMemo((): ItemData<T> => {
    return {
      startColumnIndex: 0,
      endColumnIndex: fixedColumnCount - 1,
      startRowIndex: 0,
      endRowIndex: headerRows - 1,
      data,
    };
  }, [data, fixedColumnCount, headerRows]);

  const scrollableHeaderData = useMemo((): ItemData<T> => {
    return {
      startColumnIndex: fixedColumnCount,
      endColumnIndex: totalColumns - 1,
      startRowIndex: 0,
      endRowIndex: headerRows - 1,
      data,
    };
  }, [data, headerRows, fixedColumnCount, totalColumns]);

  const fixedBodyData = useMemo((): ItemData<T> => {
    return {
      startColumnIndex: 0,
      endColumnIndex: fixedColumnCount - 1,
      startRowIndex: 0,
      endRowIndex: totalRows - 1,
      data,
    };
  }, [data, totalRows, fixedColumnCount]);

  const scrollableBodyData = useMemo((): ItemData<T> => {
    return {
      startColumnIndex: fixedColumnCount,
      endColumnIndex: totalColumns - 1,
      startRowIndex: 0,
      endRowIndex: totalRows - 1,
      data,
    };
  }, [data, fixedColumnCount, totalRows, totalColumns]);

  const fixedFooterData = useMemo((): ItemData<T> => {
    return {
      startColumnIndex: 0,
      endColumnIndex: fixedColumnCount - 1,
      startRowIndex: 0,
      endRowIndex: Math.max(0, footerRows - 1),
      data,
    };
  }, [data, fixedColumnCount, footerRows]);

  const scrollableFooterData = useMemo((): ItemData<T> => {
    return {
      startColumnIndex: fixedColumnCount,
      endColumnIndex: totalColumns - 1,
      startRowIndex: 0,
      endRowIndex: Math.max(0, footerRows - 1),
      data,
    };
  }, [data, fixedColumnCount, totalColumns, footerRows]);

  const getRowHeight = useCallback(() => {
    return rowHeight;
  }, [rowHeight]);

  const showFooterVerticalScrollbar = footerOverflows;
  const showHorizontalScrollbar = bodyWidth < scrollableWidth + (showVerticalScrollbar ? scrollBarSize : 0);

  return (
    <div
      data-testid="container"
      className={cn('bg-background', `hh-${height}ww-${width}`)}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <div
        data-testid="header"
        style={{ display: 'flex', flexDirection: 'row', flexShrink: 0 }}
        className="bg-table-header text-table-header-foreground"
      >
        <div
          ref={leftHeaderRef}
          style={{
            width: `${fixedWidth}px`,
            height: `${headerHeight}px`,
          }}
          className={cn(styles.borderRight)}
        >
          {/* Fixed Header */}
          <Grid
            gridRef={fixedHeaderGridRef}
            columnCount={fixedColumnCount}
            rowCount={headerRows}
            columnWidth={getColumnWidth}
            rowHeight={getRowHeight}
            overscanCount={5}
            className={cn(styles.grid, styles.hideScrollbar)}
            style={{ width: fixedWidth, height: headerHeight }}
            cellProps={{ data: fixedHeaderData } as any}
            cellComponent={HeaderCell as any}
          />
        </div>
        <div
          ref={mainHeaderRef}
          style={{
            display: 'flex',
            flex: 1,
            width: `${bodyWidth + scrollBarSize}px`,
            height: `${headerHeight}px`,
            overflow: 'hidden',
          }}
        >
          {/* Scrollable Header */}
          <Grid
            gridRef={headerGridRef}
            columnCount={totalColumns - fixedColumnCount}
            rowCount={headerRows}
            columnWidth={getScrollableColumnWidthWithExtraWidth}
            rowHeight={getRowHeight}
            overscanCount={5}
            className={cn(styles.grid, styles.hideScrollbar)}
            style={{ width: bodyWidth - (showVerticalScrollbar ? scrollBarSize : 0), height: headerHeight }}
            cellProps={{ data: scrollableHeaderData } as any}
            cellComponent={HeaderCell as any}
          />
        </div>
      </div>

      {/* Body Grids */}
      <div data-testid="body" style={{ display: 'flex', flex: 1 }}>
        <div
          ref={leftBodyRef}
          style={{
            width: `${fixedWidth}px`,
            height: `${bodyHeight}px`,
            position: 'relative',
          }}
          className={cn(styles.borderRight)}
        >
          {/* Fixed Columns */}
          <Grid
            gridRef={fixedBodyGridRef}
            columnCount={fixedColumnCount}
            rowCount={totalRows}
            columnWidth={getColumnWidth}
            rowHeight={getRowHeight}
            overscanCount={2}
            className={cn(styles.grid, styles.hideScrollbar)}
            style={{
              width: fixedWidth,
              height: bodyHeight - (leftScrollableWidth > fixedWidth || showHorizontalScrollbar ? scrollBarSize : 0),
              overflow: 'scroll',
            }}
            cellProps={{ data: fixedBodyData } as any}
            cellComponent={BodyCell as any}
          />
          {leftScrollableWidth > fixedWidth && (
            <PivotHorizontalScrollbar
              scrollRef={leftHScrollRef}
              width={fixedWidth}
              scrollWidth={leftScrollableWidth}
              onScroll={(scrollLeft) => {
                const b = fixedBodyGridRef.current?.element;
                if (b) b.scrollLeft = scrollLeft;
                const h = fixedHeaderGridRef.current?.element;
                if (h) h.scrollLeft = scrollLeft;
                const f = fixedFooterGridRef.current?.element;
                if (f) f.scrollLeft = scrollLeft;
              }}
            />
          )}
        </div>
        <div
          ref={mainBodyRef}
          style={{
            display: 'flex',
            flex: 1,
            width: `${bodyWidth}px`,
            height: `${bodyHeight}px`,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Main Scrollable Body */}
          <Grid
            gridRef={bodyGridRef}
            columnCount={totalColumns - fixedColumnCount}
            rowCount={totalRows}
            columnWidth={getScrollableColumnWidthWithExtraWidth}
            rowHeight={getRowHeight}
            overscanCount={2}
            className={cn(styles.grid, styles.hideScrollbar)}
            style={{
              width: bodyWidth - (showVerticalScrollbar ? scrollBarSize : 0),
              height: bodyHeight - (showHorizontalScrollbar ? scrollBarSize : 0),
              overflow: 'scroll',
            }}
            cellProps={{ data: scrollableBodyData } as any}
            cellComponent={BodyCell as any}
          />
          {showVerticalScrollbar && (
            <PivotVerticalScrollbar
              scrollRef={vScrollRef}
              height={bodyHeight - (showHorizontalScrollbar ? scrollBarSize : 0)}
              scrollHeight={totalRows * rowHeight}
              onScroll={(scrollTop) => {
                const b = fixedBodyGridRef.current?.element;
                if (b) b.scrollTop = scrollTop;
                const body = bodyGridRef.current?.element;
                if (body) body.scrollTop = scrollTop;
              }}
            />
          )}
          {showHorizontalScrollbar && (
            <PivotHorizontalScrollbar
              scrollRef={hScrollRef}
              width={bodyWidth - (showVerticalScrollbar ? scrollBarSize : 0)}
              scrollWidth={scrollableWidth + (showVerticalScrollbar ? scrollBarSize : 0)}
              onScroll={(scrollLeft) => {
                const b = bodyGridRef.current?.element;
                if (b) b.scrollLeft = scrollLeft;
                const h = headerGridRef.current?.element;
                if (h) h.scrollLeft = scrollLeft;
                const f = footerGridRef.current?.element;
                if (f) f.scrollLeft = scrollLeft;
              }}
            />
          )}
        </div>
      </div>

      {showResizeHandle && (
        <div
          role="separator"
          data-testid="footer-resize-handle"
          style={{ height: `${RESIZE_HANDLE_HEIGHT}px`, flexShrink: 0 }}
          className="cursor-row-resize border-border border-t bg-muted/50 transition-colors hover:bg-primary/20"
          onMouseDown={handleResizeMouseDown}
        />
      )}

      <div data-testid="footer" style={{ display: 'flex', flexDirection: 'row', flexShrink: 0 }}>
        <div
          ref={leftFooterRef}
          style={{
            width: `${fixedWidth}px`,
            height: `${effectiveFooterHeight}px`,
          }}
          className={cn(styles.borderRight)}
        >
          {/* Fixed Footer */}
          <Grid
            gridRef={fixedFooterGridRef}
            columnCount={fixedColumnCount}
            rowCount={footerRows}
            columnWidth={getColumnWidth}
            rowHeight={getRowHeight}
            overscanCount={0}
            className={cn(styles.hideScrollbar, !footerOverflows && styles.grid)}
            style={{
              width: fixedWidth,
              height: effectiveFooterHeight,
              overflow: footerOverflows ? 'scroll' : undefined,
            }}
            cellProps={{ data: fixedFooterData } as any}
            cellComponent={FooterCell as any}
          />
        </div>
        <div
          ref={mainFooterRef}
          style={{
            display: 'flex',
            flex: 1,
            width: `${bodyWidth}px`,
            height: `${effectiveFooterHeight}px`,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Scrollable Footer */}
          <Grid
            gridRef={footerGridRef}
            columnCount={totalColumns - fixedColumnCount}
            rowCount={footerRows}
            columnWidth={getScrollableColumnWidthWithExtraWidth}
            rowHeight={getRowHeight}
            overscanCount={0}
            className={cn(styles.hideScrollbar, !footerOverflows && styles.grid)}
            style={{
              width: bodyWidth - (showVerticalScrollbar || showFooterVerticalScrollbar ? scrollBarSize : 0),
              height: effectiveFooterHeight,
              overflow: footerOverflows ? 'scroll' : undefined,
            }}
            cellProps={{ data: scrollableFooterData } as any}
            cellComponent={FooterCell as any}
          />
          {showFooterVerticalScrollbar && (
            <PivotVerticalScrollbar
              scrollRef={footerVScrollRef}
              height={effectiveFooterHeight}
              scrollHeight={naturalFooterHeight}
              onScroll={(scrollTop) => {
                const f = fixedFooterGridRef.current?.element;
                if (f) f.scrollTop = scrollTop;
                const sf = footerGridRef.current?.element;
                if (sf) sf.scrollTop = scrollTop;
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
