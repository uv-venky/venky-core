/* Copyright (c) 2024-present Venky Corp. */

import type { UserAvatar } from '@/lib/common/ds/types/core/UserAvatar';
import type { DataSource } from '@/lib/core/common/ds/types/DataSource';
import { DefaultAttribute, DefaultDataSource, DefaultReadOnlyAccess } from '@/lib/server/ds/defs/defaults';
import { getPrefix } from '@/lib/server/constants';
const PREFIX = getPrefix();

export const UserAvatarDS: DataSource<UserAvatar> = {
  ...DefaultDataSource,
  id: 'UserAvatar',
  tableName: `${PREFIX}users`,
  attributes: [
    {
      ...DefaultAttribute,
      code: 'displayName',
      name: 'Display Name',
      type: 'Text',
      column: 'display_name',
      maxLength: 128,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'email',
      name: 'Email',
      type: 'Text',
      column: 'email',
      maxLength: 128,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'endDate',
      name: 'End Date',
      type: 'Date',
      column: 'end_date',
      maxLength: 255,
    },
    {
      ...DefaultAttribute,
      code: 'locationName',
      name: 'Location Name',
      type: 'Text',
      column: 'location_name',
      maxLength: 128,
    },
    {
      ...DefaultAttribute,
      code: 'picture',
      name: 'Picture',
      type: 'Text',
      column: 'picture',
      maxLength: 255,
    },
    {
      ...DefaultAttribute,
      code: 'startDate',
      name: 'Start Date',
      type: 'Date',
      column: 'start_date',
      maxLength: 255,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'userId',
      name: 'User Id',
      type: 'Number',
      column: 'user_id',
      maxLength: 255,
    },
    {
      ...DefaultAttribute,
      code: 'userName',
      name: 'User Name',
      type: 'Text',
      column: 'user_name',
      maxLength: 128,
      primary: true,
      optional: false,
    },
  ],
  access: [
    {
      ...DefaultReadOnlyAccess,
      roleCode: 'admin',
    },
    {
      ...DefaultReadOnlyAccess,
      roleCode: 'all_users',
    },
  ],
};
