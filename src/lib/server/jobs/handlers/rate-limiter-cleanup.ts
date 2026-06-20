import { cleanupDbRateLimitBuckets } from '@/lib/core/server/db-ratelimit';
import { cleanupAllRateLimiterData } from '@/lib/core/server/ratelimit';

export async function cleanupRateLimiterData(): Promise<void> {
  cleanupAllRateLimiterData();
  await cleanupDbRateLimitBuckets();
}
