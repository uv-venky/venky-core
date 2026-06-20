import { withDBSessionRoute } from '@/lib/core/server/withDBRoutes';
import { PREFIX } from '@/lib/server/constants';
import type { PgPoolClient } from '@/lib/core/server/db';
import type { Session } from '@/auth';
import { UserError } from '@/lib/core/common/error';

export const DELETE = withDBSessionRoute(
  async (
    client: PgPoolClient,
    session: Session,
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    const { id } = await params;

    if (process.env.ENABLE_SQL_BROWSER !== 'true') {
      throw new UserError('SQL browser is disabled');
    }

    if (!session.user.roles.includes('admin')) {
      throw new UserError('Access restricted to admins');
    }

    if (!id) {
      throw new UserError('History ID is required');
    }

    const deleteQuery = `
      DELETE FROM ${PREFIX}sql_history 
      WHERE id = $1 AND created_by = $2
    `;

    const result = await client.query(deleteQuery, [id, session.user.userName]);

    if (result.rowCount === 0) {
      throw new UserError('History item not found');
    }

    return Response.json({ status: 'OK' });
  },
);
