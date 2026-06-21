import { redirect } from '../../../../lib/core/server/redirect';
import { transaction } from '../../../../lib/core/server/db';
import { getOriginalUrl } from '../../../../lib/core/server/tinyUrls';
export default async function TinyUrlPage({ params }) {
  const { shortId } = await params;
  await transaction(async (client) => {
    const originalUrl = await getOriginalUrl({ client, shortId });
    redirect(originalUrl);
  });
}
//# sourceMappingURL=page.js.map
