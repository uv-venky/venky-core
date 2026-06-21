import type { UserSession } from '../../../lib/core/common/types/UserSession';
import type { Env } from '../../../app/(secure)/EnvProvider';
import type { PgPoolClient } from '../../../lib/core/server/db';
import type { Session } from '../../../auth';
import { type AppConfig } from '../../../lib/core/server/config';
export declare function getUserSession(): Promise<UserSession | null>;
export declare function getEnvironment(): Promise<Env>;
/**
 * Get the app config for devtools display.
 * Note: Add any new non-sensitive values to be displayed in the devtools to the config object.
 */
export declare function getAppConfigForDevtools(): Promise<Omit<AppConfig, 'secret'>>;
export interface SystemInfo {
  coreVersion: string;
  nodeVersion: string;
  nextVersion: string;
}
export declare function getSystemInfo(): Promise<SystemInfo>;
export declare function makeBackgroundJobSession(
  client: PgPoolClient,
  userName: string,
  jobId: string,
): Promise<Session | null>;
//# sourceMappingURL=session.d.ts.map
