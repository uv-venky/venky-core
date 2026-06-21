import { type UserSession } from '../../../lib/core/common/types/UserSession';
type UserSessionState = {
    session: UserSession;
};
export declare const userSessionState: UserSessionState;
export declare function useClientSessionSnapshot(): Readonly<UserSession>;
export {};
//# sourceMappingURL=useClientSessionSnapshot.d.ts.map