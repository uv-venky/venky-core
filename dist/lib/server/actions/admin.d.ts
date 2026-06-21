import { type ActivityFilters } from '../../../app/(secure)/admin/monitoring/activity/data';
import { getCacheStatsAction as getCacheStatsImpl, clearCacheAction as clearCacheImpl } from '../../../app/(secure)/admin/monitoring/cache/action';
import { getJobDashboardAction as getJobDashboardImpl, getJobHistoryAction as getJobHistoryImpl, triggerJobAction as triggerJobImpl, getSchedulerNodesAction as getSchedulerNodesImpl } from '../../../app/(secure)/admin/monitoring/jobs/action';
import type { PgPoolClient } from '../../../lib/core/server/db';
import type { Session } from '../../../auth';
import type { UserSettings } from '../../../lib/core/common/types/UserSettings';
declare function getActivityEventsAction(client: PgPoolClient, session: Session, filters: ActivityFilters): Promise<import("../../core/common/types/Activity").Activity[]>;
declare function getAuditStatsAction(client: PgPoolClient, session: Session): Promise<import("../../../app/(secure)/admin/monitoring/audit/actions").AuditStats>;
declare function getAuditFilterOptionsAction(client: PgPoolClient, session: Session): Promise<import("../../../app/(secure)/admin/monitoring/audit/actions").AuditFilterOptions>;
declare function sendTestEmailAction(client: PgPoolClient, session: Session): Promise<void>;
declare function resendEmailRequestAction(client: PgPoolClient, session: Session, requestId: number): Promise<void>;
declare function updateProfileAction<K extends keyof UserSettings>(client: PgPoolClient, session: Session, key: K, value: UserSettings[K]): Promise<{
    status: 'OK' | 'ERROR';
    message?: string;
}>;
export declare const ADMIN_ACTIONS: {
    getActivityEvents: typeof getActivityEventsAction;
    getAuditStats: typeof getAuditStatsAction;
    getAuditFilterOptions: typeof getAuditFilterOptionsAction;
    updateProfile: typeof updateProfileAction;
    getCacheStats: typeof getCacheStatsImpl;
    clearCache: typeof clearCacheImpl;
    sendTestEmail: typeof sendTestEmailAction;
    resendEmailRequest: typeof resendEmailRequestAction;
    getJobDashboard: typeof getJobDashboardImpl;
    getJobHistory: typeof getJobHistoryImpl;
    triggerJob: typeof triggerJobImpl;
    getSchedulerNodes: typeof getSchedulerNodesImpl;
};
export type AdminActionName = keyof typeof ADMIN_ACTIONS;
export declare const ADMIN_ACTION_ACCESS_ROLES: Record<AdminActionName, string[]>;
export {};
//# sourceMappingURL=admin.d.ts.map