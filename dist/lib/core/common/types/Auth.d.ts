import type { UserSettings } from './UserSettings';
/**
 * User interface - represents an authenticated user
 * This type is safe to use in both client and server components
 */
export interface User {
    name?: string | null;
    email: string | null;
    image?: string | null;
    userName: string;
    userId?: number;
    roles: string[];
    sessionIndex?: string;
    forcePasswordChange?: boolean;
    settings: UserSettings;
}
/**
 * Session interface - represents an authenticated session
 * This type is safe to use in both client and server components
 */
export interface Session {
    id: string;
    user: User;
    expires: string;
}
//# sourceMappingURL=Auth.d.ts.map