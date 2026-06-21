import type { PoolClient, QueryConfigValues, QueryResult, QueryResultRow } from 'pg';
import { type CachedQueryResult, type QueryCacheOptions } from './cache';
export declare function query<R extends QueryResultRow = any, I = any[]>(client: PoolClient, sql: string, params?: QueryConfigValues<I>): Promise<QueryResult<R>>;
export declare function queryCached<R extends QueryResultRow = any, I = any[]>(client: PoolClient, sql: string, params?: QueryConfigValues<I>, options?: QueryCacheOptions): Promise<CachedQueryResult<R>>;
//# sourceMappingURL=query.d.ts.map