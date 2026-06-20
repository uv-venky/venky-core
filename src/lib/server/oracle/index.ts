'use server';

import oracledb from 'oracledb';

let pool: oracledb.Pool;

async function initOraclePool() {
  if (pool) {
    return pool;
  }
  oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
  const { ORACLE_CLIENT_PATH, ORACLE_USER, ORACLE_PASSWORD, ORACLE_CONNECT_STRING } = process.env;
  if (!ORACLE_CLIENT_PATH || !ORACLE_USER || !ORACLE_PASSWORD || !ORACLE_CONNECT_STRING) {
    throw new Error('Missing Oracle environment variables');
  }
  const clientOpts = { libDir: ORACLE_CLIENT_PATH };
  oracledb.initOracleClient(clientOpts);
  oracledb.autoCommit = false;
  pool = await oracledb.createPool({
    user: ORACLE_USER,
    password: ORACLE_PASSWORD,
    connectString: ORACLE_CONNECT_STRING,
    poolMax: 50,
    poolMin: 3,
    poolIncrement: 1,
  });
}

export async function executeOracleQuery<T extends object>(query: string, params: unknown[]): Promise<T[]> {
  await initOraclePool();
  const connection = await oracledb.getConnection();
  try {
    const result = await connection.execute(query, params);
    return result.rows as T[];
  } finally {
    await connection.rollback();
    await connection.close();
  }
}
