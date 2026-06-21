import * as mysql from 'mysql2/promise';
import logger from '../../../lib/core/server/logger';
import { getErrorMessage } from '../../../lib/core/common/error';
import { getRetryTimeout, RETRY_ATTEMPTS } from '../../../lib/core/server/listener';
import fs from 'node:fs';
export function getPool() {
  if (globalThis._mysqlPool) {
    return globalThis._mysqlPool;
  }
  const {
    MYSQL_HOST = 'localhost',
    MYSQL_PORT = '3306',
    MYSQL_USER = 'root',
    MYSQL_PASSWORD = '',
    MYSQL_DATABASE = '',
    MYSQL_SSL_CA,
    MYSQL_SSL_CERT,
    MYSQL_SSL_KEY,
  } = process.env;
  let ssl;
  if (MYSQL_SSL_CA && MYSQL_SSL_CERT && MYSQL_SSL_KEY) {
    ssl = {
      ca: fs.readFileSync(MYSQL_SSL_CA).toString(),
      cert: fs.readFileSync(MYSQL_SSL_CERT).toString(),
      key: fs.readFileSync(MYSQL_SSL_KEY).toString(),
    };
  }
  logger.info(`Creating MySQL Pool for ${MYSQL_USER}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}`);
  globalThis._mysqlPool = mysql.createPool({
    host: MYSQL_HOST,
    port: Number(MYSQL_PORT),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    ssl,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
  });
  return globalThis._mysqlPool;
}
export async function getPoolStatus() {
  const pool = getPool();
  const idleCount = pool.pool?._freeConnections?.length ?? 0;
  const totalCount = pool.pool?._allConnections?.length ?? 0;
  const waitingCount = pool.pool?._connectionQueue?.length ?? 0;
  return {
    idleCount,
    totalCount,
    expiredCount: 0,
    waitingCount,
    listenerCount: 0,
  };
}
export const executeQuery = async (text, params) => {
  const client = await newClient();
  try {
    return await execute(client, text, params);
  } finally {
    client.release();
  }
};
export const execute = async (client, text, params) => {
  const start = Date.now();
  try {
    const [rows] = await client.execute(text, params);
    return { rows: rows };
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
const newClient = async () => {
  const pool = getPool();
  const client = await pool.getConnection();
  return client;
};
export const transactionWithRetry = async (callback) => {
  let attempt = 1;
  while (attempt < RETRY_ATTEMPTS) {
    try {
      const client = await newClient();
      try {
        await client.beginTransaction();
        const result = await callback(client);
        await client.commit();
        return result;
      } catch (e) {
        await client.rollback();
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
    await client.beginTransaction();
    const result = await callback(client);
    await client.commit();
    return [result, null];
  } catch (e) {
    await client.rollback();
    return [null, e];
  } finally {
    client.release();
  }
};
export async function resetTransaction(client) {
  await client.rollback();
  await client.beginTransaction();
}
export async function withAdvisoryLock(key, callback) {
  const client = await newClient();
  try {
    const [rows] = await client.query('SELECT GET_LOCK(?, 0) AS locked', [key.toString()]);
    if (!rows[0] || rows[0].locked !== 1) {
      return null;
    }
    try {
      await client.beginTransaction();
      const result = await callback(client);
      await client.commit();
      return result;
    } catch (e) {
      await client.rollback();
      throw e;
    } finally {
      await client.query('SELECT RELEASE_LOCK(?)', [key.toString()]);
    }
  } finally {
    client.release();
  }
}
//# sourceMappingURL=mysql.js.map
