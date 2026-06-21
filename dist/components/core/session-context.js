'use client';
import { GUEST_USER_SESSION } from '../../lib/core/common/types/UserSession';
import { createContext, useContext } from 'react';
export const SessionContext = createContext(GUEST_USER_SESSION);
export function useClientSession() {
    return useContext(SessionContext);
}
export function useIsUserLoggedIn() {
    const session = useClientSession();
    return session.userName !== GUEST_USER_SESSION.userName;
}
//# sourceMappingURL=session-context.js.map