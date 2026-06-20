import { isEmptyObject, keys } from '@/lib/core/common/isEmpty';
import type { TreeData } from '@/lib/core/common/types/Store';
import type { BooleanFilter } from '@/lib/core/common/ds/types/BooleanFilter';
import type { DateFilter } from '@/lib/core/common/ds/types/DateFilter';
import type { MultiDateFilter } from '@/lib/core/common/ds/types/MultiDateFilter';
import type { MultiNumberFilter } from '@/lib/core/common/ds/types/MultiNumberFilter';
import type { MultiStringFilter } from '@/lib/core/common/ds/types/MultiStringFilter';
import type { NumberFilter } from '@/lib/core/common/ds/types/NumberFilter';
import type { StringFilter } from '@/lib/core/common/ds/types/StringFilter';
import type { UUIDFilter } from '@/lib/core/common/ds/types/UUIDFilter';
import type { MultiUUIDFilter } from '@/lib/core/common/ds/types/MultiUUIDFilter';
import type { TFFilter, YNFilter } from '@/lib/core/common/ds/types/YNFilter';

export type StringKeyof<T> = Extract<keyof T, string>;

export type SchemaMemberValue<T> = { [P in StringKeyof<T>]?: T[P] };

export type SchemaMember<T, V> = { [P in StringKeyof<T>]?: V };

export type NewRow<T extends object> = Partial<T> & {
  _ca?: StringKeyof<T>;
  _cid?: string;
  _id?: string;
  _orig?: Partial<T>;
  _newKeys?: StringKeyof<T>[];
  _ov?: unknown;
  _status?: 'N' | 'I';
  _chunkIndex?: number;
  _$select?: string[];
};

export type DBRow<T extends object> = T & {
  _ca?: StringKeyof<T>;
  _changedAttributes?: Partial<T>;
  _cid?: string;
  _id?: string;
  _orig?: Partial<T>;
  _newKeys?: StringKeyof<T>[];
  _ov?: unknown;
  _status: 'Q' | 'U' | 'D' | 'V' | 'E';
  _chunkIndex?: number;
  _$select?: string[];
};

export type Row<T extends object> = NewRow<T> | DBRow<T>;

export type Combiner = 'allof' | 'anyof' | 'noneof';

export type Filters<T> = Array<FilterEntry<T>>;

export type NestedFilter<T> = {
  [name in Combiner]?: Filters<T>;
};

export type StringFilterField<T> = Partial<Record<StringKeyof<T>, StringFilter>>;

export type DateFilterField<T> = Partial<Record<StringKeyof<T>, DateFilter>>;

export type MultiDateFilterField<T> = Partial<Record<StringKeyof<T>, MultiDateFilter>>;

export type MultiStringFilterField<T> = Partial<Record<StringKeyof<T>, MultiStringFilter>>;

export type NumberFilterField<T> = Partial<Record<StringKeyof<T>, NumberFilter>>;

export type MultiNumberFilterField<T> = Partial<Record<StringKeyof<T>, MultiNumberFilter>>;

export type BooleanFilterField<T> = Partial<Record<StringKeyof<T>, BooleanFilter>>;

export type YNFilterField<T> = Partial<Record<StringKeyof<T>, YNFilter>>;

export type TFFilterField<T> = Partial<Record<StringKeyof<T>, TFFilter>>;

export type UUIDFilterField<T> = Partial<Record<StringKeyof<T>, UUIDFilter>>;

export type MultiUUIDFilterField<T> = Partial<Record<StringKeyof<T>, MultiUUIDFilter>>;

export type SingleFilter<T> =
  | StringFilterField<T>
  | DateFilterField<T>
  | MultiDateFilterField<T>
  | MultiStringFilterField<T>
  | NumberFilterField<T>
  | MultiNumberFilterField<T>
  | BooleanFilterField<T>
  | YNFilterField<T>
  | TFFilterField<T>
  | UUIDFilterField<T>
  | MultiUUIDFilterField<T>;

export type FilterEntry<T> = SingleFilter<T> | NestedFilter<T>;

export function isSingleFilter<T>(value: FilterEntry<T>): value is SingleFilter<T> {
  const v = value as NestedFilter<T>;
  return !(v.allof || v.anyof || v.noneof);
}

