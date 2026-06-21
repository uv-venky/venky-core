import { type Logger as PinoLogger } from 'pino';
import { PassThrough } from 'node:stream';
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
  aiStepCounter?: {
    n: number;
  };
}
interface AsyncContext<T> {
  run: <R>(ctx: T, fn: () => R) => R;
  getStore: () => T | undefined;
}
declare class Logger {
  context: AsyncContext<LogContext>;
  logger: PinoLogger;
  runWithLogContext: <T>(ctx: LogContext, fn: () => T) => T;
  constructor(logger: PinoLogger);
  setContext(key: keyof LogContext, value: string): void;
  get traceEnabled(): boolean;
  get debugEnabled(): boolean;
  get infoEnabled(): boolean;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  debug(...args: any[]): void;
  info(...args: any[]): void;
  log(...args: any[]): void;
  trace(...args: any[]): void;
}
export type LoggerType = ReturnType<typeof ensureLogger>;
declare function ensureLogger(): Logger;
/**
 * Attach the DB transport to the logger. Call this after migrations have completed
 * so that uv_logs exists (avoids "relation \"uv_logs\" does not exist" on fresh install).
 */
export declare function enableDbLogging(): Promise<void>;
declare const _default: {
  debug: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  info: (...args: any[]) => void;
  log: (...args: any[]) => void;
  trace: (...args: any[]) => void;
  setContext: (key: keyof LogContext, value: string) => void;
  runWithLogContext<T>(ctx: LogContext, fn: () => T): T;
  readonly traceEnabled: boolean;
  readonly debugEnabled: boolean;
  readonly infoEnabled: boolean;
  readonly context: AsyncContext<LogContext>;
  readonly logger: PinoLogger;
};
export default _default;
//# sourceMappingURL=logger.d.ts.map
