'use client';
/* Copyright (c) 2024-present Venky Corp. */

import { useEffect, useRef } from 'react';
import type { FeedbackConfig } from '../common/types';
import { FeedbackRecorder } from './recorder';

export function useRecorder(config: FeedbackConfig['recording']) {
  const recorderRef = useRef<FeedbackRecorder | null>(null);

  useEffect(() => {
    if (!config.enabled) return;
    const recorder = new FeedbackRecorder(config);
    recorderRef.current = recorder;
    recorder.start();
    return () => {
      recorder.stop();
      recorderRef.current = null;
    };
  }, [config]);

  return {
    snapshot: () => recorderRef.current?.snapshot() ?? [],
    pause: () => recorderRef.current?.pause(),
    resume: () => recorderRef.current?.resume(),
    triggerCheckout: () => recorderRef.current?.triggerCheckout(),
    isRecording: config.enabled,
  };
}
