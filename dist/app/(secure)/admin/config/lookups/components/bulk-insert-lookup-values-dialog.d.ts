import type { LookupValues } from '../../../../../../lib/common/ds/types/core/LookupValues';
import type { LookupTypes } from '../../../../../../lib/common/ds/types/core/LookupTypes';
import type { Store } from '../../../../../../lib/core/common/types/Store';
interface BulkInsertLookupValuesDialogProps {
    store: Store<LookupValues>;
    lookupType: LookupTypes;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}
export declare function BulkInsertLookupValuesDialog({ store, lookupType, open, onOpenChange, }: BulkInsertLookupValuesDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=bulk-insert-lookup-values-dialog.d.ts.map