/* Copyright (c) 2024-present Venky Corp. */

/**
 * Pure operator metadata for SmartSearch — operator maps, per-type option
 * lists, and the type-aware default/validity helpers. Intentionally free of
 * `lucide-react` (and any other client-only) imports so it can be consumed by
 * server-side code (e.g. the natural-language filter parser/validator) without
 * tripping the server-routes boundary check. Icon mappings and the
 * column-aware `getDefaultOperator` live in `./operators`.
 */

import { keys } from '@/lib/core/common/isEmpty';
import type { ColumnType } from '@/components/core/common/types';

const BOOLEAN_OPS = {
  istrue: 'is',
  empty: 'is empty',
  notempty: 'is not empty',
};

const YN_TF_OPS = {
  is: 'is',
  empty: 'is empty',
  notempty: 'is not empty',
};

const STRING_OPS = {
  is: 'is',
  not: 'is not',
  empty: 'is empty',
  notempty: 'is not empty',
  nct: 'does not contain',
  like: 'contains',
  sw: 'starts with',
  ew: 'ends with',
};

const MULTIPLE_STRING_OPS = {
  hasall: 'has all the words',
  hasany: 'has any of the words',
  notany: 'does not have any of the words',
  in: 'is in',
  nin: 'is not in',
};

export const CASE_SENSITIVE_OPS = ['like', 'sw', 'ew', 'nct', 'is', 'not', 'hasall', 'hasany', 'notany', 'in', 'nin'];

const NUMBER_OPS = {
  eq: 'equals',
  ne: 'not equals',
  null: 'is empty',
  notnull: 'is not empty',
  gt: 'greater than',
  gte: 'greater than or equal to',
  lt: 'less than',
  lte: 'less than or equal to',
};

const MULTIPLE_NUMBER_OPS = {
  bn: 'is between',
  in: 'is in',
  nin: 'is not in',
};

const DATE_OPS = {
  after: 'is after',
  before: 'is before',
  empty: 'is empty',
  inthefuture: 'is in the future',
  inthepast: 'is in the past',
  last14days: 'since last 14 days',
  last28days: 'since last 28 days',
  last7days: 'since last 7 days',
  next14days: 'in the next 14 days',
  next28days: 'in the next 28 days',
  next7days: 'in the next 7 days',
  notempty: 'is not empty',
  noton: 'is not on',
  on: 'is on',
  onorafter: 'is on or after',
  onorbefore: 'is on or before',
  thismonth: 'is this month',
  thisquarter: 'is this quarter',
  thisweek: 'is this week',
  thisyear: 'is this year',
  today: 'is today',
  tomorrow: 'is tomorrow',
  yesterday: 'is yesterday',
};

const MULTIPLE_DATE_OPS = {
  bn: 'is between',
};

const SELECT_OPS = {
  is: 'is',
  not: 'is not',
  empty: 'is empty',
  notempty: 'is not empty',
};

const MULTIPLE_SELECT_OPS = {
  in: 'is in',
  nin: 'is not in',
};

const TEXT_ARRAY_OPS = {
  hasall: 'has all of',
  hasany: 'has any of',
  notany: 'has none of',
  empty: 'is empty',
  notempty: 'is not empty',
};

type BOOLEAN_OPS_KEY_TYPE = keyof typeof BOOLEAN_OPS;
type DATE_OPS_KEY_TYPE = keyof typeof DATE_OPS | keyof typeof MULTIPLE_DATE_OPS;
type NUMBER_OPS_KEY_TYPE = keyof typeof NUMBER_OPS | keyof typeof MULTIPLE_NUMBER_OPS;
type SELECT_OPS_KEY_TYPE = keyof typeof SELECT_OPS | keyof typeof MULTIPLE_SELECT_OPS;
type STRING_OPS_KEY_TYPE = keyof typeof STRING_OPS | keyof typeof MULTIPLE_STRING_OPS;
type YN_TF_OPS_KEY_TYPE = keyof typeof YN_TF_OPS;
type TEXT_ARRAY_OPS_KEY_TYPE = keyof typeof TEXT_ARRAY_OPS;

type OPS_KEY_TYPE =
  | BOOLEAN_OPS_KEY_TYPE
  | DATE_OPS_KEY_TYPE
  | NUMBER_OPS_KEY_TYPE
  | SELECT_OPS_KEY_TYPE
  | STRING_OPS_KEY_TYPE
  | YN_TF_OPS_KEY_TYPE
  | TEXT_ARRAY_OPS_KEY_TYPE;

interface Option {
  label: string;
  value: string;
}

const isMultiOperator = (op: string) => {
  return op in MULTIPLE_STRING_OPS || op in MULTIPLE_NUMBER_OPS || op in MULTIPLE_DATE_OPS || op in MULTIPLE_SELECT_OPS;
};

const BOOLEAN_OPTIONS = keys(BOOLEAN_OPS).reduce((acc, key) => {
  acc.push({ label: BOOLEAN_OPS[key], value: key });
  return acc;
}, [] as Option[]);

