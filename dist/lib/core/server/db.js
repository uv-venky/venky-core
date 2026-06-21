import pg, {} from 'pg';
import { getConfig } from '../../../lib/core/server/config';
import logger from '../../../lib/core/server/logger';
import { getErrorMessage } from '../../../lib/core/common/error';
import { getRetryTimeout, RETRY_ATTEMPTS } from '../../../lib/core/server/listener';
const { Pool } = pg;
const types = pg.types;
import fs from 'node:fs';
import crypto from 'node:crypto';
import { queryCached } from './query';
types.setTypeParser(types.builtins.NUMERIC, Number.parseFloat);
types.setTypeParser(types.builtins.INT8, Number.parseInt);
types.setTypeParser(types.builtins.INT4, Number.parseInt);
types.setTypeParser(types.builtins.INT2, Number.parseInt);
types.setTypeParser(types.builtins.FLOAT8, Number.parseFloat);
types.setTypeParser(types.builtins.FLOAT4, Number.parseFloat);
function buildPoolSsl() {
  const { PG_SSL_CA, PG_SSL_CERT, PG_SSL_KEY } = process.env;
  const allowInsecureDbTls = process.env.NODE_ENV !== 'production' && process.env.PG_SSL_ALLOW_SELF_SIGNED === 'true';
  const ssl = { rejectUnauthorized: !allowInsecureDbTls };
  if (PG_SSL_CA || PG_SSL_CERT || PG_SSL_KEY) {
    if (PG_SSL_CA) {
      logger.info('Using custom DB TLS CA bundle', { caPath: PG_SSL_CA });
      ssl.ca = fs.readFileSync(PG_SSL_CA).toString();
    }
    if (PG_SSL_CERT) {
      ssl.cert = fs.readFileSync(PG_SSL_CERT).toString();
    }
    if (PG_SSL_KEY) {
      ssl.key = fs.readFileSync(PG_SSL_KEY).toString();
    }
    if ((PG_SSL_CERT && !PG_SSL_KEY) || (!PG_SSL_CERT && PG_SSL_KEY)) {
      logger.warn(
        'DB TLS client certificate configuration is incomplete; both PG_SSL_CERT and PG_SSL_KEY are required',
      );
    }
  } else {
    logger.info('No custom DB TLS certificates configured; using the system trust store for server verification');
  }
  if (allowInsecureDbTls) {
    logger.warn('Database TLS certificate verification is disabled for local development');
  }
  return ssl;
}
function getPgSearchPath() {
  return process.env.VENKY_PG_SEARCH_PATH ?? 'core,public';
}
function attachPoolSearchPath(pool) {
  const searchPath = getPgSearchPath();
  pool.on('connect', (client) => {
    void client.query(`SET search_path TO ${searchPath}`);
  });
}
export function getPool() {
  if (globalThis._pool) {
    return globalThis._pool;
  }
  const dbUrl = getConfig('db').dbUrl;
  const url = new URL(dbUrl);
  url.password = '*****';
  logger.info(`Creating DB Pool with URL: ${url.toString()}`);
  globalThis._pool = new Pool({
    connectionString: dbUrl,
    ssl: buildPoolSsl(),
    max: 20,
    idleTimeoutMillis: 120000,
    connectionTimeoutMillis: 60000,
    application_name: `venky-server-${process.pid}`,
  });
  attachPoolSearchPath(globalThis._pool);
  return globalThis._pool;
}
export function getReadOnlyPool() {
  if (globalThis._readonlyPool) {
    return globalThis._readonlyPool;
  }
  const { dbUrl, readonlyDbUrl } = getConfig('db');
  // Production deployments must provision a separate readonly DB role/URL.
  // Falling back to the primary URL means the only barrier between an
  // injected query and a write is the session-level
  // default_transaction_read_only flag — fine for dev, not acceptable for
  // prod where a runtime escape would touch the writable role's grants.
  // Set VENKY_ALLOW_RO_FALLBACK=1 to opt out (e.g. single-instance demos).
  if (!readonlyDbUrl && process.env.NODE_ENV === 'production' && process.env.VENKY_ALLOW_RO_FALLBACK !== '1') {
    throw new Error(
      'readonlyDbUrl is required in production. Provision a separate read-only Postgres role and set db.readonlyDbUrl in config (or set VENKY_ALLOW_RO_FALLBACK=1 to acknowledge the fallback).',
    );
  }
  const effectiveUrl = readonlyDbUrl ?? dbUrl;
  const isFallback = !readonlyDbUrl;
  const url = new URL(effectiveUrl);
  url.password = '*****';
  logger.info(`Creating readonly DB Pool with URL: ${url.toString()}${isFallback ? ' (falling back to primary)' : ''}`);
  const pool = new Pool({
    connectionString: effectiveUrl,
    ssl: buildPoolSsl(),
    max: 20,
    idleTimeoutMillis: 120000,
    connectionTimeoutMillis: 60000,
    application_name: `venky-server-ro-${process.pid}`,
  });
  attachPoolSearchPath(pool);
  globalThis._readonlyPool = pool;
  return pool;
}
export async function getPoolStatus() {
  const pool = getPool();
  const { idleCount, totalCount, expiredCount, waitingCount } = pool;
  return {
    idleCount,
    totalCount,
    expiredCount,
    waitingCount,
    listenerCount: pool.listenerCount('VENKY_events'),
  };
}
export async function getReadOnlyPoolStatus() {
  const pool = getReadOnlyPool();
  const { idleCount, totalCount, expiredCount, waitingCount } = pool;
  return {
    idleCount,
    totalCount,
    expiredCount,
    waitingCount,
    listenerCount: pool.listenerCount('VENKY_events'),
  };
}
export const executeQuery = async (text, params) => {
  const client = await getPool().connect();
  try {
    return execute(client, text, params);
  } finally {
    client.release();
  }
};
export const execute = async (client, text, params) => {
  const start = Date.now();
  try {
    const res = await client.query(text, params);
    return res;
  } catch (e) {
    const duration = Date.now() - start;
    if (logger.debugEnabled) {
      logger.debug('error executing query', {
        text,
        params,
        duration,
        error: e.message,
      });
    }
    throw e;
  }
};
function attachQueryCached(client) {
  async function query(sql, params, options) {
    if (!options?.skipCache) {
      return queryCached(client, sql, params, options);
    }
    return client.query(sql, params);
  }
  return Object.assign(client, { queryCached: query });
}
export const newClient = async () => {
  const client = await getPool().connect();
  return attachQueryCached(client);
};
const READONLY_INITIALIZED = Symbol.for('venky.pgPoolReadOnlyInitialized');
export const newReadOnlyClient = async () => {
  const client = await getReadOnlyPool().connect();
  try {
    const marker = client;
    if (!marker[READONLY_INITIALIZED]) {
      // Enforce read-only at the session level. Done here (not via pool.on('connect'))
      // so the SET is awaited before the client is handed out; pg ignores the return
      // value of connect listeners, which would create a race with the first query.
      await client.query('SET default_transaction_read_only = on');
      marker[READONLY_INITIALIZED] = true;
    }
  } catch (err) {
    client.release();
    throw err;
  }
  return attachQueryCached(client);
};
// Variadic rest-args so TS infers each query's result type independently
// (preserves positional tuple). Calling `parallelReadQueries([fn1, fn2])`
// would collapse callbacks to `ReadQueryFn<unknown>[]` and lose per-slot
// typing; calling `parallelReadQueries(fn1, fn2)` keeps the tuple shape.
export async function parallelReadQueries(...queries) {
  // Pre-sized array keeps result/client indices aligned even if some
  // checkouts reject under Promise.all (the rejecter throws, the
  // resolved ones still populate their slots and get released below).
  const clients = new Array(queries.length);
  try {
    await Promise.all(
      queries.map(async (_, i) => {
        clients[i] = await newReadOnlyClient();
      }),
    );
    const results = await Promise.all(queries.map((q, i) => q(clients[i])));
    return results;
  } finally {
    for (const c of clients) {
      if (!c) continue;
      try {
        c.release();
      } catch {
        // pg client.release() can throw if the connection already errored;
        // we're in cleanup, so swallow.
      }
    }
  }
}
/**
 * Builds lazy-loading DB accessors for a request/tool lifetime.
 *
 * `getWritableClient` always returns the provided writable client — callers
 * pass in the one the request wrapper already acquired (e.g. from
 * withDBSessionRoute), so writes run in the wrapper's transaction.
 *
 * `getClient` lazily acquires a readonly client on first call and caches it.
 * If no tool ever reads, no readonly connection is opened. Call `release()`
 * once the lifetime ends to return the readonly client to the pool.
 */
