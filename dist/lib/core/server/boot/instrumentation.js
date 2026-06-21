/* Copyright (c) 2024-present Venky Corp. */
import { isAbortedRequestError } from '../../../../lib/core/common/error';
function resolvePingOptions(options) {
  const isDev = process.env.NODE_ENV === 'development';
  return {
    firstDelayMs:
      options?.firstDelayMs ?? Number(process.env.VENKY_INSTRUMENTATION_PING_FIRST_DELAY_MS ?? (isDev ? 3000 : 1000)),
    maxRetries: options?.maxRetries ?? Number(process.env.VENKY_INSTRUMENTATION_PING_RETRIES ?? (isDev ? 10 : 5)),
    retryDelayMs:
      options?.retryDelayMs ?? Number(process.env.VENKY_INSTRUMENTATION_PING_RETRY_DELAY_MS ?? (isDev ? 2000 : 1000)),
    fetchTimeoutMs:
      options?.fetchTimeoutMs ?? Number(process.env.VENKY_INSTRUMENTATION_PING_TIMEOUT_MS ?? (isDev ? 30_000 : 5000)),
  };
}
function isAbortedErrorLog(...args) {
  for (const arg of args) {
    if (isAbortedRequestError(arg)) {
      return true;
    }
    if (arg instanceof Error) {
      if ('code' in arg && arg.code === 'ECONNRESET') {
        return true;
      }
      if (arg.message === 'aborted') {
        return true;
      }
    }
    if (typeof arg === 'string') {
      if (arg.includes('ECONNRESET') || arg === 'Error: aborted') {
        return true;
      }
    }
  }
  return false;
}
/**
 * Node-only instrumentation helpers. Call from `instrumentation.ts#register()`.
 * Uses dynamic imports only so this module stays Edge-safe when imported from instrumentation.
 */
export async function registerCoreInstrumentation(options) {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (isAbortedErrorLog(...args)) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
  const ping = resolvePingOptions(options);
  setTimeout(async () => {
    const port = process.env.PORT || 3000;
    const pingUrl = `http://localhost:${port}/api/ping`;
    for (let attempt = 1; attempt <= ping.maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          console.info(`Instrumentation: Retry attempt ${attempt}/${ping.maxRetries} to invoke /api/ping...`);
          await new Promise((resolve) => setTimeout(resolve, ping.retryDelayMs));
        } else {
          console.info('Instrumentation: Invoking /api/ping to trigger initialization...');
        }
        const response = await fetch(pingUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'instrumentation-hook',
          },
          signal: AbortSignal.timeout(ping.fetchTimeoutMs),
        });
        if (response.ok) {
          const data = await response.json();
          console.info('Instrumentation: Successfully invoked /api/ping', { status: data.status });
          return;
        }
        console.warn('Instrumentation: /api/ping returned non-OK status', {
          status: response.status,
          statusText: response.statusText,
          attempt,
        });
      } catch (error) {
        if (attempt === ping.maxRetries) {
          console.warn(
            'Instrumentation: Failed to invoke /api/ping after all retries (this is OK, initialization will happen on first request)',
            {
              error: error instanceof Error ? error.message : String(error),
              attempts: ping.maxRetries,
            },
          );
        } else {
          console.info(`Instrumentation: Attempt ${attempt} failed, will retry`, {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }
  }, ping.firstDelayMs);
}
export async function onCoreRequestError(err, _request) {
  if (isAbortedRequestError(err)) {
    return;
  }
  console.error('Request error:', err);
}
//# sourceMappingURL=instrumentation.js.map
