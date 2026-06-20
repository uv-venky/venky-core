'use client';
/* Copyright (c) 2024-present Venky Corp. */

import { useContext } from 'react';
import { FeedbackContext, type FeedbackContextValue } from './feedbackContext';

export function useFeedback(): FeedbackContextValue | null {
  return useContext(FeedbackContext);
}

/** For use inside components guarded by a null check on useFeedback(). */
export function useFeedbackRequired(): FeedbackContextValue {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error('useFeedbackRequired called without FeedbackProvider');
  }
  return ctx;
}
