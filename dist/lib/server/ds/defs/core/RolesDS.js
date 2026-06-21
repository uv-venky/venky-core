/* Copyright (c) 2024-present Venky Corp. */
import {
  DefaultAttribute,
  DefaultCalculatedAttribute,
  DefaultDataSource,
  DefaultFullAccess,
} from '../../../../../lib/server/ds/defs/defaults';
import { getPrefix } from '../../../../../lib/server/constants';
const PREFIX = getPrefix();
import { isEmpty } from '../../../../../lib/core/common/isEmpty';
export const RolesDS = {
  ...DefaultDataSource,
  id: 'Roles',
  tableName: `${PREFIX}roles`,
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
      code: 'description',
      name: 'Description',
      type: 'Text',
      column: 'description',
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
      type: 'Text',
      column: 'role_code',
      maxLength: 128,
      primary: true,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'roleName',
      name: 'Role Name',
      type: 'Text',
      column: 'role_name',
      maxLength: 128,
      optional: false,
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
      ...DefaultCalculatedAttribute,
      code: 'userName',
      name: 'User Name',
      type: 'Text',
      query: false,
      select: false,
    },
    {
      ...DefaultAttribute,
      code: 'appId',
      name: 'App Id',
      type: 'Text',
      column: 'app_id',
      maxLength: 128,
      optional: false,
      defaultValue: 'APP_ID_OR_CORE',
    },
  ],
  access: [
    {
      ...DefaultFullAccess,
      roleCode: 'admin',
    },
  ],
  preQuery: async ({ query }) => {
    const params = query.whereClauseParamList ?? [];
    //const activeClause = 'x.start_date <= now() AND (x.end_date IS NULL OR x.end_date >= now())';
    query.whereClause = isEmpty(query.whereClause) ? `` : `(${query.whereClause})`;
    if (query.match?.userName) {
      const clause = `x.role_code NOT IN (SELECT role_code FROM ${PREFIX}user_roles WHERE user_name = $${params.length + 1})`;
      query.whereClause = isEmpty(query.whereClause) ? clause : `(${query.whereClause}) AND (${clause})`;
      params.push(query.match.userName);
    }
    query.whereClauseParamList = params;
    return query;
  },
};
//# sourceMappingURL=RolesDS.js.map
