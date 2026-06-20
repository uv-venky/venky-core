import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { PREFIX } from '@/lib/server/constants';
import type { PgPoolClient } from './db';
import { getErrorMessage } from '../common/error';
import type { LoggerType } from './logger';

function generateChecksum(str: string) {
  return crypto.createHash('md5').update(str.replace(/\r\n/g, '\n'), 'utf8').digest('hex');
}

function isEnvTruthy(value: string | undefined): boolean {
  if (value === undefined) return false;
  const v = value.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

/** Dev-only escape hatch when a migration file was edited after it was applied. */
function ignoreMigrationChecksumMismatchInDev(): boolean {
  return process.env.NODE_ENV === 'development' && isEnvTruthy(process.env.VENKY_IGNORE_MIGRATION_CHECKSUM_MISMATCH);
}

const directory = path.join(process.cwd(), 'migrations');

export async function runMigrations(client: PgPoolClient, logger: LoggerType) {
  const filePaths = (await fs.promises.readdir(directory)).filter((file) => !file.startsWith('.'));
  filePaths.sort();

  const installed_scripts = await client.query(
    `SELECT version, name, checksum FROM ${PREFIX}migrations ORDER BY version ASC`,
  );

  for (const row of installed_scripts.rows) {
    const idx = filePaths.indexOf(`${row.version}_${row.name}.sql`);
    if (idx > -1) {
      const content = await fs.promises.readFile(path.join(directory, `${row.version}_${row.name}.sql`), 'utf-8');
      const checksum = generateChecksum(content);
      if (checksum !== row.checksum) {
        const msg = `Checksum mismatch for migration ${row.version}_${row.name}.sql ${checksum} != ${row.checksum}`;
        if (ignoreMigrationChecksumMismatchInDev()) {
          logger.warn(`${msg} (ignored in development because VENKY_IGNORE_MIGRATION_CHECKSUM_MISMATCH is set)`);
        } else {
          logger.error(msg);
          process.exit(1);
        }
      }
      filePaths.splice(idx, 1);
    }
  }

  if (filePaths.length === 0) {
    logger.info('-------------------------');
    logger.info('No new migrations to run!');
    logger.info('-------------------------');
    return;
  }
  logger.warn(`About to run ${filePaths.length} migrations...`);
  logger.warn(`Migrations: ${filePaths.join(', ')}`);

  for (const file of filePaths) {
    const parts = file.split('_');
    const versionStr = parts.shift();
    const version = Number(versionStr);
    if (Number.isNaN(version)) {
      logger.error(`Invalid migration file: ${file}! Expected version number!`);
      process.exit(1);
    }
    const name = parts.join('_').split('.')[0];
    if (file !== `${versionStr}_${name}.sql`) {
      logger.error(`Invalid migration file: ${file}! Expected ${versionStr}_${name}.sql`);
      process.exit(1);
    }
    const content = await fs.promises.readFile(path.join(directory, file), 'utf-8');
    const start = Date.now();
    logger.info(`Running migration: ${file}`);
    try {
      await client.query(content);
    } catch (error) {
      logger.error(`Migration ${file} failed with error: ${getErrorMessage(error)}`);
      process.exit(1);
    }
    const duration = Date.now() - start;
    logger.info(`Migration ${file} completed in ${duration}ms`);
    const checksum = generateChecksum(content);
    await client.query(
      `INSERT INTO ${PREFIX}migrations(version, name, success, checksum, execution_time)
          VALUES($1, $2, $3, $4, $5)`,
      [version, name, true, checksum, duration],
    );
  }
}
