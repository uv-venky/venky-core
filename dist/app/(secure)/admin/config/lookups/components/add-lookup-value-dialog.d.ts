import type { LookupValues } from '../../../../../../lib/common/ds/types/core/LookupValues';
import type { LookupTypes } from '../../../../../../lib/common/ds/types/core/LookupTypes';
import type { Store } from '../../../../../../lib/core/common/types/Store';
interface AddLookupValueDialogProps {
  store: Store<LookupValues>;
  lookupType: LookupTypes;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export declare function AddLookupValueDialog({
  store,
  lookupType,
  open,
  onOpenChange,
}: AddLookupValueDialogProps): import('react/jsx-runtime').JSX.Element | null;
export {};
//# sourceMappingURL=add-lookup-value-dialog.d.ts.map
