/**
 * NotificationProvider provides a pluggable interface for UI notifications
 * and user confirmations. This decouples core client logic (store, queries)
 * from specific UI libraries (sonner, react-hot-toast, etc.).
 *
 * Usage:
 *   - Call `setNotificationProvider()` early in the app (e.g., in AppProvider)
 *   - If no provider is set, defaults to console-based logging (no-op for confirmations)
 */
export interface ConfirmWithUserArgs {
    title: string;
    content: string;
    cancelButtonLabel?: string;
    confirmButtonLabel?: string;
    confirmationText?: string;
}
export interface ConfirmWithUserTwoButtonArgs {
    title: string;
    content: string;
    action1Label: string;
    action2Label: string;
    cancelButtonLabel?: string;
}
export interface NotificationProvider {
    showError(title: string | Error, props?: {
        description?: string;
    }): void;
    showSuccess(title: string, props?: {
        description?: string;
    }): void;
    showWarning(title: string, props?: {
        description?: string;
    }): void;
    confirmWithUser(args: ConfirmWithUserArgs | ConfirmWithUserTwoButtonArgs): Promise<boolean | string | null>;
    /** Called on user interaction to reset inactivity timers */
    touch(): void;
}
/**
 * Set the notification provider for the app.
 * Call this in your root layout/provider component.
 *
 * @example
 * // In AppProvider (Next.js with sonner)
 * import { setNotificationProvider } from '../../../venky-exports/core/client/index.js';
 * setNotificationProvider({
 *   showError: sonnerShowError,
 *   showSuccess: sonnerShowSuccess,
 *   showWarning: sonnerShowWarning,
 *   confirmWithUser: sonnerConfirmWithUser,
 *   touch: sonnerTouch,
 * });
 */
export declare function setNotificationProvider(provider: NotificationProvider): void;
/** Get the current notification provider */
export declare function getNotificationProvider(): NotificationProvider;
export declare function showError(title: string | Error, props?: {
    description?: string;
}): void;
export declare function showSuccess(title: string, props?: {
    description?: string;
}): void;
export declare function showWarning(title: string, props?: {
    description?: string;
}): void;
export declare function confirmWithUser(args: ConfirmWithUserArgs): Promise<boolean>;
export declare function confirmWithUser(args: ConfirmWithUserTwoButtonArgs): Promise<string | null>;
export declare function touch(): void;
//# sourceMappingURL=notifications.d.ts.map