import type { Session } from '@/auth';
import type { PgPoolClient } from '@/lib/core/server/db';
import { createTinyUrl } from '@/lib/core/server/tinyUrls';
import { withDBSessionRoute } from '@/lib/core/server/withDBRoutes';

export const POST = withDBSessionRoute(async function callback(client: PgPoolClient, session: Session, req: Request) {
  const body = await req.json();
  const { url } = body;

  const shortenedUrl = await createTinyUrl({ client, userName: session.user.userName, url });

  return Response.json({
    status: 'OK',
    data: {
      shortenedUrl,
    },
  });
});
