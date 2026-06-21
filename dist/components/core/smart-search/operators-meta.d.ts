import type { ColumnType } from '../../../components/core/common/types';
declare const BOOLEAN_OPS: {
    istrue: string;
    empty: string;
    notempty: string;
};
declare const YN_TF_OPS: {
    is: string;
    empty: string;
    notempty: string;
};
declare const STRING_OPS: {
    is: string;
    not: string;
    empty: string;
    notempty: string;
    nct: string;
    like: string;
    sw: string;
    ew: string;
};
declare const MULTIPLE_STRING_OPS: {
    hasall: string;
    hasany: string;
    notany: string;
    in: string;
    nin: string;
};
export declare const CASE_SENSITIVE_OPS: string[];
declare const NUMBER_OPS: {
    eq: string;
    ne: string;
    null: string;
    notnull: string;
    gt: string;
    gte: string;
    lt: string;
    lte: string;
};
declare const MULTIPLE_NUMBER_OPS: {
    bn: string;
    in: string;
    nin: string;
};
declare const DATE_OPS: {
    after: string;
    before: string;
    empty: string;
    inthefuture: string;
    inthepast: string;
    last14days: string;
    last28days: string;
    last7days: string;
    next14days: string;
    next28days: string;
    next7days: string;
    notempty: string;
    noton: string;
    on: string;
    onorafter: string;
    onorbefore: string;
    thismonth: string;
    thisquarter: string;
    thisweek: string;
    thisyear: string;
    today: string;
    tomorrow: string;
    yesterday: string;
};
declare const MULTIPLE_DATE_OPS: {
    bn: string;
};
declare const SELECT_OPS: {
    is: string;
    not: string;
    empty: string;
    notempty: string;
};
declare const MULTIPLE_SELECT_OPS: {
    in: string;
    nin: string;
};
declare const TEXT_ARRAY_OPS: {
    hasall: string;
    hasany: string;
    notany: string;
    empty: string;
    notempty: string;
};
type BOOLEAN_OPS_KEY_TYPE = keyof typeof BOOLEAN_OPS;
type DATE_OPS_KEY_TYPE = keyof typeof DATE_OPS | keyof typeof MULTIPLE_DATE_OPS;
type NUMBER_OPS_KEY_TYPE = keyof typeof NUMBER_OPS | keyof typeof MULTIPLE_NUMBER_OPS;
type SELECT_OPS_KEY_TYPE = keyof typeof SELECT_OPS | keyof typeof MULTIPLE_SELECT_OPS;
type STRING_OPS_KEY_TYPE = keyof typeof STRING_OPS | keyof typeof MULTIPLE_STRING_OPS;
type YN_TF_OPS_KEY_TYPE = keyof typeof YN_TF_OPS;
type TEXT_ARRAY_OPS_KEY_TYPE = keyof typeof TEXT_ARRAY_OPS;
type OPS_KEY_TYPE = BOOLEAN_OPS_KEY_TYPE | DATE_OPS_KEY_TYPE | NUMBER_OPS_KEY_TYPE | SELECT_OPS_KEY_TYPE | STRING_OPS_KEY_TYPE | YN_TF_OPS_KEY_TYPE | TEXT_ARRAY_OPS_KEY_TYPE;
interface Option {
    label: string;
    value: string;
}
declare const isMultiOperator: (op: string) => boolean;
declare function getOptionsForType(type: ColumnType): Option[];
declare function getDefaultOperatorForType(type: ColumnType): "is" | "hasany" | "on" | "eq";
declare function getDefaultValue(type: ColumnType, nonEmpty?: boolean): string | true | 0 | never[] | undefined;
declare function hasEditor(operator: string): boolean;
export type { BOOLEAN_OPS_KEY_TYPE, DATE_OPS_KEY_TYPE, NUMBER_OPS_KEY_TYPE, Option, OPS_KEY_TYPE, SELECT_OPS_KEY_TYPE, STRING_OPS_KEY_TYPE, TEXT_ARRAY_OPS_KEY_TYPE, YN_TF_OPS_KEY_TYPE, };
export { getDefaultOperatorForType, getDefaultValue, getOptionsForType, hasEditor, isMultiOperator };
//# sourceMappingURL=operators-meta.d.ts.map