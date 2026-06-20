export function getErrorMessage(e: unknown): string {
  if (e instanceof Error) {
    return e.message;
  }
  if (typeof e === 'string') {
    return e;
  }
  return String(e);
}

const ABORT_ERROR = 'AbortError';

export class AbortError extends Error {
  constructor() {
    super(ABORT_ERROR);
    this.name = ABORT_ERROR;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AbortError);
    }
  }
}

/** Stable across bundles/realms so instanceof still works when duplicate venky-core copies are loaded. */
export const USER_ERROR_BRAND = Symbol.for('venky.UserError');

export class UserError extends Error {
  readonly [USER_ERROR_BRAND] = true;

  constructor(message: string) {
    super(message);
    this.name = 'UserError';
  }
}

/** Detect UserError even when instanceof fails (e.g. Next.js duplicate module instances). */
export function isUserError(error: unknown): error is UserError {
  if (error instanceof UserError) {
    return true;
  }
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  if (USER_ERROR_BRAND in error) {
    return true;
  }
  return error instanceof Error && error.constructor.name === 'UserError';
}

/**
 * Checks if an error is due to an aborted/cancelled request.
 * This commonly happens during Playwright tests when navigating between pages
 * before API requests complete.
 */
export function isAbortedRequestError(error: unknown): boolean {
  if (error instanceof Error) {
    // Check for Node.js ECONNRESET error
    if ('code' in error && error.code === 'ECONNRESET') {
      return true;
    }
    // Check for abort error message
    if (error.message === 'aborted' || error.name === 'AbortError') {
      return true;
    }
  }
  return false;
}

export interface ErrorResponse {
  status: 'ERROR';
  message: string;
}

export function isErrorResponse(value: unknown): value is ErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    value.status === 'ERROR' &&
    'message' in value &&
    typeof value.message === 'string'
  );
}

export type APIResponse<T> = T | ErrorResponse;
