'use server';

import { ulid } from 'ulidx';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { getTTLValue, putTTLValue } from '@/lib/core/server/ttl-store';
import { decrypt, encrypt } from '@/lib/core/server/secure';
import { compare } from 'bcrypt-ts';
import logger from '@/lib/core/server/logger';
import { getPasswordRequirements } from '@/lib/common/password-utils';
import { PREFIX } from '@/lib/server/constants';
import type { PgPoolClient } from '@/lib/core/server/db';
import { sendServerEvent } from './server-events';

interface TokenInfo {
  email: string;
  /** SHA-256 hash of the reset token (hex). The plaintext token is never stored. */
  tokenHash: string;
  userName: string;
}

function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createPasswordResetToken(
  client: PgPoolClient,
  email: string,
  userName: string,
): Promise<{ key: string; token: string }> {
  const key = ulid();
  // 256 bits of CSPRNG entropy; only its hash is persisted (defends a TTL-store read).
  const token = randomBytes(32).toString('hex');
  await putTTLValue(client, key, { tokenHash: hashResetToken(token), email, userName }, 10 * 60);
  return { key, token: await encrypt(token) };
}

export async function validatePasswordResetToken(
  client: PgPoolClient,
  key: string,
  token: string,
  email: string,
  userName: string,
): Promise<boolean> {
  const info = await getTTLValue<TokenInfo>(client, key);
  if (!info) return false;
  let decryptedToken = '';
  try {
    decryptedToken = await decrypt(token);
  } catch (error) {
    logger.error('Error decrypting password reset token', { error });
    return false;
  }
  const expected = Buffer.from(info.tokenHash, 'hex');
  const actual = Buffer.from(hashResetToken(decryptedToken), 'hex');
  const tokenMatches = expected.length === actual.length && timingSafeEqual(expected, actual);
  return tokenMatches && info.email === email && info.userName === userName;
}

export async function validateNewPassword(password: string, previousPasswordHashes: string[]): Promise<string | null> {
  const requirements = getPasswordRequirements();
  for (const requirement of requirements) {
    if (!requirement.test(password)) {
      return requirement.message;
    }
  }
  // check if the password is not the same as the previous password
  for (const hash of previousPasswordHashes) {
    if (await compare(password, hash)) {
      return 'Password cannot be the same as the previous 3 passwords';
    }
  }
  return null;
}

export async function signOutAllUserSessions(con: PgPoolClient, userName: string) {
  const now = new Date().toISOString();

  await con.query(`UPDATE ${PREFIX}user_sessions SET signed_out_at = $1 WHERE user_name = $2`, [now, userName]);
  await con.query(
    `INSERT INTO ${PREFIX}user_sessions_arch (
              user_name,
              user_id,
              session_id,
              ip_address,
              user_agent,
              csrf_token,
              expires_at,
              signed_in_at,
              last_accessed_at,
              signed_out_at,
              app_id,
              metadata
            ) SELECT
              user_name,
              user_id,
              session_id,
              ip_address,
              user_agent,
              csrf_token,
              expires_at,
              signed_in_at,
              last_accessed_at,
              signed_out_at,
              app_id,
              metadata
            FROM ${PREFIX}user_sessions WHERE user_name = $1 AND signed_out_at IS NOT NULL`,
    [userName],
  );
  await con.query(`DELETE FROM ${PREFIX}user_sessions WHERE user_name = $1 AND signed_out_at IS NOT NULL`, [userName]);
  await sendServerEvent(con, 'clearSessionCache', { userName });
}
