import type { Session } from '../../../auth';
import type { PgPoolClient } from '../../../lib/core/server/db';
import { type AdminActionName } from './admin';
import { type CommentsActionName } from './comments';
import { type SessionActionName } from './session';
export declare const ACTIONS: {
    getUserSession: (_client: PgPoolClient, _session: Session) => Promise<import("../../core/common/types/UserSession").UserSession | null>;
    getEnvironment: (_client: PgPoolClient, _session: Session) => Promise<import("../../../app/(secure)/EnvProvider").Env>;
    getAppConfigForDevtools: (_client: PgPoolClient, _session: Session) => Promise<Omit<import("../../core/server/config").AppConfig, "secret">>;
    getSystemInfo: (_client: PgPoolClient, _session: Session) => Promise<import("../../core/server/session").SystemInfo>;
    signOut: (_client: PgPoolClient, _session: Session) => Promise<string>;
    saveChatModelAsCookie: (_client: PgPoolClient, _session: Session, model: string) => Promise<void>;
    updateAvatar: (client: PgPoolClient, session: Session, image?: string) => Promise<{
        status: "OK" | "ERROR";
        message?: string;
    }>;
    signOutOthers: (client: PgPoolClient, session: Session) => Promise<void>;
    createComment: (client: PgPoolClient, session: Session, context: string, contextId: string, comment: import("../../../types/comments").NewComment) => Promise<import("../../../types/comments").Comment>;
    genID: (_client: PgPoolClient, _session: Session) => Promise<string>;
    getCommentStats: (client: PgPoolClient, session: Session, context: string, contextId: string) => Promise<{
        totalComments: number;
        authors: string[];
    }>;
    getCommentView: (client: PgPoolClient, session: Session, context: string, contextId: string) => Promise<string | undefined>;
    getComments: (client: PgPoolClient, session: Session, context: string, contextId: string, cursor: string | null) => Promise<{
        comments: import("../../../types/comments").CommentWithParent[];
        hasMore: boolean;
        nextCursor: string | null;
        lastViewedAt?: string;
    }>;
    reactToComment: (client: PgPoolClient, session: Session, commentId: string, reaction: string | null, context: string, contextId: string) => Promise<void>;
    setCommentView: (client: PgPoolClient, session: Session, context: string, contextId: string) => Promise<void>;
    getActivityEvents: (client: PgPoolClient, session: Session, filters: import("../../../app/(secure)/admin/monitoring/activity/data").ActivityFilters) => Promise<import("../../core/common/types/Activity").Activity[]>;
    getAuditStats: (client: PgPoolClient, session: Session) => Promise<import("../../../app/(secure)/admin/monitoring/audit/actions").AuditStats>;
    getAuditFilterOptions: (client: PgPoolClient, session: Session) => Promise<import("../../../app/(secure)/admin/monitoring/audit/actions").AuditFilterOptions>;
    updateProfile: <K extends keyof import("../../core/common/types/UserSettings").UserSettings>(client: PgPoolClient, session: Session, key: K, value: import("../../core/common/types/UserSettings").UserSettings[K]) => Promise<{
        status: "OK" | "ERROR";
        message?: string;
    }>;
    getCacheStats: typeof import("../../../app/(secure)/admin/monitoring/cache/action").getCacheStatsAction;
    clearCache: typeof import("../../../app/(secure)/admin/monitoring/cache/action").clearCacheAction;
    sendTestEmail: (client: PgPoolClient, session: Session) => Promise<void>;
    resendEmailRequest: (client: PgPoolClient, session: Session, requestId: number) => Promise<void>;
    getJobDashboard: typeof import("../../../app/(secure)/admin/monitoring/jobs/action").getJobDashboardAction;
    getJobHistory: typeof import("../../../app/(secure)/admin/monitoring/jobs/action").getJobHistoryAction;
    triggerJob: typeof import("../../../app/(secure)/admin/monitoring/jobs/action").triggerJobAction;
    getSchedulerNodes: typeof import("../../../app/(secure)/admin/monitoring/jobs/action").getSchedulerNodesAction;
};
export type ActionName = AdminActionName | CommentsActionName | SessionActionName;
export declare const ACTION_ACCESS_ROLES: Record<ActionName, string[]>;
export declare const WORKFLOW_CALLABLE_ACTIONS: readonly ActionName[];
export type ActionParams<T extends ActionName> = (typeof ACTIONS)[T] extends (client: PgPoolClient, session: Session, ...args: infer P extends unknown[]) => any ? P : (typeof ACTIONS)[T] extends (client: PgPoolClient, ...args: infer P extends unknown[]) => any ? P : never;
export type ActionOutput<T extends ActionName> = ReturnType<(typeof ACTIONS)[T]>;
export { setActionRegistry, getActionRegistry } from './registry-context';
export type { ActionRegistry, ActionParamSchemaEntry } from './registry-context';
//# sourceMappingURL=index.d.ts.map