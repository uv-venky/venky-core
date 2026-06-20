'use client';
/* Copyright (c) 2024-present Venky Corp. */

import type { eventWithTime } from '@rrweb/types';

interface RecorderConfig {
  bufferMinutes: number;
  maskAllInputs: boolean;
  mouseMoveInterval: number;
  checkoutEveryNms: number;
}

export class FeedbackRecorder {
  private events: eventWithTime[] = [];
  private stopFn: (() => void) | null = null;
  private recordModule: { takeFullSnapshot?: (isCheckout?: boolean) => void } | null = null;
  private bufferMs: number;
  private config: RecorderConfig;
  private paused = false;

  constructor(config: RecorderConfig) {
    this.config = config;
    this.bufferMs = config.bufferMinutes * 60 * 1000;
  }

  /** Pause recording — events emitted while paused are silently dropped */
  pause(): void {
    this.paused = true;
  }

  /** Resume recording after a pause */
  resume(): void {
    this.paused = false;
    // Force a clean DOM snapshot after the paused period so the replayer
    // doesn't carry over overlay/drawer mutations from the feedback panel
    this.triggerCheckout();
  }

  /**
   * Force a new FullSnapshot (checkout) into the event buffer.
   * The rrweb player treats checkout snapshots as DOM reset points —
   * it replaces the entire DOM rather than applying incremental mutations.
   * Call this on SPA route changes so navigations don't cause stacked DOM.
   */
  triggerCheckout(): void {
    if (!this.stopFn || this.paused) return;
    try {
      this.recordModule?.takeFullSnapshot?.(true);
    } catch {
      // Silently ignore — recording may have stopped between the check and the call
    }
  }

  async start(): Promise<void> {
    // Wait for the page to be interactive before starting rrweb recording
    if (typeof document !== 'undefined' && document.readyState !== 'complete') {
      await new Promise<void>((resolve) => {
        window.addEventListener('load', () => resolve(), { once: true });
      });
    }

    const { record } = await import('@rrweb/record');
    this.recordModule = record;
    this.stopFn =
      record({
        emit: (event) => {
          if (this.paused) return;
          this.events.push(event);
          this.evict();
        },
        maskAllInputs: this.config.maskAllInputs,
        blockClass: 'feedback-block',
        maskTextClass: 'feedback-mask',
        sampling: { mousemove: this.config.mouseMoveInterval },
        checkoutEveryNms: this.config.checkoutEveryNms,
        // Inline assets so replays work cross-origin (feedback portal is on a different host)
        inlineStylesheet: true,
        collectFonts: true,
        inlineImages: true,
      }) ?? null;
  }

  stop(): void {
    this.stopFn?.();
    this.stopFn = null;
    this.recordModule = null;
  }

  snapshot(): eventWithTime[] {
    return [...this.events];
  }

  private evict(): void {
    const cutoff = Date.now() - this.bufferMs;
    const idx = this.events.findIndex((e) => e.timestamp >= cutoff);
    if (idx > 0) {
      this.events = this.events.slice(idx);
    }
  }
}
