import { type ToastT } from 'sonner';
export default function CloseAll({ toastId }: {
    toastId: string;
}): import("react/jsx-runtime").JSX.Element;
export interface ShowMsgProps {
    title: string;
    description?: string;
    type: ToastT['type'];
    duration?: number;
    action?: ToastT['action'];
}
export declare function showMessage(args: ShowMsgProps): number | string;
export declare function removeNotification(id: string | number, onCleanup?: boolean): void;
export declare function showError(title: string | Error, props?: Omit<ShowMsgProps, 'title' | 'type'>): number | string;
export declare function showWarning(title: string, props?: Omit<ShowMsgProps, 'title' | 'type'>): number | string;
export declare function showInfo(title: string, props?: Omit<ShowMsgProps, 'title' | 'type'>): number | string;
export declare function showSuccess(title: string, props?: Omit<ShowMsgProps, 'title' | 'type'>): number | string;
//# sourceMappingURL=Notification.d.ts.map