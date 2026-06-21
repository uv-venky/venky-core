import pino, {} from 'pino';
import logger from '../../../lib/core/server/logger';
import PinoPretty from 'pino-pretty';
import util from 'node:util';
import { PassThrough } from 'node:stream';
import { AsyncLocalStorage } from 'node:async_hooks';
import pgTransport from '../../../lib/core/server/transport';
import { emptyFunction } from '../../../lib/core/common/isEmpty';
import { APP_VERSION } from '../../../lib/app-info';
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
const INSPECT_OPTIONS = {
  depth: MAX_INSPECT_DEPTH,
  maxArrayLength: MAX_INSPECT_ARRAY_LENGTH,
  maxStringLength: MAX_INSPECT_STRING_LENGTH,
  colors: false,
};
function formatArgs(args) {
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
    return arg;
  });
  const joined = parts.join(' ');
  return joined.length > MAX_FORMATTED_MESSAGE_CHARS
    ? `${joined.slice(0, MAX_FORMATTED_MESSAGE_CHARS)}… [log message truncated, ${joined.length} chars]`
    : joined;
}
class Logger {
  context;
  logger;
  runWithLogContext = emptyFunction;
  constructor(logger) {
    this.logger = logger;
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      // Mock AsyncLocalStorage for test environment
      this.context = {
        run: (ctx, fn) => {
          const prevStore = this.context.store;
          this.context.store = ctx;
          try {
            return fn();
          } finally {
            this.context.store = prevStore;
          }
        },
        getStore: () => this.context.store,
      };
    } else {
      this.context = new AsyncLocalStorage();
    }
  }
  setContext(key, value) {
    const ctx = this.context.getStore();
    if (!ctx) {
      console.warn('No log context found!');
    } else {
      // setContext is only used for string-valued fields; non-string
      // fields like aiStepCounter are set directly via runWithLogContext.
      ctx[key] = value;
    }
  }
  get traceEnabled() {
    return this.logger.levelVal <= 10;
  }
  get debugEnabled() {
    return this.logger.levelVal <= 20;
  }
  get infoEnabled() {
    return this.logger.levelVal <= 30;
  }
  error(...args) {
    this.logger.error(this.context.getStore(), formatArgs(args));
  }
  warn(...args) {
    this.logger.warn(this.context.getStore(), formatArgs(args));
  }
  debug(...args) {
    this.logger.debug(this.context.getStore(), formatArgs(args));
  }
  info(...args) {
    this.logger.info(this.context.getStore(), formatArgs(args));
  }
  log(...args) {
    this.logger.trace(this.context.getStore(), formatArgs(args));
  }
  trace(...args) {
    this.logger.trace(this.context.getStore(), formatArgs(args));
  }
}
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
export async function enableDbLogging() {
  if (process.env.DISABLE_DB_LOGGING?.toLowerCase() === 'true') {
    logger.warn('DB logging disabled (DISABLE_DB_LOGGING=true)');
    return;
  }
  ensureLogger();
  if (globalThis._logTee) {
    const pgStream = await pgTransport();
    globalThis._logTee.pipe(pgStream);
  } else {
    logger.warn('Log tee not found, skipping DB logging');
  }
}
export default {
  debug: (...args) => ensureLogger().debug(...args),
  error: (...args) => ensureLogger().error(...args),
  warn: (...args) => ensureLogger().warn(...args),
  info: (...args) => ensureLogger().info(...args),
  log: (...args) => ensureLogger().log(...args),
  trace: (...args) => ensureLogger().trace(...args),
  setContext: (key, value) => ensureLogger().setContext(key, value),
  runWithLogContext(ctx, fn) {
    if (!ctx.appVersion) {
      ctx.appVersion = APP_VERSION;
    }
    return ensureLogger().context.run(ctx, fn);
  },
  get traceEnabled() {
    return ensureLogger().traceEnabled;
  },
  get debugEnabled() {
    return ensureLogger().debugEnabled;
  },
  get infoEnabled() {
    return ensureLogger().infoEnabled;
  },
  get context() {
    return ensureLogger().context;
  },
  get logger() {
    return ensureLogger().logger;
  },
};
//# sourceMappingURL=logger.js.map
