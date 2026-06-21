import type { LookupTypes } from '../../../../../../lib/common/ds/types/core/LookupTypes';
import type { Store } from '../../../../../../lib/core/common/types/Store';
interface AddLookupTypeDialogProps {
  store: Store<LookupTypes>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export declare function AddLookupTypeDialog({
  store,
  open,
  onOpenChange,
}: AddLookupTypeDialogProps): import('react/jsx-runtime').JSX.Element | null;
export {};
//# sourceMappingURL=add-lookup-type-dialog.d.ts.map
