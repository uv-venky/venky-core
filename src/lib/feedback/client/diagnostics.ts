'use client';
/* Copyright (c) 2024-present Venky Corp. */

/**
 * Lightweight, always-on diagnostics ring buffers for feedback context.
 *
 * Design constraints:
 * - No dependency on devtools (works when devtools is disabled)
 * - Plain arrays, no valtio/proxies — zero reactivity overhead
 * - O(1) writes via circular buffer pattern
 * - Fetch interceptor captures only method/url/status/duration (no body cloning)
 * - Error buffer uses lazy trim to 5-minute window on read, not on every write
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DiagnosticLog {
  level: string;
  message: string;
  dataSource?: string;
  timestamp: string;
  /** Extra props passed to the logger (error, query details, etc.), truncated for size safety. */
  extra?: Record<string, unknown>;
}

export interface DiagnosticNetwork {
  method: string;
  url: string;
  status?: number;
  duration?: number;
  error?: string;
  timestamp: string;
  /** Parsed request body for JSON requests, truncated for size safety. */
  body?: unknown;
}

export interface DiagnosticError {
  source: string;
  message: string;
  timestamp: string;
  url?: string;
}

// ---------------------------------------------------------------------------
// Ring buffer helper
// ---------------------------------------------------------------------------

class RingBuffer<T> {
  private buf: T[];
  private idx = 0;
  private full = false;

  constructor(private readonly max: number) {
    this.buf = [];
  }

  push(item: T): void {
    if (this.full) {
      this.buf[this.idx] = item;
    } else {
      this.buf.push(item);
    }
    this.idx = (this.idx + 1) % this.max;
    if (!this.full && this.buf.length >= this.max) this.full = true;
  }

  /** Returns entries in insertion order (oldest → newest). */
  toArray(): T[] {
    if (!this.full) return this.buf.slice();
    return [...this.buf.slice(this.idx), ...this.buf.slice(0, this.idx)];
  }
}

// ---------------------------------------------------------------------------
// Buffers
// ---------------------------------------------------------------------------

const MAX_LOGS = 50;
const MAX_NETWORK = 30;
const MAX_ERRORS = 200;
const ERROR_WINDOW_MS = 5 * 60 * 1000;

const logs = new RingBuffer<DiagnosticLog>(MAX_LOGS);
const network = new RingBuffer<DiagnosticNetwork>(MAX_NETWORK);
const errors = new RingBuffer<DiagnosticError | DiagnosticLog>(MAX_ERRORS);

// ---------------------------------------------------------------------------
// Push helpers (called from external modules)
// ---------------------------------------------------------------------------

export function pushLog(level: string, props: Record<string, unknown>): void {
  const { message, dataSource, ...rest } = props;
  const extra = Object.keys(rest).length > 0 ? sanitizeExtra(rest) : undefined;
  const obj = {
    level,
    message: truncate(String(message ?? ''), 500),
    dataSource: dataSource as string | undefined,
    timestamp: now(),
    extra,
  };
  if (level === 'error') {
    errors.push(obj);
  } else {
    logs.push(obj);
  }
}

export function pushError(source: string, message: string, url?: string): void {
  errors.push({ source, message: truncate(message, 500), timestamp: now(), url });
}

// ---------------------------------------------------------------------------
// Slim fetch interceptor
// ---------------------------------------------------------------------------

let originalFetch: typeof fetch | null = null;

export function installFeedbackFetchInterceptor(): void {
  if (typeof window === 'undefined' || originalFetch) return;

  originalFetch = window.fetch;

  window.fetch = async function feedbackInterceptedFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const fetchFn = originalFetch as typeof fetch;

    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method || (typeof input === 'object' && 'method' in input ? input.method : 'GET');

    // Only log API routes and server actions (same filter as devtools)
    const urlPath = url.startsWith('http') ? new URL(url).pathname : url.split('?')[0];
    const isServerAction =
      init?.headers instanceof Headers
        ? init.headers.has('Next-Action')
        : Array.isArray(init?.headers)
          ? init.headers.some(([k]) => k === 'Next-Action')
          : init?.headers && typeof init.headers === 'object'
            ? 'Next-Action' in init.headers
            : false;

    const shouldLog = urlPath.startsWith('/api/') || isServerAction;

    if (!shouldLog) return fetchFn(input, init);

    const start = performance.now();
    const ts = now();
    const body = parseRequestBody(init?.body);

    try {
      const response = await fetchFn(input, init);
      network.push({
        method: method.toUpperCase(),
        url: truncate(urlPath, 200),
        status: response.status,
        duration: Math.round(performance.now() - start),
        timestamp: ts,
        body,
      });
      return response;
    } catch (err) {
      network.push({
        method: method.toUpperCase(),
        url: truncate(urlPath, 200),
        error: err instanceof Error ? truncate(err.message, 200) : 'unknown',
        duration: Math.round(performance.now() - start),
        timestamp: ts,
        body,
      });
      throw err;
    }
  };
}

