import type { ErrorResponse } from '@/lib/core/common/error';
import { alertFooter, sendGoogleChatAlert } from '@/lib/core/server/google-chat';
import logger from '@/lib/core/server/logger';

interface Bucket {
  tokens: number;
  lastRefill: number;
  count: number;
}

export class RateLimiter {
  private buckets: Map<string, Bucket>;
  private rateLimitWindowInMs: number;
  private maxRequests: number;
  private refillRate: number;
  private name: string;

  constructor(name: string, maxRequests = 1000, rateLimitWindowInMs = 60000 /* 1 minute in milliseconds */) {
    this.name = name;
    this.buckets = new Map();
    this.rateLimitWindowInMs = rateLimitWindowInMs;
    this.maxRequests = maxRequests;
    this.refillRate = maxRequests / rateLimitWindowInMs;
  }

  isRateLimited(ipOrUsername: string | null): boolean {
    if (!ipOrUsername) {
      return true;
    }

    // NOTE: in-process bucket. Best-effort only — use DbRateLimiter from
    // db-ratelimit.ts for any security-sensitive limit that must hold
    // across instances. Previous code bypassed entirely in development,
    // which hid bucket bugs from local testing; removed deliberately.

    const now = Date.now();
    let bucket = this.buckets.get(ipOrUsername);
    if (!bucket) {
      bucket = { tokens: this.maxRequests, lastRefill: now, count: 0 };
      this.buckets.set(ipOrUsername, bucket);
    } else {
      this.refillBucket(bucket, now);
    }

    if (bucket.tokens < 1) {
      return true;
    }

    bucket.tokens -= 1;
    return false;
  }

  private logRejectRateLimitedRequest(ipOrUsername: string | null, bucket: Bucket | undefined, requestUrl?: string) {
    if (bucket) {
      bucket.count += 1;
      if (bucket.count === 1) {
        sendGoogleChatAlert(`⚠️ *Rate Limit Alert*
• Limiter: \`${this.name}\`
• Identity: \`${ipOrUsername}\`${requestUrl ? `\n• Request URL: \`${requestUrl}\`` : ''}
• Threshold: ${this.maxRequests} requests / ${this.rateLimitWindowInMs / 60000} min
${alertFooter()}`);
      }
      if ([1, 250, 500, 750, 1000].includes(bucket.count) || bucket.count % 10000 === 0) {
        logger.warn('Rate limit exceeded', {
          name: this.name,
          ipOrUsername,
          count: bucket.count,
        });
      }
    }
  }

  rejectRateLimitedRequest(ipOrUsername: string | null, requestUrl?: string): Response {
    const bucket = ipOrUsername ? this.buckets.get(ipOrUsername) : undefined;
    this.logRejectRateLimitedRequest(ipOrUsername, bucket, requestUrl);
    return Response.json(
      {
        status: 'ERROR',
        message: 'Too many requests. Please try again later.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': (this.rateLimitWindowInMs / 1000).toString(),
          'X-RateLimit-Reset': ((bucket?.lastRefill ?? Date.now()) + this.rateLimitWindowInMs).toString(),
        },
      },
    );
  }

  rejectRateLimitedAction(ipOrUsername: string | null, requestUrl?: string): ErrorResponse {
    const bucket = ipOrUsername ? this.buckets.get(ipOrUsername) : undefined;
    this.logRejectRateLimitedRequest(ipOrUsername, bucket, requestUrl);
    return {
      status: 'ERROR',
      message: 'Too many requests. Please try again later.',
    };
  }

  refillBucket(bucket: { tokens: number; lastRefill: number }, now: number) {
    const elapsed = now - bucket.lastRefill;
    bucket.tokens = Math.min(this.maxRequests, bucket.tokens + Math.floor(elapsed * this.refillRate));
    bucket.lastRefill = now;
  }

  cleanupOldData(): number {
    const now = Date.now();
    let deletedCount = 0;

    for (const [ip, bucket] of this.buckets.entries()) {
      this.refillBucket(bucket, now);
      if (bucket.tokens >= this.maxRequests) {
        this.buckets.delete(ip);
        deletedCount++;
      }
    }
    return deletedCount;
  }
}

declare global {
  var _rateLimiters:
    | {
        rateLimiter: RateLimiter;
        unauthenticatedPageAPIRateLimiter: RateLimiter;
        unauthenticatedStaticRateLimiter: RateLimiter;
        passwordResetRateLimiter: RateLimiter;
      }
    | undefined;
}

export function getRateLimiters(name: string) {
  if (globalThis._rateLimiters) {
    return globalThis._rateLimiters;
  }
  logger.info(`Creating rate limiters for name: ${name}`);
  const rateLimiters = {
    rateLimiter: new RateLimiter('General', Number(process.env.AUTH_RATE_LIMIT ?? '1000')),
    unauthenticatedPageAPIRateLimiter: new RateLimiter(
      'Unauthenticated Page API',
      Number(process.env.UNAUTH_PAGE_API_RATE_LIMIT ?? '50'),
      300000, // 5 minutes
    ),
    unauthenticatedStaticRateLimiter: new RateLimiter(
      'Unauthenticated Static',
      Number(process.env.UNAUTH_STATIC_RATE_LIMIT ?? '200'),
      300000, // 5 minutes
    ),
    passwordResetRateLimiter: new RateLimiter(
      'Password Reset',
      Number(process.env.PASSWORD_RESET_RATE_LIMIT ?? '3'),
      3600000, // 1 hour
    ),
  };
  globalThis._rateLimiters = rateLimiters;
  return rateLimiters;
}

export function cleanupAllRateLimiterData(): void {
  try {
    const {
      rateLimiter,
      unauthenticatedPageAPIRateLimiter,
      unauthenticatedStaticRateLimiter,
      passwordResetRateLimiter,
    } = getRateLimiters('cleanupAllRateLimiterData');
    let deletedCount = rateLimiter.cleanupOldData();
    deletedCount += unauthenticatedPageAPIRateLimiter.cleanupOldData();
    deletedCount += unauthenticatedStaticRateLimiter.cleanupOldData();
    deletedCount += passwordResetRateLimiter.cleanupOldData();
    if (deletedCount > 20) {
      logger.info('Rate limiter cleanup completed', { deletedCount });
    }
  } catch (error) {
    logger.error('Error during rate limiter cleanup:', error);
  }
}
