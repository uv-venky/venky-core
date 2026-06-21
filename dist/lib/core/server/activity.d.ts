import type { Activity } from '../common/types/Activity';
import type { AccessDeniedResourceType } from '../common/types/AccessDenied';
declare global {
    var _$activityBuffer: Activity[];
    var _$activityFlushInterval: NodeJS.Timeout | undefined;
    var _$activityFirstLog: boolean;
}
export declare function shutdownActivityBuffer(): Promise<void>;
export declare function initActivityBuffer(): Promise<void>;
export declare function logActivity(activity: Activity): Promise<void>;
interface LogAccessDeniedParams {
    /** Acting user (name + roles + session id are read from it). */
    userName: string;
    roles: string[];
    sessionId: string;
    /** CC domain the attempt was scoped to, if any. */
    domainId?: string;
    /** What kind of thing was being accessed. */
    resourceType: AccessDeniedResourceType;
    /** Identifier of the attempted resource (action name, datasource id, agent id, domain id). */
    resource: string;
    /** Human-readable reason for the denial. */
    reason: string;
}
/**
 * Records an authorization denial as a `uv_user_activity` row with
 * `eventType='Access Denied'`. Best-effort: a logging failure must never mask
 * or replace the original authorization error, so callers should not await a
 * rejection from this (it swallows its own errors). Call it immediately BEFORE
 * throwing the access error at each authorization gate.
 */
export declare function logAccessDenied({ userName, roles, sessionId, domainId, resourceType, resource, reason, }: LogAccessDeniedParams): Promise<void>;
export {};
//# sourceMappingURL=activity.d.ts.map