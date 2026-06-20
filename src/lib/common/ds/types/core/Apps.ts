/* Copyright (c) 2024-present Venky Corp. */

import type { ISODateTimeString } from '@/lib/core/common/ds/types/DataSource';

import type { SidebarIcon } from '@/components/sidebar/icons';

export interface Apps {
  appId: string;
  name: string;
  fullUrl: string;
  statusToken?: string | null;
  icon?: SidebarIcon | null;
  createdAt: ISODateTimeString;
  createdBy: string;
  updatedAt: ISODateTimeString;
  updatedBy: string;
}
