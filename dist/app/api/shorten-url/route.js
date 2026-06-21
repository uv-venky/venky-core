import { createTinyUrl } from '../../../lib/core/server/tinyUrls';
import { withDBSessionRoute } from '../../../lib/core/server/withDBRoutes';
export const POST = withDBSessionRoute(async function callback(client, session, req) {
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
//# sourceMappingURL=route.js.map
