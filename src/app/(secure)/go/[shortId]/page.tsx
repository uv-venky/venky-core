import { redirect } from '@/lib/core/server/redirect';
import { transaction } from '@/lib/core/server/db';
import { getOriginalUrl } from '@/lib/core/server/tinyUrls';

interface Props {
  params: Promise<{ shortId: string }>;
}

export default async function TinyUrlPage({ params }: Props) {
  const { shortId } = await params;
  await transaction(async (client) => {
    const originalUrl = await getOriginalUrl({ client, shortId });
    redirect(originalUrl);
  });
}
