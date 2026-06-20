/* Copyright (c) 2024-present Venky Corp. */

import type { DataSource, ISODateString } from '@/lib/core/common/ds/types/DataSource';
import type { DBRow } from '@/lib/core/common/ds/types/filter';
import type { TF, YN } from '@/lib/core/common/ds/types/YN';
import { DefaultAttribute, DefaultDataSource, DefaultFullAccess } from '@/lib/server/ds/defs/defaults';

export interface TestDataSourceType {
  createdAt: ISODateString;
  createdBy: string;
  description?: string | null;
  endDate?: ISODateString | null;
  roleCode: string;
  roleName: string;
  startDate: ISODateString;
  updatedAt: ISODateString;
  updatedBy: string;
  seqNo: number;
  calcField: number;
  isActive: boolean;
  ynFlag: YN;
  tfFlag: TF;
}

export function getTestRow(id: number): DBRow<TestDataSourceType> {
  return {
    createdAt: '2021-01-01T00:00:00.000Z',
    createdBy: 'test',
    description: 'test',
    endDate: '2021-01-01T00:00:00.000Z',
    roleCode: `test${id}`,
    roleName: `test ${id}`,
    startDate: '2021-01-01T00:00:00.000Z',
    updatedAt: '2021-01-01T00:00:00.000Z',
    updatedBy: 'test',
    seqNo: id,
    calcField: id * 2,
    isActive: true,
    ynFlag: 'Y',
    tfFlag: 'T',
    _status: 'Q',
  };
}

export const TestDS: DataSource<TestDataSourceType> = {
  ...DefaultDataSource,
  id: 'TestDataSourceType',
  tableName: 'test_data_source_table',
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
      code: 'endDate',
      name: 'End Date',
      type: 'Date',
      column: 'end_date',
      maxLength: 255,
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
      code: 'seqNo',
      name: 'Seq No',
      type: 'Number',
      column: 'seq_no',
    },
    {
      ...DefaultAttribute,
      code: 'calcField',
      name: 'Calc Field',
      type: 'Number',
      column: 'x.seq_no * 2',
      calculated: true,
    },
    {
      ...DefaultAttribute,
      code: 'isActive',
      name: 'Is Active',
      type: 'Boolean',
      column: 'is_active',
    },
    {
      ...DefaultAttribute,
      code: 'ynFlag',
      name: 'YN Flag',
      type: 'YN',
      column: 'yn_flag',
    },
    {
      ...DefaultAttribute,
      code: 'tfFlag',
      name: 'TF Flag',
      type: 'TF',
      column: 'tf_flag',
    },
  ],
  access: [
    {
      ...DefaultFullAccess,
      roleCode: 'admin',
    },
  ],
};

const SELECT_CLAUSE = `x."created_at" "createdAt", x."created_by" "createdBy", x."description" "description", x."end_date" "endDate", x."role_code" "roleCode", x."role_name" "roleName", x."start_date" "startDate", x."updated_at" "updatedAt", x."updated_by" "updatedBy", x."seq_no" "seqNo", x.seq_no * 2 "calcField", x."is_active" "isActive", x."yn_flag" "ynFlag", x."tf_flag" "tfFlag"`;
const TABLE_NAME = '"test_data_source_table"';
export const BASE_QUERY = `SELECT ${SELECT_CLAUSE} FROM ${TABLE_NAME} AS x`;