export function makeLazyDbAccessors(writableClient) {
  let readonly;
  return {
    getClient: async () => {
      if (!readonly) {
        readonly = await newReadOnlyClient();
      }
      return readonly;
    },
    getWritableClient: async () => writableClient,
    release: () => {
      if (readonly) {
        try {
          readonly.release();
        } catch (err) {
          logger.error('Error releasing readonly client', { error: err.message });
        }
        readonly = undefined;
      }
    },
  };
}
/**
 * Builds DB accessors for streaming lifetimes (e.g. chat routes).
 *
 * Unlike request-scoped accessors, writable and readonly clients are both
 * lazily acquired and owned by this accessor, then released explicitly via
 * `release()` once streaming completes.
 */
export function makeStreamingDbAccessors() {
  let readonly;
  let writable;
  return {
    getClient: async () => {
      if (!readonly) {
        readonly = await newReadOnlyClient();
      }
      return readonly;
    },
    getWritableClient: async () => {
      if (!writable) {
        writable = await newClient();
      }
      return writable;
    },
    release: () => {
      if (readonly) {
        try {
          readonly.release();
        } catch (err) {
          logger.error('Error releasing readonly client', { error: err.message });
        }
        readonly = undefined;
      }
      if (writable) {
        try {
          writable.release();
        } catch (err) {
          logger.error('Error releasing writable client', { error: err.message });
        }
        writable = undefined;
      }
    },
  };
}
export const transactionWithRetry = async (callback) => {
  let attempt = 1;
  while (attempt < RETRY_ATTEMPTS) {
    try {
      const client = await getPool().connect();
      try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    } catch (e) {
      logger.error('Error getting db connection:', getErrorMessage(e));
      await new Promise((resolve) => setTimeout(resolve, getRetryTimeout(attempt++)));
    }
  }
  process.exit(1);
};
export const transaction = async (callback) => {
  const client = await newClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};
export async function resetTransaction(client) {
  await client.query('ROLLBACK');
  await client.query('BEGIN');
}
export function hashJobName(name) {
  const digest = crypto.createHash('sha256').update(name).digest('hex').slice(0, 15);
  return BigInt(`0x${digest}`);
}
export async function withAdvisoryLock(key, callback) {
  const client = await newClient();
  try {
    const res = await client.query('SELECT pg_try_advisory_lock($1) AS locked', [key]);
    if (!res.rows[0]?.locked) {
      return null;
    }
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      await client.query('SELECT pg_advisory_unlock($1)', [key]);
    }
  } finally {
    client.release();
  }
}
/** Blocks until the advisory lock is available, then runs callback in a transaction. */
export async function withBlockingAdvisoryLock(key, callback) {
  const client = await newClient();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [key]);
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      await client.query('SELECT pg_advisory_unlock($1)', [key]);
    }
  } finally {
    client.release();
  }
}
//# sourceMappingURL=db.js.map
