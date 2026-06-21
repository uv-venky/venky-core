import type { Session } from '../../../auth';
import { type ErrorResponse } from '../../../lib/core/common/error';
/**
 * Creates an error response with appropriate message based on user role.
 * - UserError: Always shown to user (intentionally user-facing)
 * - DatabaseError: User-friendly message for known codes, technical for admins
 * - Other errors: Technical details for admins, sanitized for regular users
 */
export declare function createErrorResponse(error: unknown, session?: Session | null): ErrorResponse;
//# sourceMappingURL=error-response.d.ts.map