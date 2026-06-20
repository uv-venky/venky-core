'use client';
/* Copyright (c) 2024-present Venky Corp. */

import { createContext, type ReactNode } from 'react';
import type { FeedbackConfig, FeedbackPriority, FeedbackType } from '../common/types';

export interface FeedbackSubmitData {
  type: FeedbackType;
  title: string;
  description?: string;
  priority?: FeedbackPriority;
  screenshotBlob?: Blob;
  annotationBlob?: Blob;
  includeScreenshot?: boolean;
  includeRecording?: boolean;
  includeDiagnostics?: boolean;
  trimWindow?: { startMs: number; endMs: number };
}

export interface FeedbackContextValue {
  config: FeedbackConfig;
  isOpen: boolean;
  selectedType: FeedbackType | null;
  open: (type?: FeedbackType) => void;
  close: () => void;
  submit: (data: FeedbackSubmitData) => Promise<string>;
  captureScreenshot: () => Promise<Blob>;
  getFrozenEvents: () => unknown[];
  isRecording: boolean;
}

export const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export interface FeedbackProviderProps {
  config?: Partial<FeedbackConfig>;
  children: ReactNode;
}
