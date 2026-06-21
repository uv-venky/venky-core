'use client';
import { useClientSession } from '../../../../../components/core/session-context';
import { assertExists } from '../../../../../components/core/utils';
import { useStore } from '../../../../../lib/core/client/store';
export default function useActiveUserSessionsStore() {
  const session = useClientSession();
  const userName = session?.userName;
  assertExists(userName, 'Missing user name in useActiveUserSessionsStore');
  return useStore({
    datasourceId: 'UserSessions',
    page: 'user-profile-page',
    alias: 'current-user-sessions',
    limit: 20,
    includeCount: false,
    autoQuery: true,
    onInitialized: async (store) => {
      return store.executeQuery({
        query: {
          filter: [{ userName: { is: userName } }, { signedOutAt: { empty: new Date().toISOString() } }],
          sort: { lastAccessedAt: -1 },
        },
      });
    },
  });
}
//# sourceMappingURL=use-user-sessions-store.js.map
