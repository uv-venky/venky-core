import type { Store } from '../../../lib/core/common/types/Store';
interface EditSheetProps<T extends object> {
    title: string;
    store: Store<T>;
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    /** Optional content rendered at the start of the footer (e.g. secondary actions) */
    footerContent?: React.ReactNode;
    description?: string;
    keepOpen?: boolean;
    handleSave?: (onClose: () => void) => Promise<void>;
    onSaveSuccess?: () => void;
    allowDelete?: boolean;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    resizable?: boolean;
    bodyClassName?: string;
}
export declare const EditSheet: <T extends object>(props: EditSheetProps<T>) => React.ReactNode;
export {};
//# sourceMappingURL=edit-sheet.d.ts.map