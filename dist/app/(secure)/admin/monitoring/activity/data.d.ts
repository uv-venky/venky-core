import type { PgPoolClient } from '../../../../../lib/core/server/db';
import type { Session } from '../../../../../auth';
import type { Activity } from '../../../../../lib/core/common/types/Activity';
export interface ActivityFilters {
    fromDate: string;
    toDate: string;
    eventType?: string;
    user?: string;
}
export declare function getActivityEvents({ client, _session, filters, }: {
    client: PgPoolClient;
    _session: Session;
    filters: ActivityFilters;
}): Promise<Activity[]>;
export declare function getActivityEventsAll({ client, _session, filters, }: {
    client: PgPoolClient;
    _session: Session;
    filters: ActivityFilters;
}): Promise<Activity[]>;
//# sourceMappingURL=data.d.ts.map