import type { ErrorResponse } from '../../../lib/core/common/error';
export declare class RateLimiter {
  private buckets;
  private rateLimitWindowInMs;
  private maxRequests;
  private refillRate;
  private name;
  constructor(name: string, maxRequests?: number, rateLimitWindowInMs?: number);
  isRateLimited(ipOrUsername: string | null): boolean;
  private logRejectRateLimitedRequest;
  rejectRateLimitedRequest(ipOrUsername: string | null, requestUrl?: string): Response;
  rejectRateLimitedAction(ipOrUsername: string | null, requestUrl?: string): ErrorResponse;
  refillBucket(
    bucket: {
      tokens: number;
      lastRefill: number;
    },
    now: number,
  ): void;
  cleanupOldData(): number;
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
export declare function getRateLimiters(name: string): {
  rateLimiter: RateLimiter;
  unauthenticatedPageAPIRateLimiter: RateLimiter;
  unauthenticatedStaticRateLimiter: RateLimiter;
  passwordResetRateLimiter: RateLimiter;
};
export declare function cleanupAllRateLimiterData(): void;
//# sourceMappingURL=ratelimit.d.ts.map
