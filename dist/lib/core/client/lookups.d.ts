import type { LookupTypes } from '../../../lib/common/ds/types/core/LookupTypes';
export type LookupValueOption = {
    value: string | number;
    label: string;
    description?: string | null;
    metadata?: any;
};
export declare function getLookupsByType(lookupTypeCode: string): Promise<LookupValueOption[]>;
export declare function getLookupValue(lookupTypeCode: string, value: string | number): Promise<LookupValueOption | undefined>;
export declare function getLookupTypes(): Promise<LookupTypes[]>;
export declare function clearLookupCache(lookupTypeCode?: string): void;
//# sourceMappingURL=lookups.d.ts.map