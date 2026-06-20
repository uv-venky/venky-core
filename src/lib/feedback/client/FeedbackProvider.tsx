'use client';
/* Copyright (c) 2024-present Venky Corp. */

import { useEffect, useState, type ComponentType } from 'react';
import type { FeedbackProviderProps } from './feedbackContext';

/**
 * Mounts the full feedback stack (recording, submit, context) after client hydration by
 * dynamically importing {@link LazyFeedbackProvider}. Consumers should use this component;
 * {@link LazyFeedbackProvider} is internal to core.
 *
 * `useFeedback` reads `FeedbackContext` from `./feedbackContext` only, so widgets avoid a static
 * dependency on the heavy feedback bundle during SSR.
 */
export function FeedbackProvider({ config, children }: FeedbackProviderProps) {
  const [Impl, setImpl] = useState<ComponentType<FeedbackProviderProps> | null>(null);

  useEffect(() => {
    void import('./LazyFeedbackProvider').then((m) => {
      setImpl(() => m.LazyFeedbackProvider);
    });
  }, []);

  if (!Impl) {
    return <>{children}</>;
  }

  return <Impl config={config}>{children}</Impl>;
}
