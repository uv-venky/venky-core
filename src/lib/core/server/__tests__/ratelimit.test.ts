import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RateLimiter } from '@/lib/core/server/ratelimit';
import { getValidIpAddress } from '@/lib/core/server/utils';

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('limits requests using a token bucket', () => {
    const limiter = new RateLimiter('test', 2, 1000); // 2 requests per second
    const key = 'test';

    expect(limiter.isRateLimited(key)).toBe(false);
    expect(limiter.isRateLimited(key)).toBe(false);
    expect(limiter.isRateLimited(key)).toBe(true);

    vi.advanceTimersByTime(1000);

    expect(limiter.isRateLimited(key)).toBe(false);
  });
});

describe('getValidIpAddress', () => {
  it('returns IPv6 addresses unchanged', () => {
    const headers = new Headers({ 'x-forwarded-for': '2001:db8::1' });
    expect(getValidIpAddress(headers)).toBe('2001:db8::1');
  });
});
