export const CSRF_COOKIE_NAME = 'venky-csrf' as const;
export const CSRF_HEADER_NAME = 'x-csrf-token' as const;

/** `AUTO_LOGIN_USER` dev cache session id; no `user_sessions` row — CSRF is skipped in non-production. */
export const DEV_AUTO_LOGIN_SESSION_ID = 'dev-auto-login' as const;
