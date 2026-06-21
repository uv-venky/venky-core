/* Copyright (c) 2024-present Venky Corp. */
/**
 * Postgres-backed rate limiter.
 *
 * Use for security-critical limits that must hold across multiple app
 * instances (password reset, signup, LLM cost guards). The in-memory
 * RateLimiter in ratelimit.ts remains appropriate for best-effort
 * throttling of high-volume paths (static assets, general API).
 *
 * Uses an UNLOGGED table (uv_rate_limit_buckets) with a fixed-window
 * counter per key. Not a token bucket — simpler, correct enough for
 * low-QPS security rails.
 */
import { getPool } from './db';
import logger from './logger';
export class DbRateLimiter {
    opts;
    constructor(opts) {
        this.opts = opts;
    }
    /**
     * Atomically increment the bucket for `key` and return whether the caller
     * has exceeded the limit. Never skipped in development — in-memory dev
     * bypass belongs to the best-effort limiter, not the security one.
     */
    async isRateLimited(key) {
        if (!key)
            return true;
        const bucketKey = `${this.opts.name}:${key}`;
        try {
            const pool = getPool();
            const windowStart = new Date(Date.now() - (Date.now() % this.opts.windowMs));
            const { rows } = await pool.query(`INSERT INTO uv_rate_limit_buckets (bucket_key, window_start, request_count, updated_at)
         VALUES ($1, $2, 1, NOW())
         ON CONFLICT (bucket_key) DO UPDATE
           SET request_count = CASE
                 WHEN uv_rate_limit_buckets.window_start = EXCLUDED.window_start
                   THEN uv_rate_limit_buckets.request_count + 1
                 ELSE 1
               END,
               window_start = EXCLUDED.window_start,
               updated_at   = NOW()
         RETURNING request_count`, [bucketKey, windowStart]);
            const count = rows[0]?.request_count ?? 0;
            return count > this.opts.maxRequests;
        }
        catch (err) {
            // Fail-open if the DB is unreachable — better to serve than to block
            // everyone, but record it so we notice a persistent outage.
            logger.error('[DbRateLimiter] Failed to check bucket; allowing request', {
                name: this.opts.name,
                err,
            });
            return false;
        }
    }
    rejectResponse() {
        return Response.json({ status: 'ERROR', message: 'Too many requests. Please try again later.' }, {
            status: 429,
            headers: {
                'Retry-After': (this.opts.windowMs / 1000).toString(),
            },
        });
    }
}
function getOrCreateLimiter(key, opts) {
    if (!globalThis._$dbRateLimiters) {
        globalThis._$dbRateLimiters = {};
    }
    const map = globalThis._$dbRateLimiters;
    if (!map[key]) {
        map[key] = new DbRateLimiter(opts);
    }
    return map[key];
}
/** Password reset: 3/hour per email or IP. */
export function getPasswordResetDbLimiter() {
    return getOrCreateLimiter('passwordReset', {
        name: 'password-reset',
        windowMs: 60 * 60 * 1000,
        maxRequests: Number(process.env.PASSWORD_RESET_RATE_LIMIT ?? '3'),
    });
}
/**
 * Failed sign-in attempts per username. Prevents targeted password-guessing
 * against a specific account. 5 attempts / 15 minutes by default — we count
 * every sign-in call (success + failure) for simplicity; a user legitimately
 * hitting the limit in a 15-minute window is rare.
 */
export function getSignInUserDbLimiter() {
    return getOrCreateLimiter('signInUser', {
        name: 'signin-user',
        windowMs: 15 * 60 * 1000,
        maxRequests: Number(process.env.SIGNIN_USER_RATE_LIMIT ?? '5'),
    });
}
/**
 * Sign-in attempts per IP. Slows horizontal spraying (one attempt each against
 * many usernames from the same source). 20 / 15 min.
 */
export function getSignInIpDbLimiter() {
    return getOrCreateLimiter('signInIp', {
        name: 'signin-ip',
        windowMs: 15 * 60 * 1000,
        maxRequests: Number(process.env.SIGNIN_IP_RATE_LIMIT ?? '20'),
    });
}
/**
 * Magic-link generation per email. Matches password-reset: 3/hour.
 */
export function getMagicLinkDbLimiter() {
    return getOrCreateLimiter('magicLink', {
        name: 'magic-link',
        windowMs: 60 * 60 * 1000,
        maxRequests: Number(process.env.MAGIC_LINK_RATE_LIMIT ?? '3'),
    });
}
/**
 * Mobile refreshToken. A stolen token could otherwise mint thousands of
 * sessions before rotation-chain reuse detection fires. 60 / minute per session.
 */
export function getRefreshTokenDbLimiter() {
    return getOrCreateLimiter('refreshToken', {
        name: 'refresh-token',
        windowMs: 60 * 1000,
        maxRequests: Number(process.env.REFRESH_TOKEN_RATE_LIMIT ?? '60'),
    });
}
/**
 * SSO / OAuth callback per IP. Throttles callback replay and state-param
 * guessing. 30 / minute.
 */
export function getSsoCallbackDbLimiter() {
    return getOrCreateLimiter('ssoCallback', {
        name: 'sso-callback',
        windowMs: 60 * 1000,
        maxRequests: Number(process.env.SSO_CALLBACK_RATE_LIMIT ?? '30'),
    });
}
/**
 * Periodic cleanup — delete buckets that haven't been touched in 24h.
 * Called from startup cron or ad-hoc.
 */
export async function cleanupDbRateLimitBuckets() {
    try {
        const pool = getPool();
        const { rowCount } = await pool.query(`DELETE FROM uv_rate_limit_buckets WHERE updated_at < NOW() - INTERVAL '24 hours'`);
        return rowCount ?? 0;
    }
    catch (err) {
        logger.error('[DbRateLimiter] cleanup failed', err);
        return 0;
    }
}
//# sourceMappingURL=db-ratelimit.js.map