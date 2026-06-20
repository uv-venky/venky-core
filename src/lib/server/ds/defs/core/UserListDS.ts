/* Copyright (c) 2024-present Venky Corp. */

import type { DataSource } from '@/lib/core/common/ds/types/DataSource';
import {
  DefaultAttribute,
  DefaultCalculatedAttribute,
  DefaultDataSource,
  DefaultFullAccess,
  DefaultReadOnlyAccess,
} from '@/lib/server/ds/defs/defaults';
import type { UserList } from '@/lib/common/ds/types/core/UserList';
import { getPrefix } from '@/lib/server/constants';
const PREFIX = getPrefix();

export const UserListDS: DataSource<UserList> = {
  ...DefaultDataSource,
  id: 'UserList',
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
      excludeTime: true,
    },
    {
      ...DefaultAttribute,
      code: 'email',
      name: 'Email',
      type: 'Text',
      column: 'email',
      maxLength: 128,
      optional: false,
      excludeTime: true,
    },
    {
      ...DefaultAttribute,
      code: 'endDate',
      name: 'End Date',
      type: 'Date',
      column: 'end_date',
    },
    {
      ...DefaultAttribute,
      code: 'locationName',
      name: 'Location Name',
      type: 'Text',
      column: 'location_name',
      maxLength: 128,
      excludeTime: true,
    },
    {
      ...DefaultAttribute,
      code: 'picture',
      name: 'Picture',
      type: 'Text',
      column: 'picture',
      excludeTime: true,
    },
    {
      ...DefaultAttribute,
      code: 'startDate',
      name: 'Start Date',
      type: 'Date',
      column: 'start_date',
      optional: false,
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
      excludeTime: true,
    },
    {
      ...DefaultCalculatedAttribute,
      code: 'roleCode',
      name: 'Role Code',
      type: 'Text',
      select: false,
      query: false,
    },
  ],
  access: [
    {
      ...DefaultReadOnlyAccess,
      roleCode: 'all_users',
    },
    {
      ...DefaultFullAccess,
      roleCode: 'USER_ADMIN',
    },
  ],
  preQuery: async ({ query }) => {
    if (query.match?.roleCode) {
      query.whereClause = `x.user_name NOT IN (SELECT user_name FROM ${PREFIX}user_roles WHERE role_code = $1)`;
      query.whereClauseParamList = [query.match.roleCode];
    }
    return query;
  },
};
