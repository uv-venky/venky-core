import type { PgPoolClient } from './db';
/** Ensures `core` schema, session search_path, and the migrations ledger table exist. */
export declare function ensureMigrationsTable(client: PgPoolClient): Promise<void>;
//# sourceMappingURL=ensure-migrations-table.d.ts.map
