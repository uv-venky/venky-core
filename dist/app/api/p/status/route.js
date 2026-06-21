/* Copyright (c) 2024-present Venky Corp. */
import os from 'node:os';
import { UserError } from '../../../../lib/core/common/error';
import { getConfig } from '../../../../lib/core/server/config';
import { getPoolStatus } from '../../../../lib/core/server/db';
import logger from '../../../../lib/core/server/logger';
import { withDBRoute } from '../../../../lib/core/server/withDBRoutes';
import { PREFIX } from '../../../../lib/server/constants';
import { getAllDataSources } from '../../../../lib/server/ds/defs/ds';
function validateBearerToken(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}
export const GET = withDBRoute(async function callback(client, req) {
  const token = validateBearerToken(req);
  if (!token) {
    throw new UserError('Unauthorized: Missing or invalid bearer token');
  }
  const appId = getConfig('statusToken').appId;
  // Find app by status_token
  const appResult = await client.query(
    `SELECT app_id, name, full_url FROM ${PREFIX}apps WHERE status_token = $1 AND app_id = $2`,
    [token, appId],
  );
  if (appResult.rows.length === 0) {
    throw new UserError('Unauthorized: Invalid bearer token');
  }
  const appName = appResult.rows[0].name;
  const rolesResult = await client.query(`SELECT COUNT(1) as count FROM ${PREFIX}roles WHERE app_id = $1`, [appId]);
  const rolesCount = rolesResult.rows[0]?.count ?? 0;
  // Get active users count
  let activeUsersCount = 0;
  try {
    const usersResult = await client.query(
      `SELECT COUNT(DISTINCT us.user_name) as count 
         FROM ${PREFIX}user_sessions us
         INNER JOIN ${PREFIX}users u ON us.user_name = u.user_name
         WHERE us.app_id = $1 
           AND u.locked = false 
           AND (u.end_date IS NULL OR u.end_date > NOW())
           AND us.expires_at > NOW()
           AND us.signed_out_at IS NULL`,
      [appId],
    );
    activeUsersCount = Number.parseInt(usersResult.rows[0]?.count || '0', 10);
  } catch (error) {
    logger.error('Failed to get active users count:', error);
  }
  // Get datasources count
  const datasources = getAllDataSources();
  const datasourcesCount = Object.keys(datasources).length;
  // Get database pool status
  const poolStatus = await getPoolStatus();
  // Get memory and CPU stats
  const memoryUsage = process.memoryUsage();
  const systemMemory = {
    total: os.totalmem(),
    free: os.freemem(),
    used: os.totalmem() - os.freemem(),
  };
  const cpus = os.cpus();
  const cpuUsage = {
    cores: cpus.length,
    model: cpus[0]?.model || 'unknown',
  };
  return Response.json({
    status: 'OK',
    appId,
    appName,
    timestamp: new Date().toISOString(),
    metrics: {
      roles: rolesCount,
      activeUsers: activeUsersCount,
      datasources: datasourcesCount,
      database: {
        connections: {
          total: poolStatus.totalCount,
          idle: poolStatus.idleCount,
          active: poolStatus.totalCount - poolStatus.idleCount,
          waiting: poolStatus.waitingCount,
          expired: poolStatus.expiredCount,
        },
      },
      memory: {
        process: {
          rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)}MB`,
          heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
          heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        },
        system: {
          total: `${(systemMemory.total / 1024 / 1024 / 1024).toFixed(2)}GB`,
          free: `${(systemMemory.free / 1024 / 1024 / 1024).toFixed(2)}GB`,
          used: `${(systemMemory.used / 1024 / 1024 / 1024).toFixed(2)}GB`,
        },
      },
      cpu: cpuUsage,
      uptime: process.uptime(),
    },
  });
});
export const runtime = 'nodejs';
//# sourceMappingURL=route.js.map
