import { isEmptyObject, keys } from '../../../../../lib/core/common/isEmpty';
export function isSingleFilter(value) {
    const v = value;
    return !(v.allof || v.anyof || v.noneof);
}
export function isNestedFilter(value) {
    const v = value;
    return !!v.allof || !!v.anyof || !!v.noneof;
}
export const COMBINERS = ['allof', 'anyof', 'noneof'];
export function isCombiner(value) {
    return COMBINERS.includes(value);
}
const dateFilterOperators = [
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
const stringFilterOperators = [
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
const booleanFilterOperators = ['istrue', 'empty', 'notempty'];
const ynFilterOperators = ['is', 'empty', 'notempty'];
const numberFilterOperators = [
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
const multiStringFilterOperators = ['hasall', 'hasany', 'notany', 'in', 'nin'];
const textArrayFilterOperators = ['hasall', 'hasany', 'notany', 'empty', 'notempty'];
const multiNumberFilterOperators = ['bn', 'in', 'nin'];
const multiDateFilterOperators = ['bn'];
const uuidFilterOperators = ['is', 'not', 'empty', 'notempty', 'isafter', 'isbefore'];
const multiUUIDFilterOperators = ['in', 'nin'];
export function isDateFilterOperator(value) {
    return dateFilterOperators.includes(value);
}
export function isStringFilterOperator(value) {
    return stringFilterOperators.includes(value);
}
export function isBooleanFilterOperator(value) {
    return booleanFilterOperators.includes(value);
}
export function isYNFilterOperator(value) {
    return ynFilterOperators.includes(value);
}
export function isTFFilterOperator(value) {
    return ynFilterOperators.includes(value);
}
export function isNumberFilterOperator(value) {
    return numberFilterOperators.includes(value);
}
export function isMultiStringFilterOperator(value) {
    return multiStringFilterOperators.includes(value);
}
export function isTextArrayFilterOperator(value) {
    return textArrayFilterOperators.includes(value);
}
export function isMultiNumberFilterOperator(value) {
    return multiNumberFilterOperators.includes(value);
}
export function isMultiDateFilterOperator(value) {
    return multiDateFilterOperators.includes(value);
}
export function isUUIDFilterOperator(value) {
    return uuidFilterOperators.includes(value);
}
export function isMultiUUIDFilterOperator(value) {
    return multiUUIDFilterOperators.includes(value);
}
export function splitFilter(f) {
    if (!f || isEmptyObject(f))
        return {
            attributeCode: '',
            operator: '',
            value: '',
        };
    const attributeCode = keys(f)[0];
    const filter = f[attributeCode];
    // @ts-expect-error ignoreCase is optional
    const { ignoreCase, ...rest } = filter;
    const operator = keys(rest)[0];
    // @ts-expect-error operator is a valid key
    const value = rest[operator];
    return {
        attributeCode,
        operator,
        value,
        ignoreCase,
    };
}
//# sourceMappingURL=filter.js.map