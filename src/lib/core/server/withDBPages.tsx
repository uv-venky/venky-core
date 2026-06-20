import { auth } from '@/auth';
import { newClient, type PgPoolClient } from '@/lib/core/server/db';
import type { Session } from '@/auth';

export const withDBSessionPage = (
  callback: (client: PgPoolClient, session: Session, props: { params: Promise<any> }) => Promise<React.ReactNode>,
) => {
  return async (props: { params: Promise<any> }): Promise<React.ReactNode> => {
    const session = await auth(true);
    if (!session) {
      return <div>Unauthorized</div>;
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