export function isNestedFilter<T>(value: FilterEntry<T>): value is NestedFilter<T> {
  const v = value as NestedFilter<T>;
  return !!v.allof || !!v.anyof || !!v.noneof;
}

export const COMBINERS: Combiner[] = ['allof', 'anyof', 'noneof'];

export function isCombiner<T>(value: StringKeyof<T>): value is StringKeyof<T> {
  return COMBINERS.includes(value as Combiner);
}

export type AggregateFunction = 'Avg' | 'Count' | 'DistinctCount' | 'Max' | 'Min' | 'Sum';

export type Aggregate<T> = {
  func: AggregateFunction;
  code: StringKeyof<T>;
  intoCode: StringKeyof<T>;
};

export interface TreeOptions<T extends object> {
  parentAttribute: StringKeyof<T>;
  childAttribute: StringKeyof<T>;
  lazyLoad?: boolean;
}

export type Query<T extends object> = {
  aggregate?: Array<Aggregate<T>>;
  /**
   * Equality matching for queries.
   * @example { isArchived: false, status: 'Active' }
   */
  match?: SchemaMemberValue<T>;
  /**
   * @deprecated Use `match` instead
   */
  data?: SchemaMemberValue<T>;
  fetchDistinct?: boolean;
  /**
   * Filter conditions for queries.
   * @example [{ status: { in: ['Active', 'Draft'] } }]
   */
  filters?: Filters<T>;
  /**
   * @deprecated Use `filters` instead
   */
  filter?: Filters<T>;
  groupBy?: StringKeyof<T>[];
  limit?: number;
  offset?: number;
  params?: SchemaMemberValue<T>;
  projection?: SchemaMember<T, number>;
  select?: StringKeyof<T>[];
  sort?: SchemaMember<T, number>;
  countOnly?: boolean;
  fullSQL?: string;
  whereClause?: string;
  whereClauseParamList?: any[];
  subSQL?: string;
  subSQLParamList?: any[];
  orderBy?: string;
  parentRow?: T & TreeData;
  treeOptions?: TreeOptions<T>;
  fromClause?: string;
};

export type DateFilterOperators =
  | 'after'
  | 'before'
  | 'beforetime'
  | 'empty'
  | 'inthefuture'
  | 'inthepast'
  | 'last14days'
  | 'last28days'
  | 'last7days'
  | 'next14days'
  | 'next28days'
  | 'next7days'
  | 'notempty'
  | 'noton'
  | 'on'
  | 'onorafter'
  | 'onorbefore'
  | 'thismonth'
  | 'thisquarter'
  | 'thisweek'
  | 'thisyear'
  | 'today'
  | 'tomorrow'
  | 'yesterday';

const dateFilterOperators: DateFilterOperators[] = [
  'after',
  'before',
  'beforetime',
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
  'noton',
  'on',
  'onorafter',
  'onorbefore',
  'thismonth',
  'thisquarter',
  'thisweek',
  'thisyear',
  'today',
  'tomorrow',
  'yesterday',
];

const stringFilterOperators: StringFilterOperators[] = [
  'is',
  'not',
  'empty',
  'notempty',
  'nct',
  'like',
  'sw',
  'ew',
  'slt',
  'sgt',
];

const booleanFilterOperators: BooleanFilterOperators[] = ['istrue', 'empty', 'notempty'];

const ynFilterOperators: YNFilterOperators[] = ['is', 'empty', 'notempty'];

const numberFilterOperators: NumberFilterOperators[] = [
  'eq',
  'is',
  'ne',
  'not',
  'gt',
  'gte',
  'lt',
  'lte',
  'null',
  'notnull',
];

const multiStringFilterOperators: MultiStringFilterOperators[] = ['hasall', 'hasany', 'notany', 'in', 'nin'];

const textArrayFilterOperators: TextArrayFilterOperators[] = ['hasall', 'hasany', 'notany', 'empty', 'notempty'];

const multiNumberFilterOperators: MultiNumberFilterOperators[] = ['bn', 'in', 'nin'];

const multiDateFilterOperators: MultiDateFilterOperators[] = ['bn'];

const uuidFilterOperators: UUIDFilterOperators[] = ['is', 'not', 'empty', 'notempty', 'isafter', 'isbefore'];

