import type { AllOperators, SingleFilter, StringKeyof } from '../../../../../lib/core/common/ds/types/filter';
import type { AttributeType } from '../../../../../lib/core/common/ds/types/AttributeType';
import type { Attribute } from '../../../../../lib/core/common/ds/types/Attribute';
import type { DataSource } from '../../../../../lib/core/common/ds/types/DataSource';
export declare function isNumberType(dataType: AttributeType): dataType is 'Number';
export declare function isStringType(dataType: AttributeType): dataType is 'Text' | 'TextArray';
export declare function isDateType(dataType: AttributeType): dataType is 'Date';
export declare function isJSONType(dataType: AttributeType): dataType is 'JSON';
export declare function isBooleanType(dataType: AttributeType): dataType is 'Boolean';
export declare function isYNType(dataType: AttributeType): dataType is 'YN';
export declare function isTFType(dataType: AttributeType): dataType is 'TF';
export declare function isPolygonType(dataType: AttributeType): dataType is 'Polygon';
export type UnwrappedFilter<T extends object, Op extends AllOperators, V extends string | number | string[] | number[] | boolean> = {
    key: StringKeyof<T>;
    op: Op;
    value: V;
    attribute: Attribute<T>;
    ignoreCase?: boolean;
    /** When set, filter is for a key inside a JSON attribute (e.g. "attributes.key"). */
    jsonKey?: string;
};
export declare function unwrapFilter<T extends object, Op extends AllOperators, V extends string | number | string[] | number[] | boolean>(dataSource: DataSource<T>, filter: SingleFilter<T>): UnwrappedFilter<T, Op, V>;
//# sourceMappingURL=attribute-utils.d.ts.map