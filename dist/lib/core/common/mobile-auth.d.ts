import type { User } from '../../../lib/core/common/types/Auth';
export declare const MOBILE_AUTH_REQUIRED_ACTION: {
    readonly ForcePasswordChange: "FORCE_PASSWORD_CHANGE";
};
export type MobileAuthRequiredAction = (typeof MOBILE_AUTH_REQUIRED_ACTION)[keyof typeof MOBILE_AUTH_REQUIRED_ACTION];
export interface MobileAuthSessionData {
    encryptedSessionId: string;
    expiresAt: string;
    forcePasswordChange: boolean;
    requiredAction?: MobileAuthRequiredAction;
    nextPath?: string;
}
export declare function getMobileAuthSessionMetadata(user: Pick<User, 'forcePasswordChange'>): Pick<MobileAuthSessionData, 'forcePasswordChange' | 'requiredAction' | 'nextPath'>;
//# sourceMappingURL=mobile-auth.d.ts.map