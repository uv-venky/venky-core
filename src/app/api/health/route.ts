/* Copyright (c) 2024-present Venky Corp. */

'use server';

import { executeQuery, getPoolStatus, getReadOnlyPoolStatus } from '@/lib/core/server/db';
import logger from '@/lib/core/server/logger';
import os from 'node:os';
import { withSessionRoute } from '@/lib/core/server/withDBRoutes';
import type { Session } from '@/auth';
import { UserError } from '@/lib/core/common/error';
import { APP_VERSION } from '@/lib/app-info';

export const GET = withSessionRoute(async function GET(session: Session) {
  if (!session.user.roles.includes('admin')) {
    throw new UserError('Access denied');
  }

  const startTime = performance.now();
  let dbStatus = 'unknown';
  let dbResponseTime = 0;

  try {
    // Check database connectivity with simple query
    const dbStart = performance.now();
    const result: { rows: { health_check: number }[] } = await executeQuery('SELECT 1 as health_check', []);
    dbResponseTime = performance.now() - dbStart;
    dbStatus = result?.rows?.[0]?.health_check === 1 ? 'healthy' : 'degraded';
  } catch (error) {
    logger.error('Health check - Database error:', error);
    dbStatus = 'unhealthy';
  }

  const [poolStatus, readonlyPoolStatus] = await Promise.all([getPoolStatus(), getReadOnlyPoolStatus()]);

  // Collect memory usage statistics
  const memoryUsage = process.memoryUsage();
  const systemMemory = {
    total: os.totalmem(),
    free: os.freemem(),
    used: os.totalmem() - os.freemem(),
  };

  // Get CPU information
  const cpus = os.cpus();
  const cpuModel = cpus[0]?.model || 'Unknown';
  const cpuCores = cpus.length;
  const loadAverage = os.loadavg();

  // Calculate response time for this request
  const responseTime = performance.now() - startTime;

  const healthStatus = dbStatus === 'healthy' ? 'healthy' : 'degraded';

  return Response.json({
    status: healthStatus,
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
    services: {
      database: {
        status: dbStatus,
        responseTime: `${dbResponseTime.toFixed(2)}ms`,
        poolStatus,
        readonlyPoolStatus,
      },
      server: {
        status: 'healthy', // Since we're responding, server is healthy
        uptime: process.uptime(),
        memoryUsage: {
          rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)}MB`,
          heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
          heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
          external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)}MB`,
          arrayBuffers: `${(memoryUsage.arrayBuffers / 1024 / 1024).toFixed(2)}MB`,
        },
        systemMemory: {
          total: `${(systemMemory.total / 1024 / 1024 / 1024).toFixed(2)}GB`,
          free: `${(systemMemory.free / 1024 / 1024 / 1024).toFixed(2)}GB`,
          used: `${(systemMemory.used / 1024 / 1024 / 1024).toFixed(2)}GB`,
        },
        cpu: {
          model: cpuModel,
          cores: cpuCores,
          loadAverage: {
            '1m': loadAverage[0].toFixed(2),
            '5m': loadAverage[1].toFixed(2),
            '15m': loadAverage[2].toFixed(2),
          },
        },
        process: {
          pid: process.pid,
          startTime: new Date(Date.now() - process.uptime() * 1000).toISOString(),
        },
        platform: process.platform,
        arch: process.arch,
        osVersion: os.release(),
        hostname: os.hostname(),
        nodeVersion: process.version,
        nodeEnv: process.env.NODE_ENV || 'development',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    },
    metrics: {
      responseTime: `${responseTime.toFixed(2)}ms`,
    },
  });
});
