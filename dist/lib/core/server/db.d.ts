import pg, { type PoolClient, type QueryConfigValues, type QueryResult, type QueryResultRow } from 'pg';
import type { QueryCacheOptions } from './cache';
import type { PoolStatus } from '../common/types/PoolStatus';
declare global {
    var _pool: pg.Pool | undefined;
    var _readonlyPool: pg.Pool | undefined;
}
export declare function getPool(): import("pg").Pool;
export declare function getReadOnlyPool(): import("pg").Pool;
export declare function getPoolStatus(): Promise<PoolStatus>;
export declare function getReadOnlyPoolStatus(): Promise<PoolStatus>;
export declare const executeQuery: <T extends object>(text: string, params?: any[]) => Promise<QueryResult<T>>;
export declare const execute: <T extends object>(client: pg.PoolClient, text: string, params?: any[]) => Promise<QueryResult<T>>;
export interface PgPoolClient extends PoolClient {
    queryCached<R extends QueryResultRow = any, I = any[]>(sql: string, params?: QueryConfigValues<I>, options?: QueryCacheOptions): Promise<QueryResult<R>>;
}
/**
 * A PgPoolClient sourced from the readonly pool. Connections are session-level
 * read-only (default_transaction_read_only = on), so any write attempt is
 * rejected by Postgres with 25006 read_only_sql_transaction. The nominal brand
 * also prevents accidental assignment between writable and readonly clients at
 * the type level.
 */
export interface PgPoolReadOnlyClient extends PgPoolClient {
    readonly __readonly: true;
}
export declare const newClient: () => Promise<PgPoolClient>;
export declare const newReadOnlyClient: () => Promise<PgPoolReadOnlyClient>;
/**
 * Run multiple read-only queries in parallel, each on its own readonly-pool
 * connection. Use for dashboard/report fan-out where running queries on a
 * single PgPoolClient would force serialization (and emit pg's
 * `Calling client.query() when the client is already executing a query is
 * deprecated` warning).
 *
 * Each callback receives its own fresh readonly client; the helper checks
 * out one connection per callback, awaits all callbacks via Promise.all,
 * and releases every connection in `finally`. If any checkout fails the
 * partially-acquired clients are still released; if any callback rejects,
 * its error propagates while sibling clients are still released.
 *
 * Trade-off: opens N connections concurrently. Don't fan out more queries
 * than the readonly pool can absorb (typical pool max is 10–20). Use for
 * 2–8 independent reads; for larger fan-outs batch them.
 *
 * Usage:
 *   const [topRules, unusedRules, weekly] = await parallelReadQueries([
 *     (c) => c.query<RuleRow>('SELECT ...'),
 *     (c) => c.query<RuleRow>('SELECT ...'),
 *     (c) => c.query<WeekRow>('SELECT ...'),
 *   ]);
 */
type ReadQueryFn<R> = (client: PgPoolReadOnlyClient) => Promise<R>;
export declare function parallelReadQueries<T extends readonly unknown[]>(...queries: {
    [K in keyof T]: ReadQueryFn<T[K]>;
}): Promise<T>;
/**
 * Builds lazy-loading DB accessors for a request/tool lifetime.
 *
 * `getWritableClient` always returns the provided writable client — callers
 * pass in the one the request wrapper already acquired (e.g. from
 * withDBSessionRoute), so writes run in the wrapper's transaction.
 *
 * `getClient` lazily acquires a readonly client on first call and caches it.
 * If no tool ever reads, no readonly connection is opened. Call `release()`
 * once the lifetime ends to return the readonly client to the pool.
 */
export declare function makeLazyDbAccessors(writableClient: PgPoolClient): {
    getClient: () => Promise<PgPoolReadOnlyClient>;
    getWritableClient: () => Promise<PgPoolClient>;
    release: () => void;
};
/**
 * Builds DB accessors for streaming lifetimes (e.g. chat routes).
 *
 * Unlike request-scoped accessors, writable and readonly clients are both
 * lazily acquired and owned by this accessor, then released explicitly via
 * `release()` once streaming completes.
 */
export declare function makeStreamingDbAccessors(): {
    getClient: () => Promise<PgPoolReadOnlyClient>;
    getWritableClient: () => Promise<PgPoolClient>;
    release: () => void;
};
export declare const transactionWithRetry: <Output>(callback: (_client: pg.PoolClient) => Promise<Output>) => Promise<Output>;
export declare const transaction: <Output>(callback: (_client: PgPoolClient) => Promise<Output>) => Promise<Output>;
export declare function resetTransaction(client: pg.PoolClient): Promise<void>;
export declare function hashJobName(name: string): bigint;
export declare function withAdvisoryLock<T>(key: bigint, callback: (client: PgPoolClient) => Promise<T>): Promise<T | null>;
/** Blocks until the advisory lock is available, then runs callback in a transaction. */
export declare function withBlockingAdvisoryLock<T>(key: bigint, callback: (client: PgPoolClient) => Promise<T>): Promise<T>;
export {};
//# sourceMappingURL=db.d.ts.map