export interface DbRateLimitOptions {
  /** Friendly name used in logs. */
  name: string;
  /** Window length in ms. */
  windowMs: number;
  /** Max requests per window. */
  maxRequests: number;
}
export declare class DbRateLimiter {
  private readonly opts;
  constructor(opts: DbRateLimitOptions);
  /**
   * Atomically increment the bucket for `key` and return whether the caller
   * has exceeded the limit. Never skipped in development — in-memory dev
   * bypass belongs to the best-effort limiter, not the security one.
   */
  isRateLimited(key: string | null): Promise<boolean>;
  rejectResponse(): Response;
}
declare global {
  var _$dbRateLimiters: Record<string, DbRateLimiter> | undefined;
}
/** Password reset: 3/hour per email or IP. */
export declare function getPasswordResetDbLimiter(): DbRateLimiter;
/**
 * Failed sign-in attempts per username. Prevents targeted password-guessing
 * against a specific account. 5 attempts / 15 minutes by default — we count
 * every sign-in call (success + failure) for simplicity; a user legitimately
 * hitting the limit in a 15-minute window is rare.
 */
export declare function getSignInUserDbLimiter(): DbRateLimiter;
/**
 * Sign-in attempts per IP. Slows horizontal spraying (one attempt each against
 * many usernames from the same source). 20 / 15 min.
 */
export declare function getSignInIpDbLimiter(): DbRateLimiter;
/**
 * Magic-link generation per email. Matches password-reset: 3/hour.
 */
export declare function getMagicLinkDbLimiter(): DbRateLimiter;
/**
 * Mobile refreshToken. A stolen token could otherwise mint thousands of
 * sessions before rotation-chain reuse detection fires. 60 / minute per session.
 */
export declare function getRefreshTokenDbLimiter(): DbRateLimiter;
/**
 * SSO / OAuth callback per IP. Throttles callback replay and state-param
 * guessing. 30 / minute.
 */
export declare function getSsoCallbackDbLimiter(): DbRateLimiter;
/**
 * Periodic cleanup — delete buckets that haven't been touched in 24h.
 * Called from startup cron or ad-hoc.
 */
export declare function cleanupDbRateLimitBuckets(): Promise<number>;
//# sourceMappingURL=db-ratelimit.d.ts.map
