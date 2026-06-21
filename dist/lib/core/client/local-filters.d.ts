import type { DATE_OPS_KEY_TYPE } from '../../../components/core/smart-search/operators';
import { type Combiner, type Filters, type Row, type SchemaMember } from '../../../lib/core/common/ds/types/filter';
import type { Store } from '../../../lib/core/common/types/Store';
import type { Attribute } from '../../../lib/core/common/ds/types/Attribute';
export declare const getFixedDate: (op: DATE_OPS_KEY_TYPE) => Date | null;
export declare const getFixedRange: (op: DATE_OPS_KEY_TYPE) => [Date | null, Date | null];
export type FilterFunctionType = <T extends object>(filters: Filters<T>, attributes: Attribute<T>[], record: Row<T>) => boolean;
export declare const combinerMap: {
    [key in Combiner]: FilterFunctionType;
};
export declare const hasAll: (str1: string, strs: string[]) => boolean;
export declare const hasAny: (str1: string, strs: string[]) => boolean;
export declare function applyFilters<T extends object>(filters: Filters<T>, combiner: Combiner, attributes: Attribute<T>[], record: Row<T>): boolean;
export declare function applyLocalFilters<T extends object>({ store, filter, sort, }: {
    store: Store<T>;
    filter: Filters<T> | undefined;
    sort: SchemaMember<T, number> | undefined;
}): Promise<void>;
//# sourceMappingURL=local-filters.d.ts.map