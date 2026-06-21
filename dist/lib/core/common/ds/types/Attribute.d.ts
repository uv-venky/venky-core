import type { AttributeType } from '../../../../../lib/core/common/ds/types/AttributeType';
import type { StringKeyof } from '../../../../../lib/core/common/ds/types/filter';
import type { ReferenceMetadata } from '../../../../../lib/core/common/ds/types/ReferenceMetadata';
export type WHO = 'createdAt' | 'createdBy' | 'creationDate' | 'lastUpdateDate' | 'lastUpdatedBy' | 'updatedAt' | 'updatedBy';
export declare const WHOAttributes: WHO[];
export declare function isWhoAttribute<T extends object>(attr: Attribute<T>): boolean;
export interface ClientAttribute<T extends object> {
    allowDecimals?: boolean;
    audit?: boolean;
    auto?: boolean;
    calculated?: boolean;
    code: StringKeyof<T>;
    defaultValue?: string;
    enumValues?: Array<string>;
    excludeTime?: boolean;
    excludeTZ?: boolean;
    export?: boolean;
    insert?: boolean;
    max?: number;
    maxLength?: number;
    min?: number;
    name: string;
    noUppercaseSearch?: boolean;
    optional?: boolean;
    out?: boolean;
    param?: string;
    primary?: boolean;
    query?: boolean;
    refAlias?: string;
    /**
     * Reference to a join definition alias (new format).
     * Use this instead of `refAlias` when using the centralized `joins` array.
     * The join definition must exist in the DataSource's `joins` array.
     */
    joinAlias?: string;
    select?: boolean;
    type: AttributeType;
    update?: boolean;
    isBigInt?: boolean;
    /** When true, skip server-side trim on POST for this attribute (rare). */
    skipTrimOnPost?: boolean;
}
export interface Attribute<T extends object> extends ClientAttribute<T> {
    column?: string;
    ref?: ReferenceMetadata;
    refTableName?: string;
    refWhereClause?: string | (() => string);
    refEquiJoin?: boolean;
}
//# sourceMappingURL=Attribute.d.ts.map