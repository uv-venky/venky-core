'use client';

import { type Placement, arrow, computePosition, offset, shift, flip, size } from '@floating-ui/dom';
import { useEffect, useRef, useState } from 'react';
import useDebounce from '@/components/core/hooks/useDebounce';
import useEventListener from '@/components/core/hooks/useEventListener';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { zIndex } from '@/components/core/common/constants';
import { createPortal } from 'react-dom';
import { isNull } from '@/lib/core/common/isEmpty';
import { MarkdownDisplay } from '@/components/core/markdown-display';

interface State {
  el: Element | null;
  tip: string | null;
  at: Placement;
  html: boolean;
  markdown: boolean;
  error: boolean;
  width: number;
  showOnClick: boolean;
}

const EMPTY: State = {
  el: null,
  tip: null,
  at: 'top',
  html: false,
  markdown: false,
  error: false,
  width: 600,
  showOnClick: false,
};

interface XY {
  x: number;
  y: number;
}

const delayConfig = '1000';
const DEFAULT_XY: XY = { x: -1000, y: -1000 };
const TIP_WIDTH = '600';
const eventOptions: AddEventListenerOptions = {
  passive: true,
  capture: true,
};

function TooltipInner({ tooltipDiv }: { tooltipDiv: HTMLElement }) {
  const [state, setState] = useState<State>(EMPTY);
  const [delay, setDelay] = useState('1000');
  const [data, setData] = useState<XY>(DEFAULT_XY);
  let clickActive = false;
  const popperRef = useRef<HTMLDivElement>(null);
  const popperBodyRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const pendingEl = useRef<HTMLElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const [debounceSetTip, cancelDebounce, setTipImmediately] = useDebounce((_state: State) => {
    pendingEl.current = null;
    setState(_state);
    setData(DEFAULT_XY);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = undefined;
    }
    setDelay('0');
  });

  const closeTip = () => {
    pendingEl.current = null;
    cancelDebounce();
    setState(EMPTY);
    setData(DEFAULT_XY);
    clickActive = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    const to = setTimeout(() => {
      setDelay(`${delayConfig}`);
      timeoutRef.current = undefined;
    }, 1000);
    timeoutRef.current = to;
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
      if (closeTimeoutRef) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = undefined;
      }
    };
  }, []);

  const onMouseEnter = (e: MouseEvent) => {
    if (clickActive) {
      return;
    }
    const target = e.target as HTMLElement | undefined;
    if (!(target instanceof Element && document.body.contains(target))) {
      return;
    }
    if (popperRef.current?.contains(target)) {
      if (closeTimeoutRef.current) {
        // cancel the closeTip to prevent flicker
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = undefined;
      }
      return;
    }
    const { tip, tipOnEllipsis, tipOnClick } = target.dataset;
    const dataTip = tip;
    const onEllipsis = !isNull(tipOnEllipsis) && tipOnEllipsis !== 'false';
    const onclick = !isNull(tipOnClick) && tipOnClick !== 'false';
    if (
      dataTip &&
      !onclick &&
      document.body.contains(target) &&
      (!onEllipsis || target.offsetWidth < target.scrollWidth)
    ) {
      const { tipAt, tipHtml, tipMarkdown, tipError, tipWidth, tipDelay } = target.dataset;
      const dataAt = (tipAt ?? 'top') as Placement;
      const _html = !isNull(tipHtml) && tipHtml !== 'false';
      const _markdown = !isNull(tipMarkdown) && tipMarkdown !== 'false';
      const _error = !isNull(tipError) && tipError !== 'false';
      const _width = Number.parseInt(tipWidth ?? TIP_WIDTH, 10);
      const delayMs = delay === '0' ? 0 : Number.parseInt(tipDelay ?? (onEllipsis ? '0' : delay), 10);
      pendingEl.current = target;
      const _state: State = {
        el: target,
        tip: dataTip,
        at: dataAt,
        html: _html,
        markdown: _markdown,
        error: _error,
        width: _width,
        showOnClick: false,
      };
      setDelay(`${delayMs}`);
      if (delayMs === 0) {
        setTipImmediately(_state);
      } else {
        // updateDelay(delayMs);
        debounceSetTip(delayMs, _state);
      }
    }
  };

  function onMouseLeave(e: MouseEvent) {
    if (clickActive || !(e.relatedTarget instanceof Node)) {
      return;
    }
    if (e.target === state.el || e.target === popperRef.current) {
      if (popperRef.current?.contains(e.relatedTarget)) {
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
          closeTimeoutRef.current = undefined;
        }
        return;
      }
      closeTimeoutRef.current = setTimeout(() => {
        closeTip();
      }, 300);
    } else if (pendingEl.current === e.target) {
      cancelDebounce();
    }
  }

  const onClick = (e: MouseEvent) => {
    const { target: _target } = e;
    if (!(_target instanceof HTMLElement || _target instanceof SVGElement)) {
      return;
    }
    let target: HTMLElement | SVGElement | null = _target;
    if (popperRef.current?.contains(target)) {
      return;
    }
    const el = state.el;
    if (el && !el.contains(target)) {
      closeTip();
      return;
    }
    if (!el) {
      cancelDebounce();
    }
    let found = false;
    while (target) {
      const { tip, tipOnClick } = target.dataset;
      const dataTip = tip;
      const onclick = !isNull(tipOnClick) && tipOnClick !== 'false';
      if (dataTip && onclick) {
        const { tipAt, tipHtml, tipMarkdown, tipError, tipWidth } = target.dataset;
        const dataAt = (tipAt ?? 'top') as Placement;
        const dataHtml = !isNull(tipHtml) && tipHtml !== 'false';
        const dataMarkdown = !isNull(tipMarkdown) && tipMarkdown !== 'false';
        const _error = !isNull(tipError) && tipError !== 'false';
        const _width = Number.parseInt(tipWidth ?? TIP_WIDTH, 10);
        setTipImmediately({
          el: target,
          tip: dataTip,
          at: dataAt,
          html: dataHtml,
          markdown: dataMarkdown,
          error: _error,
          width: _width,
          showOnClick: true,
        });
        clickActive = true;
        found = true;
        break;
      } else {
        target = target.parentElement;
      }
    }
    if (!found) {
      closeTip();
    }
  };

  function onVisibilityChange() {
    if (clickActive) {
      return;
    }
    closeTip();
  }

  useEventListener(document, 'mouseenter', onMouseEnter, eventOptions);
  useEventListener(document, 'mouseleave', onMouseLeave, eventOptions);
  useEventListener(document, 'click', onClick, eventOptions);
  useEventListener(document, 'visibilitychange', onVisibilityChange);
  useEventListener(document.body, 'blur', onVisibilityChange);

  useEffect(() => {
    const _state = state;
    const { el, at } = _state;

    if (el && popperRef.current && arrowRef.current) {
      computePosition(el, popperRef.current, {
        middleware: [
          flip(),
          shift(),
          size({
            apply(p) {
              const OFFSET = 16;
              let availableHeight: number | undefined;
              const height = popperBodyRef.current?.getBoundingClientRect().height ?? 0;
              const bottomSpace = window.innerHeight - (p.rects.reference.y + p.rects.reference.height) - OFFSET;
              const topSpace = p.rects.reference.y - OFFSET;
              const space = Math.max(bottomSpace, topSpace);
              if ((p.placement === 'top' || p.placement === 'bottom') && height > space) {
                availableHeight = space;
              }
              if (availableHeight) {
                popperBodyRef.current?.style.setProperty('max-height', `${availableHeight}px`);
              }
            },
          }),
          offset({ mainAxis: 8, crossAxis: 0 }),
          arrow({ element: arrowRef.current }),
        ],
        placement: at,
        strategy: 'fixed',
      }).then(({ x, y, placement, middlewareData }) => {
        // Check if it's still valid
        if (popperRef.current && arrowRef.current && el === state.el) {
          setData({ x, y });
          const { x: arrowX, y: arrowY } = middlewareData.arrow ?? {
            x: undefined,
            y: undefined,
          };
          const staticSide = {
            top: 'bottom',
            right: 'left',
            bottom: 'top',
            left: 'right',
          }[placement.split('-')[0]];

          Object.assign(arrowRef.current?.style, {
            left: !isNull(arrowX) ? `${arrowX}px` : '',
            top: !isNull(arrowY) ? `${arrowY}px` : '',
            right: '',
            bottom: '',
            [staticSide ?? 'top']: '-4px',
          });
        }
      }, console.error);
    }
  }, [state]);

  return createPortal(
    <div
      ref={popperRef}
      role="tooltip"
      style={{
        visibility: state.tip ? 'visible' : 'hidden',
        top: `${data.y}px`,
        left: `${data.x}px`,
        maxWidth: `${state.width}px`,
        width: 'max-content',
        zIndex: zIndex.Tooltip,
        pointerEvents: state.markdown || state.error || (state.tip?.length ?? 0) > 40 ? 'auto' : 'none',
      }}
      className="tooltip absolute"
    >
      <div
        ref={arrowRef}
        className={cn('arrow absolute z-10 shadow-lg', state.error ? 'bg-destructive' : 'bg-gray-700')}
        style={{
          width: '8px',
          height: '8px',
          transform: 'rotate(45deg)',
        }}
      />
      {state.tip && (
        <div
          ref={popperBodyRef}
          className={cn('relative overflow-auto rounded-md px-4 py-2 text-white shadow-lg', {
            'bg-gray-700': !state.error,
            'bg-destructive': state.error,
          })}
        >
          {state.showOnClick && (
            <Button
              className="absolute top-r right-2"
              onClick={() => {
                closeTip();
              }}
              variant="ghost"
              size="icon"
            >
              <X />
            </Button>
          )}
          {state.markdown ? (
            <MarkdownDisplay content={state.tip} />
          ) : state.html ? (
            <div dangerouslySetInnerHTML={{ __html: state.tip }} />
          ) : (
            state.tip
          )}
        </div>
      )}
    </div>,
    tooltipDiv,
  );
}

export default function GlobalTooltip() {
  const [tooltipDiv, setTooltipDiv] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const tooltipDiv = document.getElementById('tooltip');
    if (!tooltipDiv) {
      throw new Error('Tooltip/Arrow div not found');
    }
    setTooltipDiv(tooltipDiv as HTMLDivElement);
  }, []);

  if (!tooltipDiv) {
    return null;
  }

  return <TooltipInner tooltipDiv={tooltipDiv} />;
}
