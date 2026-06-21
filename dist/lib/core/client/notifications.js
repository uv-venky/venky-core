/* Copyright (c) 2024-present Venky Corp. */
/** Default provider that logs to console — used when no UI provider is set */
const defaultProvider = {
    showError(title) {
        const msg = typeof title === 'string' ? title : title.message;
        console.error('[Venky] Error:', msg);
    },
    showSuccess(title) {
        console.info('[Venky] Success:', title);
    },
    showWarning(title) {
        console.warn('[Venky] Warning:', title);
    },
    confirmWithUser(_args) {
        console.warn('[Venky] confirmWithUser called but no UI provider is set. Returning false.');
        return Promise.resolve(false);
    },
    touch() {
        // no-op by default
    },
};
let _notificationProvider = defaultProvider;
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
export function setNotificationProvider(provider) {
    _notificationProvider = provider;
}
/** Get the current notification provider */
export function getNotificationProvider() {
    return _notificationProvider;
}
// Convenience functions that delegate to the provider
export function showError(title, props) {
    _notificationProvider.showError(title, props);
}
export function showSuccess(title, props) {
    _notificationProvider.showSuccess(title, props);
}
export function showWarning(title, props) {
    _notificationProvider.showWarning(title, props);
}
export function confirmWithUser(args) {
    return _notificationProvider.confirmWithUser(args);
}
export function touch() {
    _notificationProvider.touch();
}
//# sourceMappingURL=notifications.js.map