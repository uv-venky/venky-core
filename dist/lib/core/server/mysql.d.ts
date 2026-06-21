import * as mysql from 'mysql2/promise';
export interface QueryResult<T> {
    rows: T[];
}
declare global {
    var _mysqlPool: mysql.Pool | undefined;
}
export declare function getPool(): mysql.Pool;
export interface PoolStatus {
    idleCount: number;
    totalCount: number;
    expiredCount: number;
    waitingCount: number;
    listenerCount: number;
}
export declare function getPoolStatus(): Promise<PoolStatus>;
export declare const executeQuery: <T extends object>(text: string, params?: any[]) => Promise<QueryResult<T>>;
export declare const execute: <T extends object>(client: mysql.PoolConnection, text: string, params?: any[]) => Promise<QueryResult<T>>;
export declare const transactionWithRetry: <Output>(callback: (_client: mysql.PoolConnection) => Promise<Output>) => Promise<Output>;
export declare const transaction: <Output>(callback: (_client: mysql.PoolConnection) => Promise<Output>) => Promise<[Output | null, Error | null]>;
export declare function resetTransaction(client: mysql.PoolConnection): Promise<void>;
export declare function withAdvisoryLock<T>(key: bigint, callback: (client: mysql.PoolConnection) => Promise<T>): Promise<T | null>;
//# sourceMappingURL=mysql.d.ts.map