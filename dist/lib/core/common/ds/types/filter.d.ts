import type { TreeData } from '../../../../../lib/core/common/types/Store';
import type { BooleanFilter } from '../../../../../lib/core/common/ds/types/BooleanFilter';
import type { DateFilter } from '../../../../../lib/core/common/ds/types/DateFilter';
import type { MultiDateFilter } from '../../../../../lib/core/common/ds/types/MultiDateFilter';
import type { MultiNumberFilter } from '../../../../../lib/core/common/ds/types/MultiNumberFilter';
import type { MultiStringFilter } from '../../../../../lib/core/common/ds/types/MultiStringFilter';
import type { NumberFilter } from '../../../../../lib/core/common/ds/types/NumberFilter';
import type { StringFilter } from '../../../../../lib/core/common/ds/types/StringFilter';
import type { UUIDFilter } from '../../../../../lib/core/common/ds/types/UUIDFilter';
import type { MultiUUIDFilter } from '../../../../../lib/core/common/ds/types/MultiUUIDFilter';
import type { TFFilter, YNFilter } from '../../../../../lib/core/common/ds/types/YNFilter';
export type StringKeyof<T> = Extract<keyof T, string>;
export type SchemaMemberValue<T> = {
    [P in StringKeyof<T>]?: T[P];
};
export type SchemaMember<T, V> = {
    [P in StringKeyof<T>]?: V;
};
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
export type SingleFilter<T> = StringFilterField<T> | DateFilterField<T> | MultiDateFilterField<T> | MultiStringFilterField<T> | NumberFilterField<T> | MultiNumberFilterField<T> | BooleanFilterField<T> | YNFilterField<T> | TFFilterField<T> | UUIDFilterField<T> | MultiUUIDFilterField<T>;
export type FilterEntry<T> = SingleFilter<T> | NestedFilter<T>;
export declare function isSingleFilter<T>(value: FilterEntry<T>): value is SingleFilter<T>;
export declare function isNestedFilter<T>(value: FilterEntry<T>): value is NestedFilter<T>;
export declare const COMBINERS: Combiner[];
export declare function isCombiner<T>(value: StringKeyof<T>): value is StringKeyof<T>;
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
export type DateFilterOperators = 'after' | 'before' | 'beforetime' | 'empty' | 'inthefuture' | 'inthepast' | 'last14days' | 'last28days' | 'last7days' | 'next14days' | 'next28days' | 'next7days' | 'notempty' | 'noton' | 'on' | 'onorafter' | 'onorbefore' | 'thismonth' | 'thisquarter' | 'thisweek' | 'thisyear' | 'today' | 'tomorrow' | 'yesterday';
export declare function isDateFilterOperator(value: string): value is DateFilterOperators;
export declare function isStringFilterOperator(value: string): value is StringFilterOperators;
export declare function isBooleanFilterOperator(value: string): value is BooleanFilterOperators;
export declare function isYNFilterOperator(value: string): value is YNFilterOperators;
export declare function isTFFilterOperator(value: string): value is TFFilterOperators;
export declare function isNumberFilterOperator(value: string): value is NumberFilterOperators;
export declare function isMultiStringFilterOperator(value: string): value is MultiStringFilterOperators;
export declare function isTextArrayFilterOperator(value: string): value is TextArrayFilterOperators;
export declare function isMultiNumberFilterOperator(value: string): value is MultiNumberFilterOperators;
export declare function isMultiDateFilterOperator(value: string): value is MultiDateFilterOperators;
export declare function isUUIDFilterOperator(value: string): value is UUIDFilterOperators;
export declare function isMultiUUIDFilterOperator(value: string): value is MultiUUIDFilterOperators;
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
export type AllOperators = DateFilterOperators | MultiStringFilterOperators | StringFilterOperators | BooleanFilterOperators | NumberFilterOperators | MultiNumberFilterOperators | MultiDateFilterOperators | UUIDFilterOperators | MultiUUIDFilterOperators | YNFilterOperators | TFFilterOperators | TextArrayFilterOperators;
export declare function splitFilter<T>(f?: FilterEntry<T> | null): {
    attributeCode: StringKeyof<T>;
    operator: AllOperators;
    value: any;
    ignoreCase?: boolean;
};
//# sourceMappingURL=filter.d.ts.map