const multiUUIDFilterOperators: MultiUUIDFilterOperators[] = ['in', 'nin'];

export function isDateFilterOperator(value: string): value is DateFilterOperators {
  return dateFilterOperators.includes(value as DateFilterOperators);
}

export function isStringFilterOperator(value: string): value is StringFilterOperators {
  return stringFilterOperators.includes(value as StringFilterOperators);
}

export function isBooleanFilterOperator(value: string): value is BooleanFilterOperators {
  return booleanFilterOperators.includes(value as BooleanFilterOperators);
}

export function isYNFilterOperator(value: string): value is YNFilterOperators {
  return ynFilterOperators.includes(value as YNFilterOperators);
}

export function isTFFilterOperator(value: string): value is TFFilterOperators {
  return ynFilterOperators.includes(value as TFFilterOperators);
}

export function isNumberFilterOperator(value: string): value is NumberFilterOperators {
  return numberFilterOperators.includes(value as NumberFilterOperators);
}

export function isMultiStringFilterOperator(value: string): value is MultiStringFilterOperators {
  return multiStringFilterOperators.includes(value as MultiStringFilterOperators);
}

export function isTextArrayFilterOperator(value: string): value is TextArrayFilterOperators {
  return textArrayFilterOperators.includes(value as TextArrayFilterOperators);
}

export function isMultiNumberFilterOperator(value: string): value is MultiNumberFilterOperators {
  return multiNumberFilterOperators.includes(value as MultiNumberFilterOperators);
}

export function isMultiDateFilterOperator(value: string): value is MultiDateFilterOperators {
  return multiDateFilterOperators.includes(value as MultiDateFilterOperators);
}

export function isUUIDFilterOperator(value: string): value is UUIDFilterOperators {
  return uuidFilterOperators.includes(value as UUIDFilterOperators);
}

export function isMultiUUIDFilterOperator(value: string): value is MultiUUIDFilterOperators {
  return multiUUIDFilterOperators.includes(value as MultiUUIDFilterOperators);
}

export type MultiStringFilterOperators = 'hasall' | 'hasany' | 'notany' | 'in' | 'nin';

export type UUIDFilterOperators = 'is' | 'not' | 'empty' | 'notempty' | 'isafter' | 'isbefore';
export type MultiUUIDFilterOperators = 'in' | 'nin';

export type TextArrayFilterOperators = 'hasall' | 'hasany' | 'notany' | 'empty' | 'notempty';

export type StringFilterOperators = 'is' | 'not' | 'empty' | 'notempty' | 'nct' | 'like' | 'sw' | 'ew' | 'slt' | 'sgt';

export type BooleanFilterOperators = 'istrue' | 'empty' | 'notempty';

export type YNFilterOperators = 'is' | 'empty' | 'notempty';

export type TFFilterOperators = YNFilterOperators;

export type NumberFilterOperators = 'eq' | 'is' | 'ne' | 'not' | 'gt' | 'gte' | 'lt' | 'lte' | 'null' | 'notnull';

export type MultiNumberFilterOperators = 'bn' | 'in' | 'nin';
export type MultiDateFilterOperators = 'bn';

export type AllOperators =
  | DateFilterOperators
  | MultiStringFilterOperators
  | StringFilterOperators
  | BooleanFilterOperators
  | NumberFilterOperators
  | MultiNumberFilterOperators
  | MultiDateFilterOperators
  | UUIDFilterOperators
  | MultiUUIDFilterOperators
  | YNFilterOperators
  | TFFilterOperators
  | TextArrayFilterOperators;

export function splitFilter<T>(f?: FilterEntry<T> | null): {
  attributeCode: StringKeyof<T>;
  operator: AllOperators;
  value: any;
  ignoreCase?: boolean;
} {
  if (!f || isEmptyObject(f))
    return {
      attributeCode: '' as StringKeyof<T>,
      operator: '' as AllOperators,
      value: '',
    };
  const attributeCode = keys(f)[0];
  const filter = f[attributeCode];
  // @ts-expect-error ignoreCase is optional
  const { ignoreCase, ...rest } = filter;
  const operator = keys(rest)[0] as AllOperators;
  // @ts-expect-error operator is a valid key
  const value = rest[operator];
  return {
    attributeCode,
    operator,
    value,
    ignoreCase,
  };
}
