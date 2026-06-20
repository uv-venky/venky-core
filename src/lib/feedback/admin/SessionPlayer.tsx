'use client';
/* Copyright (c) 2024-present Venky Corp. */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatTime } from '../common/formatTime';

interface SessionPlayerProps {
  events: unknown[];
  width?: number;
  height?: number;
  autoPlay?: boolean;
  className?: string;
  /** When provided, shows trim handles (dual-thumb) in the controller bar */
  trimStart?: number;
  trimEnd?: number;
  trimMax?: number;
  onTrimChange?: (start: number, end: number) => void;
  onTrimCommit?: (start: number, end: number) => void;
}

/** Inject rrweb replay CSS + our overrides into the document head */
const PLAYER_STYLE_ID = 'rrweb-player-styles';
function injectPlayerCSS() {
  if (typeof document === 'undefined') return;
  document.getElementById(PLAYER_STYLE_ID)?.remove();

  const style = document.createElement('style');
  style.id = PLAYER_STYLE_ID;
  style.textContent = `
    .replayer-wrapper { position: relative; margin: 0 auto; }
    .replayer-wrapper > iframe { border: none; position: absolute !important; top: 0; left: 0; }
    .replayer-mouse { position: absolute; width: 20px; height: 20px; transition: left .05s linear, top .05s linear; background-size: contain; background-position: center; background-repeat: no-repeat; background-image: url("data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjMwMCIgd2lkdGg9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBkYXRhLW5hbWU9IkxheWVyIDEiIHZpZXdCb3g9IjAgMCA1MCA1MCI+PHBhdGggZD0iTTQ4LjcxIDQyLjkxTDM0LjA4IDI4LjI5IDQ0LjMzIDE4YTEgMSAwIDAwLS4zMy0xLjYxTDIuMzUgMS4wNmExIDEgMCAwMC0xLjI5IDEuMjlMMTYuMzkgNDRhMSAxIDAgMDAxLjY1LjM2bDEwLjI1LTEwLjI4IDE0LjYyIDE0LjYzYTEgMSAwIDAwMS40MSAwbDQuMzgtNC4zOGExIDEgMCAwMC4wMS0xLjQyem0tNS4wOSAzLjY3TDI5IDMyYTEgMSAwIDAwLTEuNDEgMGwtOS44NSA5Ljg1TDMuNjkgMy42OWwzOC4xMiAxNEwzMiAyNy41OEExIDEgMCAwMDMyIDI5bDE0LjU5IDE0LjYyeiIvPjwvc3ZnPg=="); z-index: 2; }
    .replayer-mouse:after { content: ""; display: inline-block; width: 20px; height: 20px; background: #4950f6; border-radius: 100%; transform: translate(-50%,-50%); opacity: .3; }
    .replayer-mouse-tail { position: absolute !important; top: 0; left: 0; pointer-events: none; z-index: 1; }
    .dark .replayer-wrapper { background: #1a1a1a; }
  `;
  document.head.appendChild(style);
}

const SPEED_OPTIONS = [1, 2, 4, 8] as const;

interface ReplayerInstance {
  destroy: () => void;
  play: (timeOffset?: number) => void;
  pause: (timeOffset?: number) => void;
  getMetaData: () => { startTime: number; endTime: number; totalTime: number };
  wrapper: HTMLElement;
  iframe: HTMLIFrameElement;
  getCurrentTime: () => number;
  setConfig: (config: { speed?: number }) => void;
}

