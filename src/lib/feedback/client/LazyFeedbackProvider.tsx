'use client';
/* Copyright (c) 2024-present Venky Corp. */

/**
 * Heavy feedback provider (session replay, submit, context). Loaded dynamically by
 * {@link FeedbackProvider} so this module is not in the SSR graph for widgets that only use `useFeedback`.
 *
 * @internal — not exported from the package; use {@link FeedbackProvider} from `venky-core/ui`.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { eventWithTime } from '@rrweb/types';
import type { FeedbackConfig, FeedbackType } from '../common/types';
import { DEFAULT_FEEDBACK_CONFIG } from '../common/types';
import {
  FeedbackContext,
  type FeedbackContextValue,
  type FeedbackProviderProps,
  type FeedbackSubmitData,
} from './feedbackContext';
import { useRecorder } from './useRecorder';
import { captureScreenshot } from './screenshot';
import { collectFeedbackContext, initConsoleCapture } from './collectContext';
import { installFeedbackFetchInterceptor } from './diagnostics';
import { trimEvents } from './trimEvents';
import { inlineFontsInEvents } from './inlineFonts';
import { gzipJsonStringToBlob } from './recordingPayload';

export function LazyFeedbackProvider({ config: configOverride, children }: FeedbackProviderProps) {
  const config = useMemo<FeedbackConfig>(
    () => ({
      ...DEFAULT_FEEDBACK_CONFIG,
      ...configOverride,
      recording: { ...DEFAULT_FEEDBACK_CONFIG.recording, ...configOverride?.recording },
      widget: { ...DEFAULT_FEEDBACK_CONFIG.widget, ...configOverride?.widget },
      api: { ...DEFAULT_FEEDBACK_CONFIG.api, ...configOverride?.api },
      context: { ...DEFAULT_FEEDBACK_CONFIG.context, ...configOverride?.context },
    }),
    [configOverride],
  );

  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const { snapshot, pause, resume, triggerCheckout, isRecording } = useRecorder(config.recording);
  const pathname = usePathname();

  const frozenEventsRef = useRef<unknown[]>([]);
  const isInitialMount = useRef(true);

  useEffect(() => {
    installFeedbackFetchInterceptor();
    const cleanup = initConsoleCapture();
    return cleanup;
  }, []);

  // Force FullSnapshot checkout on SPA route changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!isRecording) return;
    const timer = setTimeout(() => triggerCheckout(), 300);
    return () => clearTimeout(timer);
  }, [pathname, isRecording, triggerCheckout]);

  const open = useCallback(
    (type?: FeedbackType) => {
      if (isRecording) {
        frozenEventsRef.current = snapshot();
        pause();
      }
      setSelectedType(type ?? null);
      setIsOpen(true);
    },
    [isRecording, snapshot, pause],
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setSelectedType(null);
    frozenEventsRef.current = [];
    resume();
  }, [resume]);

  const getFrozenEvents = useCallback(() => frozenEventsRef.current, []);

  const submit = useCallback(
    async (data: FeedbackSubmitData): Promise<string> => {
      const context = collectFeedbackContext(config.context, data.includeDiagnostics !== false);
      const formData = new FormData();
      formData.append('type', data.type);
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.priority) formData.append('priority', data.priority);
      formData.append('context', JSON.stringify(context));

      // Screenshot — skip if user opted out
      if (data.includeScreenshot !== false) {
        if (data.screenshotBlob) {
          formData.append('screenshot', data.screenshotBlob, 'screenshot.png');
        }
        if (data.annotationBlob) {
          formData.append('annotation', data.annotationBlob, 'annotation.png');
        }
      }

      // Session recording — skip if user opted out
      if (data.includeRecording !== false && isRecording) {
        let events = frozenEventsRef.current;

        // Apply trim window if provided
        if (data.trimWindow && events.length > 0) {
          events = trimEvents(events as eventWithTime[], data.trimWindow.startMs, data.trimWindow.endMs);
        }

        if (events.length > 0) {
          // Inline @font-face URLs as base64 data URIs for cross-origin replay
          await inlineFontsInEvents(events);
          const jsonStr = JSON.stringify(events);
          // Chunked gzip + concurrent readable consumption (see recordingPayload.ts)
          if (typeof CompressionStream !== 'undefined') {
            const compressedBlob = await gzipJsonStringToBlob(jsonStr);
            formData.append('recording', new Blob([compressedBlob], { type: 'application/gzip' }), 'recording.json.gz');
          } else {
            formData.append('recording', new Blob([jsonStr], { type: 'application/json' }), 'recording.json');
          }
        }
      }

      // Large recordings + proxy + upstream ingest can be slow; still bound so UI does not spin forever
      const SUBMIT_TIMEOUT_MS = 180_000;
      let response: Response;
      try {
        response = await fetch(config.api.endpoint, {
          method: 'POST',
          body: formData,
          signal: AbortSignal.timeout(SUBMIT_TIMEOUT_MS),
        });
      } catch (err) {
        const name = err instanceof Error ? err.name : '';
        if (name === 'AbortError' || name === 'TimeoutError') {
          throw new Error(
            'Submit timed out. Try turning off session recording or screenshot, or submit again in a moment.',
          );
        }
        throw err;
      }
      if (!response.ok) throw new Error('Failed to submit feedback');
      const result = await response.json();
      return result.result.id;
    },
    [config, isRecording],
  );

  const doCapture = useCallback(() => captureScreenshot(), []);

  const value = useMemo<FeedbackContextValue>(
    () => ({
      config,
      isOpen,
      selectedType,
      open,
      close,
      submit,
      captureScreenshot: doCapture,
      getFrozenEvents,
      isRecording,
    }),
    [config, isOpen, selectedType, open, close, submit, doCapture, getFrozenEvents, isRecording],
  );

  return <FeedbackContext value={value}>{children}</FeedbackContext>;
}
