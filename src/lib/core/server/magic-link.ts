'use server';

import { ulid } from 'ulidx';
import { consumeTTLValue, deleteTTLValue, getTTLValue, putTTLValue } from '@/lib/core/server/ttl-store';
import { decrypt, encrypt } from '@/lib/core/server/secure';
import logger from '@/lib/core/server/logger';
import type { PgPoolClient } from './db';
import { createTinyUrl } from './tinyUrls';
import type { Session } from '@/auth';
import { getMagicLinkDbLimiter } from './db-ratelimit';

export interface MasterTokenData<T> {
  userName: string;
  recipientEmail: string;
  metadata: T;
  expiresAt: string;
  linkType: string;
  redirectUrl: string;
}

export interface LoginTokenData<T> {
  masterTokenKey: string;
  userName: string;
  metadata: T;
  expiresAt: string;
  redirectUrl: string;
}

export interface GenerateMasterLinkParams<T> {
  userName: string;
  recipientEmail: string;
  ttlMinutes: number;
  metadata: T;
  redirectUrl: string;
  linkType: string;
}

export interface GenerateMasterLinkResult {
  masterLink: string;
  masterToken: string;
}

const DEFAULT_LOGIN_LINK_TTL_MINUTES = 15;

/**
 * Generates a master link that can be used to generate login links
 */
export async function generateMasterLink<T>(
  client: PgPoolClient,
  session: Session,
  params: GenerateMasterLinkParams<T>,
): Promise<GenerateMasterLinkResult> {
  const { userName, recipientEmail, ttlMinutes, metadata, redirectUrl, linkType } = params;

  if (ttlMinutes <= 0) {
    throw new Error('TTL must be greater than 0');
  }

  // Rate-limit per recipient email to prevent mailbox bombing / unbounded
  // token minting. 3/hour matches password-reset cadence.
  if (recipientEmail && (await getMagicLinkDbLimiter().isRateLimited(recipientEmail.toLowerCase()))) {
    throw new Error('Too many magic-link requests for this email. Please try again later.');
  }

  const masterTokenKey = `magic-link-master:${ulid()}`;
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();

  const masterTokenData: MasterTokenData<T> = {
    userName,
    recipientEmail,
    metadata,
    expiresAt,
    linkType,
    redirectUrl,
  };

  const ttlSeconds = ttlMinutes * 60;
  await putTTLValue(client, masterTokenKey, masterTokenData, ttlSeconds);

  // Encrypt the master token key for the URL
  const encryptedToken = await encrypt(masterTokenKey);
  const base64Token = Buffer.from(encryptedToken).toString('base64');
  const appUrl = process.env.APP_URL ?? 'https://APP_URL.missing';
  // Point to API route - consuming apps can own this route
  const masterLink = new URL(`/api/auth/magic-link/master/${base64Token}`, appUrl).toString();
  const tinyUrl = await createTinyUrl({
    client,
    userName: session.user.userName,
    url: masterLink,
    expiresAt,
    isPublic: true,
  });

  return {
    masterLink: tinyUrl,
    masterToken: base64Token,
  };
}

/**
 * Validates and retrieves master token data
 */
export async function validateMasterToken<T>(client: PgPoolClient, token: string): Promise<MasterTokenData<T> | null> {
  try {
    const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
    const masterTokenKey = await decrypt(decodedToken);

    if (!masterTokenKey.startsWith('magic-link-master:')) {
      logger.warn('Invalid master token key format', { masterTokenKey });
      return null;
    }

    const masterTokenData = await getTTLValue<MasterTokenData<T>>(client, masterTokenKey);
    if (!masterTokenData) {
      return null;
    }

    // Check if expired
    if (new Date(masterTokenData.expiresAt) < new Date()) {
      return null;
    }

    return masterTokenData;
  } catch (error) {
    logger.error('Error validating master token', { error, token });
    return null;
  }
}

/**
 * Deletes a master token
 */
export async function deleteMasterToken(client: PgPoolClient, token: string): Promise<void> {
  const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
  const masterTokenKey = await decrypt(decodedToken);

  if (!masterTokenKey.startsWith('magic-link-master:')) {
    logger.warn('Invalid master token key format', { masterTokenKey });
    throw new Error('Invalid master token format');
  }

  await deleteTTLValue(client, masterTokenKey);
}

/**
 * Generates a login link from a master token
 */
export async function generateLoginLink<T>(
  client: PgPoolClient,
  masterToken: string,
  loginLinkTtlMinutes: number = DEFAULT_LOGIN_LINK_TTL_MINUTES,
): Promise<{ loginLink: string; loginToken: string }> {
  const masterTokenData = await validateMasterToken<T>(client, masterToken);
  if (!masterTokenData) {
    throw new Error('Invalid or expired master token');
  }

  const loginTokenKey = `magic-link-login:${ulid()}`;
  const expiresAt = new Date(Date.now() + loginLinkTtlMinutes * 60 * 1000).toISOString();

  const loginTokenData: LoginTokenData<T> = {
    masterTokenKey: masterTokenData.userName, // Store reference to master token
    userName: masterTokenData.userName,
    metadata: masterTokenData.metadata,
    expiresAt,
    redirectUrl: masterTokenData.redirectUrl,
  };

  const ttlSeconds = loginLinkTtlMinutes * 60;
  await putTTLValue(client, loginTokenKey, loginTokenData, ttlSeconds);

  // Encrypt the login token key for the URL
  const encryptedToken = await encrypt(loginTokenKey);
  const base64Token = Buffer.from(encryptedToken).toString('base64');
  const appUrl = process.env.APP_URL ?? 'https://APP_URL.missing';
  // Point to API route - consuming apps can own this route
  const loginLink = new URL(`/api/auth/magic-link/login/${base64Token}`, appUrl).toString();
  const tinyUrl = await createTinyUrl({
    client,
    userName: masterTokenData.userName,
    url: loginLink,
    expiresAt: masterTokenData.expiresAt,
    isPublic: true,
  });
  return {
    loginLink: tinyUrl,
    loginToken: base64Token,
  };
}

/**
 * Validates and retrieves login token data
 */
async function consumeLoginToken<T>(client: PgPoolClient, token: string): Promise<LoginTokenData<T> | null> {
  try {
    const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
    const loginTokenKey = await decrypt(decodedToken);

    if (!loginTokenKey.startsWith('magic-link-login:')) {
      logger.warn('Invalid login token key format', { loginTokenKey });
      return null;
    }

    const loginTokenData = await consumeTTLValue<LoginTokenData<T>>(client, loginTokenKey);
    if (!loginTokenData) {
      return null;
    }

    // Check if expired
    if (new Date(loginTokenData.expiresAt) < new Date()) {
      return null;
    }

    return loginTokenData;
  } catch (error) {
    logger.error('Error validating login token', { error, token });
    return null;
  }
}

/**
 * Redeems a login token and returns session metadata
 * Note: This does NOT create the session - that's done in signIn
 */
export async function redeemLoginToken<T>(
  client: PgPoolClient,
  token: string,
): Promise<{
  userName: string;
  metadata: T;
  redirectUrl: string;
}> {
  const loginTokenData = await consumeLoginToken<T>(client, token);
  if (!loginTokenData) {
    throw new Error('Invalid or expired login token');
  }

  return {
    userName: loginTokenData.userName,
    metadata: loginTokenData.metadata,
    redirectUrl: loginTokenData.redirectUrl,
  };
}
