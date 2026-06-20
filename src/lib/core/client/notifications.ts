/* Copyright (c) 2024-present Venky Corp. */

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
  showError(title: string | Error, props?: { description?: string }): void;
  showSuccess(title: string, props?: { description?: string }): void;
  showWarning(title: string, props?: { description?: string }): void;
  confirmWithUser(args: ConfirmWithUserArgs | ConfirmWithUserTwoButtonArgs): Promise<boolean | string | null>;
  /** Called on user interaction to reset inactivity timers */
  touch(): void;
}

/** Default provider that logs to console — used when no UI provider is set */
const defaultProvider: NotificationProvider = {
  showError(title: string | Error) {
    const msg = typeof title === 'string' ? title : title.message;
    console.error('[Venky] Error:', msg);
  },
  showSuccess(title: string) {
    console.info('[Venky] Success:', title);
  },
  showWarning(title: string) {
    console.warn('[Venky] Warning:', title);
  },
  confirmWithUser(_args: ConfirmWithUserArgs | ConfirmWithUserTwoButtonArgs): Promise<boolean | string | null> {
    console.warn('[Venky] confirmWithUser called but no UI provider is set. Returning false.');
    return Promise.resolve(false);
  },
  touch() {
    // no-op by default
  },
};

let _notificationProvider: NotificationProvider = defaultProvider;

/**
 * Set the notification provider for the app.
 * Call this in your root layout/provider component.
 *
 * @example
 * // In AppProvider (Next.js with sonner)
 * import { setNotificationProvider } from 'venky-core/client';
 * setNotificationProvider({
 *   showError: sonnerShowError,
 *   showSuccess: sonnerShowSuccess,
 *   showWarning: sonnerShowWarning,
 *   confirmWithUser: sonnerConfirmWithUser,
 *   touch: sonnerTouch,
 * });
 */
export function setNotificationProvider(provider: NotificationProvider) {
  _notificationProvider = provider;
}

/** Get the current notification provider */
export function getNotificationProvider(): NotificationProvider {
  return _notificationProvider;
}

// Convenience functions that delegate to the provider
export function showError(title: string | Error, props?: { description?: string }): void {
  _notificationProvider.showError(title, props);
}

export function showSuccess(title: string, props?: { description?: string }): void {
  _notificationProvider.showSuccess(title, props);
}

export function showWarning(title: string, props?: { description?: string }): void {
  _notificationProvider.showWarning(title, props);
}

export function confirmWithUser(args: ConfirmWithUserArgs): Promise<boolean>;
export function confirmWithUser(args: ConfirmWithUserTwoButtonArgs): Promise<string | null>;
export function confirmWithUser(
  args: ConfirmWithUserArgs | ConfirmWithUserTwoButtonArgs,
): Promise<boolean | string | null> {
  return _notificationProvider.confirmWithUser(args);
}

export function touch(): void {
  _notificationProvider.touch();
}
