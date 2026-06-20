#!/usr/bin/env node
/**
 * scripts/migrate.ts
 *
 * Usage:
 *   tsx scripts/migrate.ts add <migration_name>
 *   tsx scripts/migrate.ts run
 */

import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { ensureMigrationsTable } from '../src/lib/core/server/ensure-migrations-table';
import { runMigrations } from '../src/lib/core/server/run-migrations';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getPgClient() {
  dotenv.config();
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set.');
  }

  const client = new pg.Client({
    connectionString: databaseUrl,
  });

  await client.connect();
  return client;
}

async function addMigration(rawName: string | undefined) {
  if (!rawName) {
    console.error('Usage: migrate.ts add <migration_name>');
    process.exit(1);
  }

  const name = rawName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const fileName = `${date}_${name}.sql`;

  const migrationsDir = path.resolve(process.cwd(), 'migrations');
  const filePath = path.join(migrationsDir, fileName);

  await fs.mkdir(migrationsDir, { recursive: true });

  const template = `-- Migration: ${fileName}

-- Write your SQL statements below. The framework will wrap this file in a transaction.
`;

  await fs.writeFile(filePath, template, { flag: 'wx' });
  console.info(`✔ Created migration: ${path.relative(process.cwd(), filePath)}`);
}

async function executeMigrations() {
  if (process.env.SKIP_MIGRATIONS === 'true') {
    console.warn('⚠ Skipping migrations (SKIP_MIGRATIONS=true)');
    return;
  }

  try {
    const client = await getPgClient();
    try {
      await ensureMigrationsTable(client);
      await runMigrations(client, console as any);
      console.info('✔ Migrations run successfully');
    } finally {
      await client.end();
    }
  } catch (err) {
    console.error('✖ Migration run failed:', err);
    process.exit(1);
  }
}

async function main() {
  const [, , command, arg] = process.argv;

  switch (command) {
    case 'add':
      await addMigration(arg);
      break;

    case 'run':
      await executeMigrations();
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.error('Usage: migrate.ts <add|run> [migration_name]');
      process.exit(1);
  }
}

main()
  .catch((err) => {
    console.error('✖ Error:', err);
  })
  .finally(() => {
    process.exit(0);
  });
