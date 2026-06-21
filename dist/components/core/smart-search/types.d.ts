import type { StringKeyof } from '../../../lib/core/common/ds/types/filter';
import type { BOOLEAN_OPS_KEY_TYPE, DATE_OPS_KEY_TYPE, NUMBER_OPS_KEY_TYPE, SELECT_OPS_KEY_TYPE, STRING_OPS_KEY_TYPE, YN_TF_OPS_KEY_TYPE } from '../../../components/core/smart-search/operators';
interface BaseColumn<T extends object> {
    label: string;
    key: StringKeyof<T>;
}
interface TextColumn<T extends object> extends BaseColumn<T> {
    type: 'Text';
    defaultOperator?: STRING_OPS_KEY_TYPE;
}
interface TextArrayColumn<T extends object, O extends object> extends BaseColumn<T> {
    type: 'TextArray';
    options: readonly O[];
    getOptionLabel: (option: Readonly<O>) => string;
    getOptionValue: (option: Readonly<O>) => string;
    defaultOperator?: STRING_OPS_KEY_TYPE;
}
interface NumberColumn<T extends object> extends BaseColumn<T> {
    type: 'Number';
    allowDecimal?: boolean;
    allowNegative?: boolean;
    defaultOperator?: NUMBER_OPS_KEY_TYPE;
}
interface DateColumn<T extends object> extends BaseColumn<T> {
    type: 'Date';
    showTime?: boolean;
    format?: string;
    defaultOperator?: DATE_OPS_KEY_TYPE;
}
interface BooleanColumn<T extends object> extends BaseColumn<T> {
    type: 'Boolean';
    trueLabel?: string;
    falseLabel?: string;
    defaultOperator?: BOOLEAN_OPS_KEY_TYPE;
}
interface YNColumn<T extends object> extends BaseColumn<T> {
    type: 'YN';
    yLabel?: string;
    nLabel?: string;
    defaultOperator?: YN_TF_OPS_KEY_TYPE;
}
interface TFColumn<T extends object> extends BaseColumn<T> {
    type: 'TF';
    tLabel?: string;
    fLabel?: string;
    defaultOperator?: YN_TF_OPS_KEY_TYPE;
}
export interface SelectOptionsColumn<T extends object, O extends object> extends BaseColumn<T> {
    type: 'Select';
    options: readonly O[];
    getOptionLabel: (option: Readonly<O>) => string;
    getOptionValue: (option: Readonly<O>) => string;
    defaultOperator?: SELECT_OPS_KEY_TYPE;
    /** When true, options will be displayed in their original order instead of being sorted by label */
    disableSortByLabel?: boolean;
}
export interface SelectLookupColumn<T extends object> extends BaseColumn<T> {
    type: 'Select';
    lookupType: string;
    defaultOperator?: SELECT_OPS_KEY_TYPE;
}
export type SelectColumn<T extends object, O extends object> = SelectOptionsColumn<T, O> | SelectLookupColumn<T>;
export declare function isSelectLookupColumn(column: SelectColumn<any, any>): column is SelectLookupColumn<any>;
export declare function isSelectOptionsColumn(column: SelectColumn<any, any>): column is SelectOptionsColumn<any, any>;
export type Column<T extends object, O extends object = any> = TextColumn<T> | TextArrayColumn<T, O> | NumberColumn<T> | DateColumn<T> | BooleanColumn<T> | YNColumn<T> | TFColumn<T> | SelectColumn<T, O>;
export type SavedSearchAction = 'saved-search-activated' | 'saved-search-deactivated' | 'search-click' | 'default-saved-search' | 'search-blur' | 'clear-filters' | 'natural-language-search';
export {};
//# sourceMappingURL=types.d.ts.map