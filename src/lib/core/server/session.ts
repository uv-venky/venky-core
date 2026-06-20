'use server';

import fs from 'node:fs';
import path from 'node:path';
import type { SessionMetadata, UserSession } from '@/lib/core/common/types/UserSession';
import type { UserSettings } from '@/lib/core/common/types/UserSettings';
import { executeQuery } from '@/lib/core/server/db';
import { auth, getUserRoles } from '@/auth';
import { UserError } from '@/lib/core/common/error';
import { PREFIX } from '@/lib/server/constants';
import type { Env } from '@/app/(secure)/EnvProvider';
import type { PgPoolClient } from '@/lib/core/server/db';
import logger from '@/lib/core/server/logger';
import type { Session } from '@/auth';
import { getUserTeams } from './sidebar';
import { getConfig, type AppConfig, type SmtpOptions } from '@/lib/core/server/config';

/** Skip metadata that would blow up JSON payloads / client deep-clone (e.g. accidental huge blobs in DB). */
const MAX_SESSION_METADATA_CHARS = 50_000;

function clientSafeSessionMetadata(raw: SessionMetadata | undefined): SessionMetadata | undefined {
  if (raw == null) return undefined;
  try {
    const s = JSON.stringify(raw);
    if (s.length > MAX_SESSION_METADATA_CHARS) {
      logger.warn('Session metadata too large; omitting from client session', { length: s.length });
      return undefined;
    }
    return raw;
  } catch {
    return undefined;
  }
}

export async function getUserSession(): Promise<UserSession | null> {
  const session = await auth();
  const { userName } = session?.user ?? {};
  if (!userName || !session?.id) {
    return null;
  }

  const appId = getConfig('getUserSession').appId;
  const result = await executeQuery<{
    email: string;
    display_name: string;
    picture: string;
    settings: UserSettings;
    user_id?: number;
    metadata?: SessionMetadata;
  }>(
    `SELECT
      u.email,
      u.display_name,
      u.user_id,
      u.picture,
      u.settings,
      s.metadata
    FROM ${PREFIX}users u
    LEFT JOIN ${PREFIX}user_sessions s ON s.session_id = $2 AND s.app_id = $3
    WHERE u.user_name = $1`,
    [userName, session.id, appId],
  );
  const user = result.rows[0];

  if (!user) {
    throw new UserError(`User not found: ${userName}`);
  }

  const userSession: UserSession = {
    id: session.id,
    name: user.display_name,
    email: user.email,
    image: user.picture,
    userName,
    userId: user.user_id,
    roles: await getUserRoles(userName),
    settings: user.settings,
    teams: await getUserTeams(session),
    metadata: clientSafeSessionMetadata(user.metadata),
  };

  return userSession;
}

export async function getEnvironment(): Promise<Env> {
  const env: Env = {
    APP_ID: getConfig('getEnvironment').appId ?? 'APP_ID_NOT_SET',
    ...(process.env.CLOUDIO_API_URL ? { CLOUDIO_API_URL: process.env.CLOUDIO_API_URL } : {}),
  };

  return env;
}

/**
 * Get the app config for devtools display.
 * Note: Add any new non-sensitive values to be displayed in the devtools to the config object.
 */
export async function getAppConfigForDevtools(): Promise<Omit<AppConfig, 'secret'>> {
  const config = getConfig('getAppConfig');
  const url = new URL(config.dbUrl);
  url.password = '*****';
  // obfuscate all but the first and last part of the host
  const host = url.host.split('.');
  const obfuscatedHost = host
    .slice(1, -1)
    .map((part) => {
      return '*'.repeat(part.length);
    })
    .join('.');
  url.host = [host[0], obfuscatedHost, host[host.length - 1]].join('.');
  const sanitizedConfig: Omit<AppConfig, 'secret'> = {
    appId: config.appId,
    schedulerId: config.schedulerId,
    smtp: config.smtp
      ? {
          from: config.smtp.from,
          host: config.smtp.host,
          port: config.smtp.port,
          secure: config.smtp.secure,
          requireTLS: config.smtp.requireTLS,
          auth: config.smtp.auth ? { user: 'auth hidden by devtools' } : undefined,
        }
      : (null as unknown as SmtpOptions),
    pythonService: config.pythonService,
    init: { admin: { email: config.init.admin.email, password: 'password hidden by devtools' } },
    dbUrl: url.toString(),
    orgName: config.orgName,
    adminAlertEmails: config.adminAlertEmails,
    features: config.features,
  };
  return sanitizedConfig;
}

export interface SystemInfo {
  coreVersion: string;
  nodeVersion: string;
  nextVersion: string;
}

export async function getSystemInfo(): Promise<SystemInfo> {
  const cwd = process.cwd();
  let coreVersion = 'unknown';
  let nextVersion = 'unknown';
  const packageJsonPath = path.join(cwd, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as {
    name?: string;
    version?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  if (packageJson.name === 'venky-core') {
    coreVersion = packageJson.version ?? 'unknown';
  } else {
    coreVersion = packageJson.dependencies?.['venky-core'] ?? 'unknown';
  }
  nextVersion = packageJson.dependencies?.next ?? packageJson.devDependencies?.next ?? 'unknown';
  return {
    coreVersion,
    nodeVersion: process.version,
    nextVersion,
  };
}

type DBUserRow = {
  user_name: string;
  user_id: number | null;
  email: string;
  display_name: string;
  settings: UserSettings;
};

export async function makeBackgroundJobSession(
  client: PgPoolClient,
  userName: string,
  jobId: string,
): Promise<Session | null> {
  const { rows: userRows } = await client.query<DBUserRow>(
    `SELECT user_name, user_id, email, display_name, settings FROM ${PREFIX}users WHERE user_name = $1`,
    [userName],
  );
  if (userRows.length === 0) {
    logger.warn(`User ${userName} not found; cannot create background job session`);
    return null;
  }

  const appId = getConfig('makeBackgroundJobSession').appId;
  const { rows: roleRows } = await client.query<{ role_code: string }>(
    `SELECT r.role_code FROM ${PREFIX}user_roles ur, ${PREFIX}roles r 
    WHERE ur.role_code = r.role_code
      AND ur.user_name = $1 
      AND ur.start_date <= now() 
      AND (ur.end_date IS NULL OR ur.end_date >= now())
      AND r.start_date <= now() 
      AND (r.end_date IS NULL OR r.end_date >= now())
      AND r.app_id IN ($2, 'core')`,
    [userName, appId],
  );

  const dbUser = userRows[0];
  const session: Session = {
    id: `job:${jobId}`,
    user: {
      userName: dbUser.user_name,
      userId: dbUser.user_id ?? undefined,
      email: dbUser.email,
      name: dbUser.display_name,
      roles: roleRows.map((r) => r.role_code),
      sessionIndex: undefined,
      forcePasswordChange: false,
      settings: dbUser.settings,
    },
    expires: new Date(Date.now() + 1000 * 600).toISOString(),
  };
  return session;
}
