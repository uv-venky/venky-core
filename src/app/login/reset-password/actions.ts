'use server';

import { transaction, type PgPoolClient } from '@/lib/core/server/db';
import { sendPasswordResetEmail } from '@/lib/core/server/email';
import {
  createPasswordResetToken,
  signOutAllUserSessions,
  validateNewPassword,
  validatePasswordResetToken,
} from '@/lib/core/server/password-reset';
import { PREFIX } from '@/lib/server/constants';
import { z } from 'zod/v3';
import { getValidIpAddress, isUserActiveSync } from '@/lib/core/server/utils';
import { getRequestContext } from '@/lib/core/server/request-context';
import logger from '@/lib/core/server/logger';
import { getPasswordResetDbLimiter } from '@/lib/core/server/db-ratelimit';
import { isEmpty } from '@/lib/core/common/isEmpty';
import { decrypt } from '@/lib/core/server/secure';
import { hashPassword } from '@/auth';
import { deleteTTLValue } from '@/lib/core/server/ttl-store';
import { logActivity } from '@/lib/core/server/activity';
import { withDBAction } from '@/lib/core/server/withDBActions';
import type {
  ChangePasswordWithResetTokenInput,
  PasswordResetRequestInput,
  Result,
  User,
  ValidPasswordResetTokenType,
} from '@/app/login/reset-password/types';

export const requestPasswordReset = withDBAction(
  async (client, _prev: Result | undefined, formData: FormData): Promise<Result> => {
    const username = (formData.get('username') as string | null)?.trim().toLowerCase() ?? '';
    const email = (formData.get('email') as string | null)?.trim().toLowerCase() ?? '';
    return requestPasswordResetForUserWithClient(client, { username, email });
  },
);

async function requestPasswordResetForUserWithClient(
  client: PgPoolClient,
  input: PasswordResetRequestInput,
): Promise<Result> {
  const username = input.username.trim().toLowerCase();
  const email = input.email.trim().toLowerCase();
  const schema = z.string().email();
  const parsed = schema.safeParse(email);
  if (!parsed.success || isEmpty(username)) {
    return { status: 'ERROR', message: 'Invalid username or email' };
  }

  const headersList = await getRequestContext('reset-password').getHeaders();
  const ipAddress = getValidIpAddress(headersList);
  // Use the Postgres-backed limiter so the 3/hour limit holds across all
  // app instances. The in-memory limiter would let an attacker get 3N tries.
  const dbLimiter = getPasswordResetDbLimiter();
  if (await dbLimiter.isRateLimited(email)) {
    return { status: 'ERROR', message: 'Too many requests. Please try again later.' };
  }
  if (await dbLimiter.isRateLimited(ipAddress)) {
    return { status: 'ERROR', message: 'Too many requests. Please try again later.' };
  }

  const { rows } = await client.query<User>(
    `SELECT
      user_name,
      email,
      display_name,
      start_date,
      end_date,
      locked,
      password_hash
    FROM ${PREFIX}users WHERE lower(email) = $1 AND user_name = $2`,
    [email, username],
  );

  const user = rows[0];
  if (!user || !isUserActiveSync(user) || user.password_hash === 'SSO') {
    const userAgent = headersList.get('user-agent');
    if (!user) {
      logger.warn(`Password reset request for unknown email`, {
        email,
        ipAddress,
        userAgent,
      });
    } else if (user.password_hash === 'SSO') {
      logger.warn(`Password reset request for SSO user`, {
        email,
        ipAddress,
        userAgent,
      });
      return {
        status: 'ERROR',
        message: 'SSO users cannot reset their password here!',
      };
    } else {
      logger.warn(`Password reset request for inactive user`, {
        email,
        ipAddress,
        userAgent,
      });
    }
    return { status: 'OK' };
  }

  const { key, token } = await createPasswordResetToken(client, email, username);
  await sendPasswordResetEmail({
    client,
    email,
    key,
    token,
    userName: username,
  });

  return { status: 'OK' };
}

export async function requestPasswordResetForUser(input: PasswordResetRequestInput): Promise<Result> {
  return transaction(async (client) => requestPasswordResetForUserWithClient(client, input));
}

