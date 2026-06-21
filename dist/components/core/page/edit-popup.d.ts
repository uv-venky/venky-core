import type { Store } from '../../../lib/core/common/types/Store';
import { type PopupProps } from '../../../components/core/page/popup';
interface EditPopupProps<T extends object> extends Omit<PopupProps, 'footer'> {
    store: Store<T>;
    /** Optional content rendered at the start of the footer (e.g. secondary actions) */
    footerContent?: React.ReactNode;
    keepOpen?: boolean;
    handleSave?: (onClose: () => void) => Promise<void>;
    onSaveSuccess?: () => void;
    allowDelete?: boolean;
}
export declare const EditPopup: <T extends object>(props: EditPopupProps<T>) => React.ReactNode;
export {};
//# sourceMappingURL=edit-popup.d.ts.map