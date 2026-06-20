import pino, { type Logger as PinoLogger } from 'pino';
import logger from '@/lib/core/server/logger';
import PinoPretty from 'pino-pretty';
import util from 'node:util';
import { PassThrough } from 'node:stream';
import { AsyncLocalStorage } from 'node:async_hooks';
import type { Writable } from 'node:stream';
import pgTransport from '@/lib/core/server/transport';
import { emptyFunction } from '@/lib/core/common/isEmpty';
import { APP_VERSION } from '@/lib/app-info';

declare global {
  var _logTee: PassThrough | null | undefined;
  var _lgr: Logger | undefined;
}

export interface LogContext {
  trackId?: string;
  userName?: string;
  sessionId?: string;
  apiName?: string;
  dataSource?: string;
  appVersion?: string;
  chatId?: string;
  messageId?: string;
  aiSource?: string;
  agentId?: string;
  domainId?: string;
  /**
   * Per-user-turn correlation ID. One UUID per "user message -> assistant
   * reply" cascade; every LLM invocation AND tool call inside the turn shares
   * the same value. Generated lazily inside withAiInvocationContext when
   * absent. Persisted on every uv_ai_invocations and uv_agent_tool_calls row
   * so a single user turn can be reconstructed from the audit tables.
   */
  agentRunId?: string;
  /**
   * Mutable step counter shared across all wrapped-model invocations made
   * inside a single `withAiInvocationContext` scope. Lets the audit
   * middleware tag multi-step tool-calling chains with `step_index`.
   */
  aiStepCounter?: { n: number };
}

function buildLogger() {
  const level = process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'development' ? 'debug' : 'warn');
  if (process.env.NODE_ENV !== 'test') {
    console.info(`Using log level: ${level}`);
  }
  const tee = new PassThrough();
  globalThis._logTee = tee;
  // Pipe tee to console only; DB transport is attached after migrations (see enableDbLogging)
  tee.pipe(
    process.env.NODE_ENV === 'production'
      ? process.stdout
      : PinoPretty({
          colorize: true,
          translateTime: 'SYS:m/d H:MM:ss',
          singleLine: true,
          destination: process.env.LOG_FILE ?? 1,
          mkdir: true,
          ignore: process.env.NODE_ENV === 'development' ? 'pid,hostname,sessionId,userName' : undefined,
        }),
  );
  return pino({ level }, tee);
}

/** Prevent util.inspect + Pino from building strings larger than V8 allows (RangeError: Invalid string length). */
const MAX_INSPECT_DEPTH = 8;
const MAX_INSPECT_ARRAY_LENGTH = 80;
const MAX_INSPECT_STRING_LENGTH = 2000;
const MAX_FORMATTED_MESSAGE_CHARS = 80_000;

const INSPECT_OPTIONS: util.InspectOptions = {
  depth: MAX_INSPECT_DEPTH,
  maxArrayLength: MAX_INSPECT_ARRAY_LENGTH,
  maxStringLength: MAX_INSPECT_STRING_LENGTH,
  colors: false,
};

function formatArgs(args: unknown[]) {
  const parts = args.map((arg) => {
    if (arg === undefined) return 'undefined';
    if (arg === null) return 'null';
    if (typeof arg === 'object') {
      try {
        return util.inspect(arg, INSPECT_OPTIONS);
      } catch {
        return '[object inspect failed]';
      }
    }
    if (typeof arg === 'string' && arg.length > MAX_INSPECT_STRING_LENGTH) {
      return `${arg.slice(0, MAX_INSPECT_STRING_LENGTH)}… (${arg.length} chars total)`;
    }
    return arg as string | number | boolean | bigint | symbol;
  });
  const joined = parts.join(' ');
  return joined.length > MAX_FORMATTED_MESSAGE_CHARS
    ? `${joined.slice(0, MAX_FORMATTED_MESSAGE_CHARS)}… [log message truncated, ${joined.length} chars]`
    : joined;
}

interface AsyncContext<T> {
  run: <R>(ctx: T, fn: () => R) => R;
  getStore: () => T | undefined;
}

