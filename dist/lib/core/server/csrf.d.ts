import type { PgPoolClient } from './db';
import type { Session } from '../../../auth';
export declare function isCsrfExempt(pathname: string, method: string): boolean;
/**
 * Validate the X-CSRF-Token (or non-httpOnly `venky-csrf` cookie) against the
 * server-side session token. Missing tokens on pre-CSRF sessions are backfilled
 * once, then a Set-Cookie is issued. Uses timingSafeEqual to avoid leaking
 * token content via timing.
 */
export declare function assertCsrf(client: PgPoolClient, session: Session, req: Request): Promise<void>;
export declare class CsrfError extends Error {
  constructor(message: string);
}
//# sourceMappingURL=csrf.d.ts.map
