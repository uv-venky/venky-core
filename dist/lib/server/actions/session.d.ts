import type { Env } from '../../../app/(secure)/EnvProvider';
import type { PgPoolClient } from '../../../lib/core/server/db';
import type { Session } from '../../../auth';
import type { UserSession } from '../../../lib/core/common/types/UserSession';
import { type SystemInfo } from '../../../lib/core/server/session';
import type { AppConfig } from '../../../lib/core/server/config';
declare function getUserSessionAction(_client: PgPoolClient, _session: Session): Promise<UserSession | null>;
declare function saveChatModelAsCookieAction(_client: PgPoolClient, _session: Session, model: string): Promise<void>;
declare function getEnvironmentAction(_client: PgPoolClient, _session: Session): Promise<Env>;
declare function getAppConfigForDevtoolsAction(_client: PgPoolClient, _session: Session): Promise<Omit<AppConfig, 'secret'>>;
declare function getSystemInfoAction(_client: PgPoolClient, _session: Session): Promise<SystemInfo>;
declare function signOutAction(_client: PgPoolClient, _session: Session): Promise<string>;
declare function updateAvatarAction(client: PgPoolClient, session: Session, image?: string): Promise<{
    status: 'OK' | 'ERROR';
    message?: string;
}>;
declare function signOutOthersAction(client: PgPoolClient, session: Session): Promise<void>;
export declare const SESSION_ACTIONS: {
    getUserSession: typeof getUserSessionAction;
    getEnvironment: typeof getEnvironmentAction;
    getAppConfigForDevtools: typeof getAppConfigForDevtoolsAction;
    getSystemInfo: typeof getSystemInfoAction;
    signOut: typeof signOutAction;
    saveChatModelAsCookie: typeof saveChatModelAsCookieAction;
    updateAvatar: typeof updateAvatarAction;
    signOutOthers: typeof signOutOthersAction;
};
export type SessionActionName = keyof typeof SESSION_ACTIONS;
export declare const SESSION_ACTION_ACCESS_ROLES: Record<SessionActionName, string[]>;
export {};
//# sourceMappingURL=session.d.ts.map