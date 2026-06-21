import type { Audit } from '../../../../../../lib/common/ds/types/core/Audit';
import type { Store } from '../../../../../../lib/core/common/types/Store';
import '../../../../../../lib/monaco-setup';
export interface AuditValueDiffDialogProps {
    store: Store<Audit>;
    rowId: string;
    onClose: () => void;
}
export declare function AuditValueDiffDialog({ store, rowId, onClose }: AuditValueDiffDialogProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=audit-value-diff-dialog.d.ts.map