/* Copyright (c) 2024-present Venky Corp. */

import type { ISODateString } from '@/lib/core/common/ds/types/DataSource';

export interface UserSessions {
  csrfToken: string;
  expiresAt: ISODateString;
  ipAddress: string;
  lastAccessedAt: ISODateString;
  sessionId: string;
  signedInAt: ISODateString;
  signedOutAt?: ISODateString | null;
  userAgent: string;
  userId?: number | null;
  userName: string;
  appId: string;
  metadata?: Record<string, unknown> | null;
}
