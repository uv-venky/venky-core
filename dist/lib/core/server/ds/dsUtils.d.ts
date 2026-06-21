import type { DataSource } from '../../../../lib/core/common/ds/types/DataSource';
import type { DBRow, NewRow, Row, StringKeyof } from '../../../../lib/core/common/ds/types/filter';
import type { Attribute } from '../../../../lib/core/common/ds/types/Attribute';
import type { Audit } from '../../../../lib/common/ds/types/core/Audit';
import type { Session } from '../../../../auth';
import type { PgPoolClient } from '../../../../lib/core/server/db';
/**
 * Serialize a value for audit logging.
 * Objects are converted to JSON strings, primitives are converted using String().
 */
/**
 * pgvector input must look like `[f1,f2,...]`. node-pg encodes JS arrays as
 * Postgres array text `{f1,f2,...}`, which pgvector rejects ("must start with '['").
 */
export declare function formatVectorForPostgres(value: unknown): string | null;
export declare function normalizeWhitespaceForPost<T extends object>(ds: DataSource<T>, rows: Row<T>[]): void;
/**
 * Enforces {@link Attribute.min}, {@link Attribute.max} (Number), and {@link Attribute.maxLength}
 * (string-like types) before INSERT/UPDATE. Runs after {@link normalizeWhitespaceForPost}.
 */
export declare function validateAttributeConstraintsForPost<T extends object>(ds: DataSource<T>, rows: Row<T>[]): void;
export declare function serializeValueForAudit(value: unknown): string;
export declare function toIsoString(value: unknown): string | null;
export declare function getWhoAttributes<T extends object>(ds: DataSource<T>): {
    updatedByAttr: Attribute<T>;
    updatedAtAttr: Attribute<T>;
};
export declare function classifyUpdateAttributes<T extends object>(ds: DataSource<T>): {
    readOnlyColumns: StringKeyof<T>[];
    pkAttributes: Attribute<T>[];
    auditAttributes: Attribute<T>[];
};
export declare function getPkValueStr<T extends object>(row: DBRow<T> | (Partial<T> & {
    [k: string]: unknown;
}), pkAttributes: Attribute<T>[]): string;
export declare function applyAuditValueToRow<T extends object>(ds: DataSource<T>, attr: Attribute<T>, value: unknown, auditRow: NewRow<Audit>, prefix: 'old' | 'new'): void;
export declare function populateDefaultValues<T extends object>(_client: PgPoolClient, session: Session, ds: DataSource<T>, rows: DBRow<T>[]): Promise<void>;
export declare function validateRowForUpdateOrDelete<T extends object>(ds: DataSource<T>, row: DBRow<T>, a: Attribute<T>, attributesInUpdate: Set<string> | null): void;
export declare function loadCurrentRowsForUpdate<T extends object>(client: PgPoolClient, session: Session, ds: DataSource<T>, rows: DBRow<T>[], pkAttributes: Attribute<T>[]): Promise<Map<string, DBRow<T>>>;
export declare function populateWHOColumnsForUpdate<T extends object>(session: Session, ds: DataSource<T>, rows: DBRow<T>[]): void;
//# sourceMappingURL=dsUtils.d.ts.map