const YN_TF_OPTIONS = keys(YN_TF_OPS).reduce((acc, key) => {
  acc.push({ label: YN_TF_OPS[key], value: key });
  return acc;
}, [] as Option[]);

const STRING_OPTIONS: Option[] = [];

keys(STRING_OPS).reduce((acc, key) => {
  acc.push({ label: STRING_OPS[key], value: key });
  return acc;
}, STRING_OPTIONS);

keys(MULTIPLE_STRING_OPS).reduce((acc, key) => {
  acc.push({ label: MULTIPLE_STRING_OPS[key], value: key });
  return acc;
}, STRING_OPTIONS);

const NUMBER_OPTIONS: Option[] = [];

keys(NUMBER_OPS).reduce((acc, key) => {
  acc.push({ label: NUMBER_OPS[key], value: key });
  return acc;
}, NUMBER_OPTIONS);

keys(MULTIPLE_NUMBER_OPS).reduce((acc, key) => {
  acc.push({ label: MULTIPLE_NUMBER_OPS[key], value: key });
  return acc;
}, NUMBER_OPTIONS);

const DATE_OPTIONS: Option[] = [];

keys(DATE_OPS).reduce((acc, key) => {
  acc.push({ label: DATE_OPS[key], value: key });
  return acc;
}, DATE_OPTIONS);

keys(MULTIPLE_DATE_OPS).reduce((acc, key) => {
  acc.push({ label: MULTIPLE_DATE_OPS[key], value: key });
  return acc;
}, DATE_OPTIONS);

const SELECT_OPTIONS: Option[] = [];

keys(SELECT_OPS).reduce((acc, key) => {
  acc.push({ label: SELECT_OPS[key], value: key });
  return acc;
}, SELECT_OPTIONS);

keys(MULTIPLE_SELECT_OPS).reduce((acc, key) => {
  acc.push({ label: MULTIPLE_SELECT_OPS[key], value: key });
  return acc;
}, SELECT_OPTIONS);

const TEXT_ARRAY_OPTIONS: Option[] = [];

keys(TEXT_ARRAY_OPS).reduce((acc, key) => {
  acc.push({ label: TEXT_ARRAY_OPS[key], value: key });
  return acc;
}, TEXT_ARRAY_OPTIONS);

DATE_OPTIONS.sort((a, b) => a.label.localeCompare(b.label));
NUMBER_OPTIONS.sort((a, b) => a.label.localeCompare(b.label));
STRING_OPTIONS.sort((a, b) => a.label.localeCompare(b.label));
SELECT_OPTIONS.sort((a, b) => a.label.localeCompare(b.label));
TEXT_ARRAY_OPTIONS.sort((a, b) => a.label.localeCompare(b.label));
YN_TF_OPTIONS.sort((a, b) => a.label.localeCompare(b.label));

function getOptionsForType(type: ColumnType) {
  if ((['Select'] as ColumnType[]).includes(type)) {
    return SELECT_OPTIONS;
  }
  switch (type) {
    case 'Boolean':
      return BOOLEAN_OPTIONS;
    case 'Date':
      return DATE_OPTIONS;
    case 'Number':
      return NUMBER_OPTIONS;
    case 'YN':
    case 'TF':
      return YN_TF_OPTIONS;
    case 'TextArray':
      return TEXT_ARRAY_OPTIONS;
    default:
      return STRING_OPTIONS;
  }
}

function getDefaultOperatorForType(type: ColumnType) {
  if ((['Select'] as ColumnType[]).includes(type)) {
    return 'is';
  }
  switch (type) {
    case 'Date':
      return 'on';
    case 'Number':
      return 'eq';
    case 'TextArray':
      return 'hasany';
    default:
      return 'is';
  }
}

function getDefaultValue(type: ColumnType, nonEmpty = false) {
  switch (type) {
    case 'Boolean':
      return true;
    case 'Date': {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      return date.toISOString();
    }
    case 'Number':
      return nonEmpty ? 0 : undefined;
    case 'YN':
      return 'Y';
    case 'TF':
      return 'T';
    case 'TextArray':
      return [];
    default:
      return '';
  }
}

function hasEditor(operator: string) {
  return ![
    'empty',
    'inthefuture',
    'inthepast',
    'last14days',
    'last28days',
    'last7days',
    'next14days',
    'next28days',
    'next7days',
    'notempty',
    'notnull',
    'null',
    'thismonth',
    'thisquarter',
    'thisweek',
    'thisyear',
    'today',
    'tomorrow',
    'yesterday',
  ].includes(operator);
}

export type {
  BOOLEAN_OPS_KEY_TYPE,
  DATE_OPS_KEY_TYPE,
  NUMBER_OPS_KEY_TYPE,
  Option,
  OPS_KEY_TYPE,
  SELECT_OPS_KEY_TYPE,
  STRING_OPS_KEY_TYPE,
  TEXT_ARRAY_OPS_KEY_TYPE,
  YN_TF_OPS_KEY_TYPE,
};

export { getDefaultOperatorForType, getDefaultValue, getOptionsForType, hasEditor, isMultiOperator };
