import { GUEST_USER_SESSION, type UserSession } from '@/lib/core/common/types/UserSession';
import { proxy, useSnapshot } from 'valtio';

type UserSessionState = {
  session: UserSession;
};

export const userSessionState = proxy<UserSessionState>({
  session: GUEST_USER_SESSION,
});

export function useClientSessionSnapshot(): Readonly<UserSession> {
  const { session } = useSnapshot<UserSessionState>(userSessionState);
  return session as Readonly<UserSession>;
}