class Logger {
  context: AsyncContext<LogContext>;
  logger: PinoLogger;
  runWithLogContext: <T>(ctx: LogContext, fn: () => T) => T = emptyFunction;

  constructor(logger: PinoLogger) {
    this.logger = logger;
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      // Mock AsyncLocalStorage for test environment
      this.context = {
        run: <T>(ctx: LogContext, fn: () => T): T => {
          const prevStore = (this.context as any).store;
          (this.context as any).store = ctx;
          try {
            return fn();
          } finally {
            (this.context as any).store = prevStore;
          }
        },
        getStore: () => (this.context as any).store,
      };
    } else {
      this.context = new AsyncLocalStorage<LogContext>();
    }
  }

  setContext(key: keyof LogContext, value: string) {
    const ctx = this.context.getStore();
    if (!ctx) {
      console.warn('No log context found!');
    } else {
      // setContext is only used for string-valued fields; non-string
      // fields like aiStepCounter are set directly via runWithLogContext.
      (ctx as Record<string, unknown>)[key] = value;
    }
  }

  get traceEnabled(): boolean {
    return this.logger.levelVal <= 10;
  }

  get debugEnabled(): boolean {
    return this.logger.levelVal <= 20;
  }

  get infoEnabled(): boolean {
    return this.logger.levelVal <= 30;
  }

  error(...args: any[]) {
    this.logger.error(this.context.getStore(), formatArgs(args));
  }

  warn(...args: any[]) {
    this.logger.warn(this.context.getStore(), formatArgs(args));
  }

  debug(...args: any[]) {
    this.logger.debug(this.context.getStore(), formatArgs(args));
  }

  info(...args: any[]) {
    this.logger.info(this.context.getStore(), formatArgs(args));
  }

  log(...args: any[]) {
    this.logger.trace(this.context.getStore(), formatArgs(args));
  }

  trace(...args: any[]) {
    this.logger.trace(this.context.getStore(), formatArgs(args));
  }
}

export type LoggerType = ReturnType<typeof ensureLogger>;

function ensureLogger() {
  if (!globalThis._lgr) {
    globalThis._lgr = new Logger(buildLogger());
  }
  return globalThis._lgr;
}

/**
 * Attach the DB transport to the logger. Call this after migrations have completed
 * so that uv_logs exists (avoids "relation \"uv_logs\" does not exist" on fresh install).
 */
export async function enableDbLogging(): Promise<void> {
  if (process.env.DISABLE_DB_LOGGING?.toLowerCase() === 'true') {
    logger.warn('DB logging disabled (DISABLE_DB_LOGGING=true)');
    return;
  }
  ensureLogger();
  if (globalThis._logTee) {
    const pgStream: Writable = await pgTransport();
    globalThis._logTee.pipe(pgStream);
  } else {
    logger.warn('Log tee not found, skipping DB logging');
  }
}

export default {
  debug: (...args: any[]) => ensureLogger().debug(...args),
  error: (...args: any[]) => ensureLogger().error(...args),
  warn: (...args: any[]) => ensureLogger().warn(...args),
  info: (...args: any[]) => ensureLogger().info(...args),
  log: (...args: any[]) => ensureLogger().log(...args),
  trace: (...args: any[]) => ensureLogger().trace(...args),
  setContext: (key: keyof LogContext, value: string) => ensureLogger().setContext(key, value),
  runWithLogContext<T>(ctx: LogContext, fn: () => T): T {
    if (!ctx.appVersion) {
      ctx.appVersion = APP_VERSION;
    }
    return ensureLogger().context.run(ctx, fn);
  },
  get traceEnabled(): boolean {
    return ensureLogger().traceEnabled;
  },
  get debugEnabled(): boolean {
    return ensureLogger().debugEnabled;
  },
  get infoEnabled(): boolean {
    return ensureLogger().infoEnabled;
  },
  get context(): AsyncContext<LogContext> {
    return ensureLogger().context;
  },
  get logger(): PinoLogger {
    return ensureLogger().logger;
  },
} satisfies LoggerType;
