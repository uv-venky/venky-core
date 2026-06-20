/* Copyright (c) 2024-present Venky Corp. */

import type { DataSource } from '@/lib/core/common/ds/types/DataSource';
import { DefaultAttribute, DefaultDataSource, DefaultFullAccess } from '@/lib/server/ds/defs/defaults';
import type { Apps } from '@/lib/common/ds/types/core/Apps';
import { getPrefix } from '@/lib/server/constants';
const PREFIX = getPrefix();

export const AppsDS: DataSource<Apps> = {
  ...DefaultDataSource,
  id: 'Apps',
  tableName: `${PREFIX}apps`,
  attributes: [
    {
      ...DefaultAttribute,
      code: 'appId',
      name: 'App ID',
      type: 'Text',
      column: 'app_id',
      maxLength: 128,
      primary: true,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'name',
      name: 'Name',
      type: 'Text',
      column: 'name',
      maxLength: 200,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'fullUrl',
      name: 'Full URL',
      type: 'Text',
      column: 'full_url',
      maxLength: 500,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'statusToken',
      name: 'Status Token',
      type: 'Text',
      column: 'status_token',
      maxLength: 256,
      optional: true,
    },
    {
      ...DefaultAttribute,
      code: 'icon',
      name: 'Icon',
      type: 'Text',
      column: 'icon',
      maxLength: 50,
      optional: true,
    },
    {
      ...DefaultAttribute,
      code: 'createdAt',
      name: 'Created At',
      type: 'Date',
      column: 'created_at',
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'createdBy',
      name: 'Created By',
      type: 'Text',
      column: 'created_by',
      maxLength: 128,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'updatedAt',
      name: 'Updated At',
      type: 'Date',
      column: 'updated_at',
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'updatedBy',
      name: 'Updated By',
      type: 'Text',
      column: 'updated_by',
      maxLength: 128,
      optional: false,
    },
  ],
  access: [
    {
      ...DefaultFullAccess,
      roleCode: 'admin',
    },
  ],
};
