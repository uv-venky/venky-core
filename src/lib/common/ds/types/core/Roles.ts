/* Copyright (c) 2024-present Venky Corp. */

import type { ISODateTimeString } from '@/lib/core/common/ds/types/DataSource';

export interface Roles {
  appId: string;
  createdAt: ISODateTimeString;
  createdBy: string;
  description?: string | null;
  endDate?: ISODateTimeString | null;
  roleCode: string;
  roleName: string;
  startDate: ISODateTimeString;
  updatedAt: ISODateTimeString;
  updatedBy: string;
  userName?: string | null;
}