// ---------------------------------------------------------------------------
// Error capture (replaces old initConsoleCapture)
// ---------------------------------------------------------------------------

let errorCaptureInstalled = false;

export function initErrorCapture(): () => void {
  if (errorCaptureInstalled) return () => {};
  errorCaptureInstalled = true;

  const originalError = console.error;
  const currentUrl = () => (typeof window !== 'undefined' ? window.location.href : undefined);

  const errorHandler = (event: ErrorEvent) => {
    pushError('unhandled', event.message, event.filename);
  };

  const rejectionHandler = (event: PromiseRejectionEvent) => {
    const msg = event.reason instanceof Error ? event.reason.message : String(event.reason);
    pushError('unhandled', msg, currentUrl());
  };

  console.error = (...args: unknown[]) => {
    pushError('console', args.map(String).join(' '), currentUrl());
    originalError.apply(console, args);
  };

  window.addEventListener('error', errorHandler);
  window.addEventListener('unhandledrejection', rejectionHandler);

  return () => {
    errorCaptureInstalled = false;
    console.error = originalError;
    window.removeEventListener('error', errorHandler);
    window.removeEventListener('unhandledrejection', rejectionHandler);
  };
}

// ---------------------------------------------------------------------------
// Snapshot for feedback context (called on demand)
// ---------------------------------------------------------------------------

export function collectDiagnostics(): {
  logs: DiagnosticLog[];
  network: DiagnosticNetwork[];
  errors: (DiagnosticError | DiagnosticLog)[];
} {
  const cutoff = Date.now() - ERROR_WINDOW_MS;
  const recentErrors = errors.toArray().filter((e) => new Date(e.timestamp).getTime() >= cutoff);

  return {
    logs: logs.toArray(),
    network: network.toArray(),
    errors: recentErrors,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function now(): string {
  return new Date().toISOString();
}

/** Parse JSON string bodies only — skip FormData, Blob, ArrayBuffer (large/binary). */
const MAX_PARSE_BODY_CHARS = 200_000;

function parseRequestBody(body: BodyInit | null | undefined): unknown {
  if (!body || typeof body !== 'string') return undefined;
  if (body.length > MAX_PARSE_BODY_CHARS) {
    return `[body ${body.length} chars omitted]`;
  }
  try {
    const parsed = JSON.parse(body);
    try {
      const s = JSON.stringify(parsed);
      return s.length > 500 ? truncate(s, 500) : parsed;
    } catch (e) {
      const msg = `parseRequestBody stringify: ${e instanceof Error ? e.message : String(e)}`;
      pushError('diagnostics', msg, typeof window !== 'undefined' ? window.location.pathname : undefined);
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[venky diagnostics] ${msg}`);
      }
      return '[parsed body omitted: stringify failed]';
    }
  } catch (e) {
    const msg = `parseRequestBody JSON.parse: ${e instanceof Error ? e.message : String(e)}`;
    pushError('diagnostics', msg, typeof window !== 'undefined' ? window.location.pathname : undefined);
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[venky diagnostics] ${msg}`);
    }
    return truncate(body, 500);
  }
}

function truncate(str: string, max: number): string {
  return str.length > max ? `${str.slice(0, max)}...` : str;
}

/** Shallow-serialize extra props, truncating large values to keep buffer small. */
function sanitizeExtra(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined || val === null) continue;
    if (val instanceof Error) {
      result[key] = truncate(val.message, 300);
    } else if (typeof val === 'string') {
      result[key] = truncate(val, 300);
    } else if (typeof val === 'number' || typeof val === 'boolean') {
      result[key] = val;
    } else {
      try {
        const s = JSON.stringify(val);
        result[key] = s.length > 300 ? `${s.slice(0, 300)}...` : JSON.parse(s);
      } catch {
        result[key] = truncate(String(val), 300);
      }
    }
  }
  return result;
}
