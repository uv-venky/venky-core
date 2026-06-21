import { type DBUserActive } from './lib/core/server/utils';
import { type MobileAuthSessionData } from './lib/core/common/mobile-auth';
export type { User, Session } from './lib/core/common/types/Auth';
import type { Session } from './lib/core/common/types/Auth';
import type { UserSettings } from './lib/core/common/types/UserSettings';
/**
 * Hashes a password using bcrypt with the configured salt rounds
 */
export declare function hashPassword(pwd: string): Promise<string>;
export interface DBUser extends DBUserActive {
    user_name: string;
    password_hash: string;
    email: string;
    display_name: string;
    user_id: number;
    settings: UserSettings;
    force_password_change: boolean;
}
export declare function getUserRoles(userName: string): Promise<string[]>;
export declare function cacheAutoLoginSession(): Promise<void>;
export declare function auth(doNotSetSessionCookie?: boolean): Promise<Session | null>;
export declare function signIn(provider: string, options?: {
    userName?: string;
    password?: string;
    token?: string;
    relayState?: string;
    redirect?: boolean;
    metadata?: unknown;
    isMobile?: boolean;
}): Promise<MobileAuthSessionData | undefined>;
export declare function refreshToken(encryptedSessionId: string): Promise<MobileAuthSessionData | null>;
export declare function signOut(): Promise<string>;
export declare function clearSessionCache(userName: string): Promise<void>;
//# sourceMappingURL=auth.d.ts.map