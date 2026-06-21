import { GUEST_USER_SESSION } from '../../../lib/core/common/types/UserSession';
import { proxy, useSnapshot } from 'valtio';
export const userSessionState = proxy({
    session: GUEST_USER_SESSION,
});
export function useClientSessionSnapshot() {
    const { session } = useSnapshot(userSessionState);
    return session;
}
//# sourceMappingURL=useClientSessionSnapshot.js.map