export function SessionPlayer({
  events,
  width,
  height,
  autoPlay = false,
  className,
  trimStart,
  trimEnd,
  trimMax,
  onTrimChange,
  onTrimCommit,
}: SessionPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const replayerRef = useRef<ReplayerInstance | null>(null);
  const [ready, setReady] = useState(false);
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Inject CSS on first render
  useEffect(() => {
    injectPlayerCSS();
    setReady(true);
  }, []);

  // Track container width via ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      if (document.fullscreenElement) return;
      for (const entry of entries) {
        const w = Math.round(entry.contentRect.width);
        const h = Math.round(entry.contentRect.height);
        setMeasuredWidth((prev) => (Math.abs(prev - w) > 10 ? w : prev));
        setMeasuredHeight((prev) => (Math.abs(prev - h) > 10 ? h : prev));
      }
    });
    observer.observe(el);
    setMeasuredWidth(el.clientWidth);
    setMeasuredHeight(el.clientHeight);
    return () => observer.disconnect();
  }, []);

  // Update current time while playing
  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        const replayer = replayerRef.current;
        if (replayer) {
          const meta = replayer.getMetaData();
          const elapsed = replayer.getCurrentTime();
          setCurrentTime(Math.min(elapsed, meta.totalTime));
          if (elapsed >= meta.totalTime) {
            setPlaying(false);
          }
        }
      }, 200);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing]);

  // Initialize Replayer
  // biome-ignore lint/correctness/useExhaustiveDependencies: speed change handled via replayer.setConfig, not re-init
  useEffect(() => {
    if (!ready || !containerRef.current || events.length < 2 || measuredWidth === 0) return;

    let mounted = true;

    const initReplayer = async () => {
      const { Replayer } = await import('@rrweb/replay');
      if (!mounted || !containerRef.current) return;

      // Clear previous replayer
      if (replayerRef.current) {
        replayerRef.current.destroy();
        replayerRef.current = null;
      }
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }

      const containerEl = containerRef.current;
      // Reset inline height from previous render so we recalculate fresh
      containerEl.style.height = '';

      // Available space for the replay — used by the post-render scaling logic
      const availableWidth = width ?? measuredWidth;
      const availableHeight =
        measuredHeight > 0
          ? measuredHeight
          : Math.max(200, window.innerHeight - containerEl.getBoundingClientRect().top - 72);

      const replayer = new Replayer(events as ConstructorParameters<typeof Replayer>[0], {
        root: containerEl,
        speed,
      }) as unknown as ReplayerInstance;

      replayerRef.current = replayer;

      // Get duration
      const meta = replayer.getMetaData();
      setDuration(meta.totalTime);
      setCurrentTime(0);

      // Start playback to make iframe visible, then pause for preview
      replayer.play();
      if (!autoPlay) {
        requestAnimationFrame(() => {
          replayer.pause();
          setPlaying(false);
        });
      } else {
        setPlaying(true);
      }

      // Scale wrapper to fit available space and center
      requestAnimationFrame(() => {
        if (!replayer.wrapper || !replayer.iframe) return;
        const iframeW = replayer.iframe.offsetWidth;
        const iframeH = replayer.iframe.offsetHeight;
        if (iframeW > 0 && iframeH > 0) {
          const scaleX = availableWidth / iframeW;
          const scaleY = availableHeight / iframeH;
          const scale = Math.min(scaleX, scaleY, 1);
          const scaledW = Math.round(iframeW * scale);
          const scaledH = Math.round(iframeH * scale);
          const offsetX = Math.max(0, Math.round((availableWidth - scaledW) / 2));
          const offsetY = Math.max(0, Math.round((availableHeight - scaledH) / 2));
          replayer.wrapper.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
          replayer.wrapper.style.transformOrigin = 'top left';
          replayer.wrapper.style.width = `${iframeW}px`;
          replayer.wrapper.style.height = `${iframeH}px`;
        }
      });
    };

    initReplayer();

    return () => {
      mounted = false;
      if (replayerRef.current) {
        replayerRef.current.destroy();
        replayerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- speed change handled via replayer.setConfig, not re-init
  }, [ready, events, width, height, autoPlay, measuredWidth, measuredHeight]);

  const togglePlay = useCallback(() => {
    const replayer = replayerRef.current;
    if (!replayer) return;
    if (playing) {
      replayer.pause();
      setPlaying(false);
    } else {
      // If at end, restart from beginning
      if (currentTime >= duration) {
        replayer.play(0);
      } else {
        replayer.play(currentTime);
      }
      setPlaying(true);
    }
  }, [playing, currentTime, duration]);

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const replayer = replayerRef.current;
      if (!replayer) return;
      const time = Number(e.target.value);
      setCurrentTime(time);
      if (playing) {
        replayer.play(time);
      } else {
        replayer.pause(time);
      }
    },
    [playing],
  );

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
    const replayer = replayerRef.current;
    if (replayer) {
      replayer.setConfig({ speed: newSpeed });
    }
  }, []);

  if (events.length < 2) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border border-dashed p-8 text-muted-foreground text-sm',
          className,
        )}
      >
        No session recording available
      </div>
    );
  }

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Replay area */}
      <div ref={containerRef} className="flex min-h-0 flex-1 justify-center overflow-hidden" />

      {/* Controller bar */}
      <div className="shrink-0 border-t bg-background px-4 py-2">
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={togglePlay}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          {/* Current time */}
          <span className="w-12 shrink-0 text-center font-mono text-muted-foreground text-xs">
            {formatTime(currentTime)}
          </span>

          {/* Unified timeline: playhead + optional trim handles */}
          {trimMax != null && onTrimChange ? (
            <div className="relative flex-1">
              {/* Trim slider (dual-thumb) */}
              <Slider
                min={0}
                max={trimMax}
                step={1000}
                value={[trimStart ?? 0, trimEnd ?? trimMax]}
                onValueChange={([start, end]) => onTrimChange(start, end)}
                onValueCommit={onTrimCommit ? ([start, end]) => onTrimCommit(start, end) : undefined}
              />
              {/* Playhead indicator — bound within the trimmed range */}
              {duration > 0 &&
                trimMax > 0 &&
                (() => {
                  const tStart = trimStart ?? 0;
                  const tEnd = trimEnd ?? trimMax;
                  // Map currentTime (0..duration of trimmed clip) to position within trimStart..trimEnd
                  const trimmedDuration = tEnd - tStart;
                  const playheadPos =
                    trimmedDuration > 0 ? tStart + (currentTime / duration) * trimmedDuration : tStart;
                  const pct = (playheadPos / trimMax) * 100;
                  return (
                    <div
                      className="pointer-events-none absolute top-1/2 z-10 flex -translate-y-1/2 flex-col items-center"
                      style={{ left: `${pct}%` }}
                    >
                      <div className="h-5 w-0.5 rounded-full bg-red-500" />
                    </div>
                  );
                })()}
            </div>
          ) : (
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
          )}

          {/* Duration / trim info */}
          <span className="w-12 shrink-0 text-center font-mono text-muted-foreground text-xs">
            {formatTime(trimMax != null ? (trimEnd ?? trimMax) - (trimStart ?? 0) : duration)}
          </span>

          {/* Speed selector */}
          <div className="flex shrink-0 items-center gap-0.5">
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSpeedChange(s)}
                className={cn(
                  'rounded px-1.5 py-0.5 font-mono text-xs transition-colors',
                  speed === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
