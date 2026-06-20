/* Copyright (c) 2024-present Venky Corp. */

import type { DataSource } from '@/lib/core/common/ds/types/DataSource';
import { DefaultAttribute, DefaultDataSource, DefaultFullAccess } from '../defaults';
import type { SavedSearch } from '@/lib/common/ds/types/core/SavedSearch';
import { getPrefix } from '@/lib/server/constants';
const PREFIX = getPrefix();
import { isEmpty } from '@/lib/core/common/isEmpty';

export const SavedSearchDataSource: DataSource<SavedSearch<any>> = {
  ...DefaultDataSource,
  id: 'SavedSearch',
  tableName: `${PREFIX}saved_search`,
  attributes: [
    {
      ...DefaultAttribute,
      code: 'createdAt',
      name: 'Created At',
      type: 'Date',
      column: 'created_at',
      maxLength: 255,
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
      maxLength: 255,
    },
    {
      ...DefaultAttribute,
      code: 'id',
      name: 'Id',
      type: 'Text',
      column: 'id',
      maxLength: 40,
      primary: true,
      defaultValue: 'ULID',
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'isDefault',
      name: 'Is Default',
      type: 'Boolean',
      column: 'is_default',
      maxLength: 255,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'isPublic',
      name: 'Is Public',
      type: 'Boolean',
      column: 'is_public',
      maxLength: 255,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'itemId',
      name: 'Item Id',
      type: 'Text',
      column: 'item_id',
      maxLength: 40,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'name',
      name: 'Name',
      type: 'Text',
      column: 'name',
      maxLength: 120,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'owner',
      name: 'Owner',
      type: 'Text',
      column: 'owner',
      maxLength: 128,
      optional: false,
      defaultValue: 'USER_NAME',
    },
    {
      ...DefaultAttribute,
      code: 'pageId',
      name: 'Page Id',
      type: 'Text',
      column: 'page_id',
      maxLength: 40,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'payload',
      name: 'Payload',
      type: 'JSON',
      column: 'payload',
      maxLength: 255,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'updatedAt',
      name: 'Updated At',
      type: 'Date',
      column: 'updated_at',
      maxLength: 255,
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
      code: 'appId',
      name: 'App Id',
      type: 'Text',
      column: 'app_id',
      maxLength: 128,
      optional: false,
      defaultValue: 'APP_ID',
    },
  ],
  access: [
    {
      ...DefaultFullAccess,
      roleCode: 'admin',
    },
    {
      ...DefaultFullAccess,
      roleCode: 'all_users',
    },
  ],
  preQuery: async ({ query, session }) => {
    const params = query.whereClauseParamList ?? [];
    const whereClause = `is_public = true OR owner = $${params.length + 1}`;
    query.whereClause = isEmpty(query.whereClause) ? whereClause : `(${query.whereClause}) AND (${whereClause})`;
    params.push(session.user.userName);
    query.whereClauseParamList = params;
    return query;
  },
};
