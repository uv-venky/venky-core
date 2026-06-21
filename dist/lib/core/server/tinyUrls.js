import { customAlphabet } from 'nanoid';
import { getConfig } from '../../../lib/core/server/config';
import { PREFIX } from '../../../lib/server/constants';
import { UserError } from '../common/error';
const shortIdGenerator = customAlphabet('23456789abcdefghkmnpqrstuvwxyz', 8);
export async function createTinyUrl({ client, userName, url, expiresAt, isPublic = false }) {
  if (!url || typeof url !== 'string') {
    throw new UserError('URL is required');
  }
  try {
    new URL(url);
  } catch {
    throw new UserError('Invalid URL format');
  }
  let shortId;
  let attempts = 0;
  const maxAttempts = 10;
  const appId = getConfig('createTinyUrl').appId;
  do {
    shortId = shortIdGenerator();
    const result = await client.query(`SELECT 1 FROM ${PREFIX}tiny_urls WHERE short_id = $1 AND app_id = $2`, [
      shortId,
      appId,
    ]);
    if (result.rows.length === 0) {
      break;
    }
    attempts++;
  } while (attempts < maxAttempts);
  if (attempts >= maxAttempts) {
    throw new UserError('Failed to generate unique short ID');
  }
  await client.query(
    `INSERT INTO ${PREFIX}tiny_urls (short_id, original_url, user_name, app_id, expires_at) VALUES ($1, $2, $3, $4, $5)`,
    [shortId, url, userName, appId, expiresAt],
  );
  const baseUrl = process.env.APP_URL ?? 'https://APP_URL.missing';
  const shortenedUrl = `${baseUrl}/${isPublic ? 'p/' : ''}go/${shortId}`;
  return shortenedUrl;
}
export async function getOriginalUrl({ client, shortId }) {
  const appId = getConfig('getOriginalUrl').appId;
  const result = await client.query(
    `SELECT original_url FROM ${PREFIX}tiny_urls WHERE short_id = $1 AND (expires_at IS NULL OR expires_at > NOW()) AND app_id = $2`,
    [shortId, appId],
  );
  if (result.rows.length === 0) {
    return '/404';
  }
  const originalUrl = result.rows[0].original_url;
  await client.query(
    `UPDATE ${PREFIX}tiny_urls SET click_count = click_count + 1 WHERE short_id = $1 AND app_id = $2`,
    [shortId, appId],
  );
  return originalUrl;
}
//# sourceMappingURL=tinyUrls.js.map
