import type { Store } from '../../../lib/core/common/types/Store';
type EditRecordFormProps<T extends object> = {
    title: string;
    store: Store<T>;
    children: React.ReactNode;
    numberOfFields?: number;
};
export declare const EditRecordForm: <T extends object>(props: EditRecordFormProps<T>) => React.ReactNode;
export {};
//# sourceMappingURL=edit-record-form.d.ts.map