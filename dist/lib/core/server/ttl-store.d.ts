import type { PgPoolClient } from '../../../lib/core/server/db';
export declare function putTTLValue<T>(client: PgPoolClient, key: string, value: T, ttlSeconds: number): Promise<void>;
export declare function getTTLValue<T = unknown>(client: PgPoolClient, key: string): Promise<T | null>;
export declare function consumeTTLValue<T = unknown>(client: PgPoolClient, key: string): Promise<T | null>;
export declare function deleteTTLValue(client: PgPoolClient, key: string): Promise<void>;
//# sourceMappingURL=ttl-store.d.ts.map
