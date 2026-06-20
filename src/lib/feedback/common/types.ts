/* Copyright (c) 2024-present Venky Corp. */

import type { ISODateTimeString } from '@/lib/core/common/ds/types/Base';

export const FEEDBACK_TYPES = {
  bug: 'bug',
  feedback: 'feedback',
  feature_request: 'feature_request',
} as const;

export const FEEDBACK_STATUSES = {
  open: 'open',
  in_progress: 'in_progress',
  resolved: 'resolved',
  closed: 'closed',
} as const;

export const FEEDBACK_PRIORITIES = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  critical: 'critical',
} as const;

export const FEEDBACK_ATTACHMENT_TYPES = {
  screenshot: 'screenshot',
  annotation: 'annotation',
  session_recording: 'session_recording',
} as const;

export const FEEDBACK_LINK_TYPES = {
  datasource_row: 'datasource-row',
  github_issue: 'github-issue',
  github_pr: 'github-pr',
  support_ticket: 'support-ticket',
} as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[keyof typeof FEEDBACK_TYPES];
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[keyof typeof FEEDBACK_STATUSES];
export type FeedbackPriority = (typeof FEEDBACK_PRIORITIES)[keyof typeof FEEDBACK_PRIORITIES];
export type FeedbackAttachmentType = (typeof FEEDBACK_ATTACHMENT_TYPES)[keyof typeof FEEDBACK_ATTACHMENT_TYPES];
export type FeedbackLinkType = (typeof FEEDBACK_LINK_TYPES)[keyof typeof FEEDBACK_LINK_TYPES];

export interface FeedbackRecord {
  id: string;
  orgId: string;
  userId: string;
  type: FeedbackType;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  title: string;
  description?: string | null;
  pageUrl?: string | null;
  routePath?: string | null;
  pageCode?: string | null;
  componentCode?: string | null;
  datasourceId?: string | null;
  storeAlias?: string | null;
  context?: FeedbackCaptureContext | null;
  assignedTo?: string | null;
  tags?: string[] | null;
  deletedAt?: ISODateTimeString | null;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface FeedbackAttachment {
  id: string;
  feedbackId: string;
  type: FeedbackAttachmentType;
  s3Key: string;
  fileName?: string | null;
  contentType?: string | null;
  sizeBytes?: number | null;
  durationSeconds?: number | null;
  createdAt: ISODateTimeString;
}

export interface FeedbackComment {
  id: string;
  feedbackId: string;
  userId: string;
  body: string;
  createdAt: ISODateTimeString;
}

export interface FeedbackLink {
  id: string;
  feedbackId: string;
  linkType: FeedbackLinkType;
  externalId: string;
  metadata?: Record<string, unknown> | null;
  createdAt: ISODateTimeString;
}

export interface FeedbackStoreSnapshot {
  datasourceId: string;
  alias: string;
  page: string;
  rowCount: number;
  totalRowCount?: number;
  isLoading: boolean;
  isDirty: boolean;
  dirtyRowCount: number;
  storeFilters: unknown[];
  smartSearchFilters: unknown[];
  headerFilters: unknown[];
  sort?: Record<string, unknown>;
}

export interface FeedbackLogEntry {
  level: string;
  message: string;
  dataSource?: string;
  timestamp: string;
  extra?: Record<string, unknown>;
}

export interface FeedbackErrorEntry {
  source: string;
  message: string;
  timestamp: string;
  url?: string;
}

export interface FeedbackNetworkEntry {
  method: string;
  url: string;
  status?: number;
  duration?: number;
  error?: string;
  timestamp: string;
  body?: unknown;
}

export interface FeedbackCaptureContext {
  routePath: string;
  fullUrl: string;
  pageCode?: string;
  componentCode?: string;
  datasourceId?: string;
  storeAlias?: string;
  rowId?: string;
  selectedRowIds?: string[];
  filters?: unknown[];
  sort?: Record<string, number>;
  activeTab?: string;
  activeDialog?: string;
  browser: {
    userAgent: string;
    viewport: { width: number; height: number };
    language?: string;
  };
  appVersion?: string;
  featureFlags?: string[];
  networkErrors?: Array<{ url: string; status: number }>;
  occurredAt: string;
  activeStores?: FeedbackStoreSnapshot[];
  recentLogs?: FeedbackLogEntry[];
  /** Console/unhandled errors and error-level log lines (ring buffer snapshot). Empty when `includeDiagnostics` is false. */
  recentErrors: Array<FeedbackErrorEntry | FeedbackLogEntry>;
  recentNetwork?: FeedbackNetworkEntry[];
}

export interface FeedbackWithDetails extends FeedbackRecord {
  attachments: FeedbackAttachment[];
  comments: FeedbackComment[];
  links: FeedbackLink[];
}

export interface FeedbackConfig {
  recording: {
    enabled: boolean;
    bufferMinutes: number;
    maskAllInputs: boolean;
    mouseMoveInterval: number;
    checkoutEveryNms: number;
  };
  widget: {
    position: 'bottom-right' | 'bottom-left' | 'about-menu' | 'none';
    keyboardShortcut?: string;
    types: FeedbackType[];
    accentColor?: string;
  };
  api: {
    endpoint: string;
  };
  context?: {
    appVersion?: string;
    featureFlags?: string[];
    customData?: Record<string, unknown>;
  };
}

export const DEFAULT_FEEDBACK_CONFIG: FeedbackConfig = {
  recording: {
    enabled: false,
    bufferMinutes: 5,
    maskAllInputs: true,
    mouseMoveInterval: 200,
    checkoutEveryNms: 60000,
  },
  widget: {
    position: 'about-menu',
    types: [FEEDBACK_TYPES.bug, FEEDBACK_TYPES.feedback, FEEDBACK_TYPES.feature_request],
    keyboardShortcut: 'ctrl+shift+f',
  },
  api: {
    endpoint: '/api/feedback',
  },
};
