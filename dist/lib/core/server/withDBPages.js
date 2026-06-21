import { jsx as _jsx } from 'react/jsx-runtime';
import { auth } from '../../../auth';
import { newClient } from '../../../lib/core/server/db';
export const withDBSessionPage = (callback) => {
  return async (props) => {
    const session = await auth(true);
    if (!session) {
      return _jsx('div', { children: 'Unauthorized' });
    }
    const client = await newClient();
    try {
      await client.query('BEGIN');
      const response = await callback(client, session, props);
      await client.query('COMMIT');
      return response;
    } finally {
      client.release();
    }
  };
};
//# sourceMappingURL=withDBPages.js.map
