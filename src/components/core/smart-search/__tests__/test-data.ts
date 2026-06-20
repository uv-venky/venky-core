import type { Roles } from '@/lib/common/ds/types/core/Roles';
import type { Column, SelectColumn } from '@/components/core/smart-search/types';
import type { TF, YN } from '@/lib/core/common/ds/types/YN';

export type TestRoles = Roles & {
  seqNo: number;
  ynFlag: YN;
  tfFlag: TF;
  boolFlag: boolean;
};

type TestSelectOption = {
  label: string;
  code: string;
};

export const columns: Column<TestRoles>[] = [
  {
    key: 'createdAt',
    label: 'Created At',
    type: 'Date',
    defaultOperator: 'on',
    showTime: true,
  },
  {
    key: 'createdBy',
    label: 'Created By',
    type: 'Text',
    defaultOperator: 'is',
  },
  {
    key: 'description',
    label: 'Description',
    type: 'Select',
    defaultOperator: 'is',
    options: [
      { label: 'Option 1', code: 'option1' },
      { label: 'Option 2', code: 'option2' },
    ],
    getOptionLabel: (option) => option.label,
    getOptionValue: (option) => option.code,
  } satisfies SelectColumn<TestRoles, TestSelectOption>,
  {
    key: 'endDate',
    label: 'End Date',
    type: 'Date',
    defaultOperator: 'on',
  },
  {
    key: 'roleCode',
    label: 'Role Code',
    type: 'Text',
    defaultOperator: 'is',
  },
  {
    key: 'roleName',
    label: 'Role Name',
    type: 'Text',
    defaultOperator: 'is',
  },
  {
    key: 'startDate',
    label: 'Start Date',
    type: 'Date',
    defaultOperator: 'on',
  },
  {
    key: 'updatedAt',
    label: 'Updated At',
    type: 'Date',
    defaultOperator: 'on',
    showTime: true,
  },
  {
    key: 'updatedBy',
    label: 'Updated By',
    type: 'Text',
    defaultOperator: 'is',
  },
  {
    key: 'seqNo',
    label: 'Seq No',
    type: 'Number',
    defaultOperator: 'eq',
  },
  {
    key: 'ynFlag',
    label: 'YN Flag',
    type: 'YN',
    defaultOperator: 'is',
  },
  {
    key: 'tfFlag',
    label: 'TF Flag',
    type: 'TF',
    defaultOperator: 'is',
  },
  {
    key: 'boolFlag',
    label: 'Bool Flag',
    type: 'Boolean',
    defaultOperator: 'istrue',
  },
];
