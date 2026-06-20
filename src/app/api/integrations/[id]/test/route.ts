import { withDBSessionRoute } from '@/lib/core/server/withDBRoutes';
import type { Session } from '@/auth';
import type { PgPoolClient } from '@/lib/core/server/db';
import { getIntegration } from '@/lib/db/integrations';

export const POST = withDBSessionRoute(async function callback(
  _client: PgPoolClient,
  session: Session,
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const integration = await getIntegration(id, session.user.userName);

  if (!integration) {
    return Response.json({ status: 'error', message: 'Integration not found' }, { status: 404 });
  }

  // TODO: Implement actual connection testing based on integration type
  // For now, just return success
  return Response.json({
    status: 'success',
    message: 'Connection test not yet implemented',
  });
});

export const runtime = 'nodejs';