async function isValidPasswordResetTokenWithClient(
  client: PgPoolClient,
  encodedToken: string,
): Promise<false | ValidPasswordResetTokenType> {
  let decryptedToken = '';
  try {
    const decodedToken = Buffer.from(encodedToken, 'base64').toString('utf-8');
    decryptedToken = await decrypt(decodedToken);
  } catch (error) {
    logger.error('Error decrypting token', { error, encodedToken });
    return false;
  }
  const { key, token, email, userName } = JSON.parse(decryptedToken);

  const isValid = await validatePasswordResetToken(client, key, token, email, userName);
  if (!isValid) {
    return false;
  }
  return { key, userName };
}

export async function isValidPasswordResetToken(encodedToken: string): Promise<false | ValidPasswordResetTokenType> {
  return await transaction(async (client) => {
    return await isValidPasswordResetTokenWithClient(client, encodedToken);
  });
}

export async function validatePasswordResetTokenValue(
  encodedToken: string,
): Promise<false | ValidPasswordResetTokenType> {
  return isValidPasswordResetToken(encodedToken);
}

export async function changePasswordWithResetToken(input: ChangePasswordWithResetTokenInput): Promise<Result> {
  const encodedToken = input.token;
  const password = input.password;
  const confirmPassword = input.confirmPassword;

  if (isEmpty(encodedToken) || isEmpty(password) || isEmpty(confirmPassword)) {
    return { status: 'ERROR', message: 'Invalid request!' };
  }
  if (password !== confirmPassword) {
    return { status: 'ERROR', message: 'Passwords do not match' };
  }
  return await transaction(async (client): Promise<Result> => {
    const result = await isValidPasswordResetTokenWithClient(client, encodedToken);
    if (!result) {
      return { status: 'ERROR', message: 'Invalid token' };
    }
    const { key, userName } = result;
    const { rows } = await client.query<User & { previous_password_hashes: string[]; password_hash: string }>(
      `SELECT
      user_name,
      email,
      display_name,
      start_date,
      end_date,
      locked,
      previous_password_hashes,
      password_hash
    FROM ${PREFIX}users WHERE user_name = $1`,
      [userName],
    );
    const user = rows[0];
    if (!user || !isUserActiveSync(user)) {
      return { status: 'ERROR', message: 'User account is not active!' };
    }

    const headersList = await getRequestContext('reset-password-2').getHeaders();
    const ipAddress = getValidIpAddress(headersList);
    let previousPasswordHashes = [];
    previousPasswordHashes = Array.isArray(user.previous_password_hashes) ? user.previous_password_hashes : [];
    previousPasswordHashes.push(user.password_hash);
    previousPasswordHashes = previousPasswordHashes.slice(-3);
    const error = await validateNewPassword(password, previousPasswordHashes);
    if (error) {
      return { status: 'ERROR', message: error };
    }
    // update password
    const passwordHash = await hashPassword(password);
    await client.query(
      `UPDATE ${PREFIX}users SET force_password_change = false, password_hash = $1, last_password_reset = now(), last_password_reset_ip_address = $2, last_password_reset_by = $3, previous_password_hashes = $4::jsonb WHERE user_name = $5`,
      [passwordHash, ipAddress, user.user_name, JSON.stringify(previousPasswordHashes), user.user_name],
    );
    await deleteTTLValue(client, key);

    await signOutAllUserSessions(client, userName);

    await logActivity({
      userName: userName,
      eventType: 'Password Reset',
      eventId: userName,
      sessionId: 'N/A',
      createdAt: new Date().toISOString(),
      metadata: {
        ipAddress,
        userAgent: headersList.get('user-agent'),
      },
    });
    return { status: 'OK' };
  });
}

export async function changePassword(_prev: Result | undefined, formData: FormData): Promise<Result> {
  const token = formData.get('token') as string | null;
  const password = formData.get('password') as string | null;
  const confirmPassword = formData.get('confirmPassword') as string | null;

  return changePasswordWithResetToken({
    token: token ?? '',
    password: password ?? '',
    confirmPassword: confirmPassword ?? '',
  });
}
