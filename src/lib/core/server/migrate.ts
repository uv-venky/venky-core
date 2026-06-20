import { hashJobName, resetTransaction, withAdvisoryLock } from '@/lib/core/server/db';
import type { PgPoolClient } from '@/lib/core/server/db';
import { createUser } from '@/lib/core/server/user';
import logger from '@/lib/core/server/logger';
import { getConfig } from '@/lib/core/server/config';
import { getErrorMessage } from '@/lib/core/common/error';
import { runMigrations } from '@/lib/core/server/run-migrations';
import { ensureMigrationsTable } from '@/lib/core/server/ensure-migrations-table';
import { PREFIX } from '@/lib/server/constants';

async function install(client: PgPoolClient): Promise<void> {
  if (process.env.SKIP_MIGRATIONS === 'true') {
    logger.warn('Skipping migrations during install (SKIP_MIGRATIONS=true)');
    // Still create the migrations table and admin user even if skipping migrations
  } else {
    logger.info('Installing migrations...');
  }
  const config = getConfig('install');
  const email = config.init.admin.email;
  const password = config.init.admin.password;
  if (!email || !password) {
    logger.error('config.init.admin must be set!');
    process.exit(1);
  }
  await ensureMigrationsTable(client);
  if (process.env.SKIP_MIGRATIONS !== 'true') {
    await runMigrations(client, logger);
  }
  await createUser(
    client,
    'system',
    {
      userName: 'admin',
      email,
      displayName: 'Admin',
      password,
      locked: false,
      startDate: new Date().toISOString(),
      settings: { theme: 'light' },
      forcePasswordChange: false,
    },
    true,
  );
}

export async function migrate(): Promise<void> {
  if (process.env.SKIP_MIGRATIONS === 'true') {
    logger.info('------------------------------------------');
    logger.warn('Skipping migrations (SKIP_MIGRATIONS=true)');
    logger.info('------------------------------------------');
    return;
  }

  await withAdvisoryLock(hashJobName('migrate'), async (client) => {
    try {
      await client.query(`SELECT * FROM ${PREFIX}migrations WHERE 1 = 2`);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code !== '42P01') {
        logger.error(`Migration failed with error: ${getErrorMessage(error)}`);
        process.exit(1);
      }
      await resetTransaction(client);
      await install(client);
      return;
    }

    await runMigrations(client, logger);
  });
}
