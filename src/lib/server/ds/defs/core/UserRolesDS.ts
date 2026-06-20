/* Copyright (c) 2024-present Venky Corp. */

import type { DataSource } from '@/lib/core/common/ds/types/DataSource';
import { DefaultAttribute, DefaultDataSource, DefaultFullAccess } from '@/lib/server/ds/defs/defaults';
import { isEmpty } from '@/lib/core/common/isEmpty';
import type { UserRoles } from '@/lib/common/ds/types/core/UserRoles';
import { getPrefix } from '@/lib/server/constants';
const PREFIX = getPrefix();
import { getConfig } from '@/lib/core/server/config';

export const UserRolesDS: DataSource<UserRoles> = {
  ...DefaultDataSource,
  id: 'UserRoles',
  tableName: `${PREFIX}user_roles`,
  joins: [
    {
      alias: 'r',
      tableName: `${PREFIX}roles`,
      joinType: 'INNER',
      on: () => `r.role_code = x.role_code AND r.app_id IN ('${getConfig('userRoles.getUserRoles').appId}', 'core')`,
    },
    {
      alias: 'u',
      tableName: `${PREFIX}users`,
      joinType: 'LEFT',
      on: 'u.user_name = x.user_name',
    },
  ],
  attributes: [
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
      code: 'endDate',
      name: 'End Date',
      type: 'Date',
      column: 'end_date',
    },
    {
      ...DefaultAttribute,
      code: 'roleCode',
      name: 'Role Code',
      type: 'Reference',
      column: 'role_code',
      maxLength: 128,
      primary: true,
      optional: false,
      ref: {
        type: 'Text',
      },
      joinAlias: 'r',
    },
    {
      ...DefaultAttribute,
      code: 'roleName',
      name: 'Role Name',
      type: 'Text',
      column: 'r.role_name',
      maxLength: 40,
      optional: true,
      joinAlias: 'r',
      calculated: true,
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
    {
      ...DefaultAttribute,
      code: 'userName',
      name: 'User Name',
      type: 'Reference',
      column: 'user_name',
      maxLength: 128,
      primary: true,
      optional: false,
      ref: {
        type: 'Text',
      },
      joinAlias: 'u',
    },
    {
      ...DefaultAttribute,
      code: 'displayName',
      name: 'Display Name',
      type: 'Text',
      column: 'u.display_name',
      maxLength: 40,
      optional: true,
      joinAlias: 'u',
      calculated: true,
    },
    {
      ...DefaultAttribute,
      code: 'email',
      name: 'Email',
      type: 'Text',
      column: 'u.email',
      maxLength: 128,
      optional: true,
      joinAlias: 'u',
      calculated: true,
    },
    {
      ...DefaultAttribute,
      code: 'appId',
      name: 'App Id',
      type: 'Text',
      column: 'app_id',
      maxLength: 128,
      optional: false,
      defaultValue: 'APP_ID',
      query: false,
    },
  ],
  access: [
    {
      ...DefaultFullAccess,
      roleCode: 'admin',
    },
    {
      ...DefaultFullAccess,
      roleCode: 'USER_ADMIN',
    },
  ],
  preQuery: async ({ query }) => {
    const params = query.whereClauseParamList ?? [];
    //const activeClause = 'x.start_date <= now() AND (x.end_date IS NULL OR x.end_date >= now())';
    query.whereClause = isEmpty(query.whereClause) ? `` : `(${query.whereClause})`;
    query.whereClauseParamList = params;
    return query;
  },
};
