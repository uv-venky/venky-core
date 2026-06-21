import type { Team } from '../../../../components/sidebar/types';
import type { UserSettings } from './UserSettings';
import type { Session } from './Auth';
export interface SessionMetadata {
}
export interface UserSession {
    id: string;
    name: string;
    email: string;
    image?: string;
    userName: string;
    userId?: number;
    roles: string[];
    settings: UserSettings;
    teams: Team[];
    metadata?: SessionMetadata;
}
export declare const GUEST_USER_SESSION: Readonly<UserSession>;
export declare const TEST_SESSION: Readonly<Session>;
export declare const BACKGROUND_JOB_SESSION: Readonly<Session>;
//# sourceMappingURL=UserSession.d.ts.map