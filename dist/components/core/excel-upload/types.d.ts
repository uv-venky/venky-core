import type { Row } from '../../../lib/core/common/ds/types/filter';
import type { Store } from '../../../lib/core/common/types/Store';
export type DefaultFunction = (props: {
    records: Record<string, unknown>[];
    fileName: string;
    fileType: string;
    fileSize: number;
}) => Promise<{
    status: 'SUCCESS';
    result: Record<string, unknown>[];
} | {
    status: 'ERROR';
    error: string;
}>;
export type CallbackFunction = <T extends object>(props: {
    records: Row<T>[];
    fileName: string;
    fileType: string;
    fileSize: number;
}) => Promise<{
    status: 'SUCCESS';
    result: Row<T>[];
} | {
    status: 'ERROR';
    error?: string;
}>;
export interface ExcelUploadProps<T extends object> {
    className?: string;
    store: Store<T>;
    maxRows: number;
    callbackFunction?: CallbackFunction;
    defaultFunction?: DefaultFunction;
    onComplete?: () => void;
    dateFormat: string;
    dateTimeFormat: string;
    ref?: React.RefObject<HTMLDivElement>;
    truncateBeforeLoad?: boolean;
    onError?: (error: string) => void;
}
//# sourceMappingURL=types.d.ts.map