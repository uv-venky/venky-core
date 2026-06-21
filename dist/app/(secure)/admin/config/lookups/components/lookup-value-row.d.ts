import type { LookupValues } from '../../../../../../lib/common/ds/types/core/LookupValues';
import type { LookupTypes } from '../../../../../../lib/common/ds/types/core/LookupTypes';
import type { Store } from '../../../../../../lib/core/common/types/Store';
interface LookupValueRowProps {
    lookupValue: LookupValues;
    lookupType: LookupTypes;
    store: Store<LookupValues>;
}
export declare function LookupValueRow({ lookupValue, lookupType, store }: LookupValueRowProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=lookup-value-row.d.ts.map