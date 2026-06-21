import type { PgPoolClient } from '../../../../../lib/core/server/db';
import type { Session } from '../../../../../auth';
/**
 * Aggregated audit statistics
 */
export interface AuditStats {
    total: number;
    uniqueEntities: number;
    uniqueUsers: number;
    uniqueDatasources: number;
    latestUpdate: string | null;
    changesByType: {
        added: number;
        removed: number;
        modified: number;
        activated: number;
        deactivated: number;
    };
}
/**
 * Distinct values for smart search Select columns
 */
export interface AuditFilterOptions {
    datasources: string[];
    users: string[];
    attributes: string[];
    valueTypes: string[];
}
/**
 * Query aggregated audit statistics.
 * This fetches stats independently of any filtered data view.
 */
export declare function queryAuditStats({ client }: {
    client: PgPoolClient;
    session: Session;
}): Promise<AuditStats>;
/**
 * Query distinct values for smart search filter options.
 */
export declare function queryAuditFilterOptions({ client, }: {
    client: PgPoolClient;
    session: Session;
}): Promise<AuditFilterOptions>;
//# sourceMappingURL=actions.d.ts.map