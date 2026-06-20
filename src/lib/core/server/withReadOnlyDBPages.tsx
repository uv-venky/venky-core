/* Copyright (c) 2024-present Venky Corp. */
import { auth } from '@/auth';
import { newReadOnlyClient, type PgPoolReadOnlyClient } from '@/lib/core/server/db';
import type { Session } from '@/auth';

/**
 * Page wrapper that provides a readonly DB client.
 * No BEGIN/COMMIT — autocommit is sufficient for reads. Release always runs.
 */
export const withReadOnlyDBSessionPage = (
  callback: (
    client: PgPoolReadOnlyClient,
    session: Session,
    props: { params: Promise<any> },
  ) => Promise<React.ReactNode>,
) => {
  return async (props: { params: Promise<any> }): Promise<React.ReactNode> => {
    const session = await auth(true);
    if (!session) {
      return <div>Unauthorized</div>;
    }

    const client = await newReadOnlyClient();
    try {
      return await callback(client, session, props);
    } finally {
      client.release();
    }
  };
};
