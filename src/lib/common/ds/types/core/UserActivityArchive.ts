/* Copyright (c) 2024-present Venky Corp. */

import type { ISODateString } from '@/lib/core/common/ds/types/Base';

export interface UserActivityArchive {
  archiveId: number;
  appId: string;
  activityDate: ISODateString;
  userName: string;
  eventType: string;
  pageUrl?: string | null;
  activityCount: number;
  spacer?: string | null;
}
