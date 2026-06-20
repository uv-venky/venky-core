/* Copyright (c) 2024-present Venky Corp. */

/**
 * Next.js API route exports.
 *
 * IMPORTANT:
 * Keep these route namespaces lazily loaded. Eager `export * as ... from ...`
 * pulls the entire route graph at module evaluation time, which can trigger
 * ESM initialization cycles in non-Next server bundles.
 */

type RouteLoader = () => Promise<Record<string, unknown>>;
type RouteHandler = (...args: any[]) => Response | Promise<Response>;
type RouteNamespace = Record<string, RouteHandler>;

function lazyRoute(loader: RouteLoader, routeName: string): RouteNamespace {
  const cache = new Map<string, RouteHandler>();

  return new Proxy({} as RouteNamespace, {
    get(_target, prop) {
      if (typeof prop !== 'string') {
        return undefined;
      }

      if (!cache.has(prop)) {
        cache.set(prop, async (...args: any[]) => {
          const mod = await loader();
          const routeExport = mod[prop];

          if (typeof routeExport !== 'function') {
            throw new Error(`[core/server/routes] "${routeName}.${prop}" is not a callable route handler export.`);
          }

          return routeExport(...args);
        });
      }

      return cache.get(prop);
    },
  });
}

// DataSource routes
export const dsRoute = lazyRoute(() => import('@/app/api/ds/route'), 'dsRoute');
export const dsListRoute = lazyRoute(() => import('@/app/api/ds/list/route'), 'dsListRoute');
export const dsJsonSchemaRoute = lazyRoute(() => import('@/app/api/ds-json-schema/route'), 'dsJsonSchemaRoute');
export const exportDsRoute = lazyRoute(() => import('@/app/api/export-ds/route'), 'exportDsRoute');

// Activity route
export const activityRoute = lazyRoute(() => import('@/app/api/activity/route'), 'activityRoute');

// Attributes route
export const attributesRoute = lazyRoute(() => import('@/app/api/attributes/route'), 'attributesRoute');

// Health route
export const healthRoute = lazyRoute(() => import('@/app/api/health/route'), 'healthRoute');

// Log route
export const logRoute = lazyRoute(() => import('@/app/api/log/route'), 'logRoute');

// Shorten URL route
export const shortenUrlRoute = lazyRoute(() => import('@/app/api/shorten-url/route'), 'shortenUrlRoute');

// SQL routes
export const sqlDescribeRoute = lazyRoute(() => import('@/app/api/sql/describe/route'), 'sqlDescribeRoute');
export const sqlHistoryRoute = lazyRoute(() => import('@/app/api/sql/history/route'), 'sqlHistoryRoute');
export const sqlHistoryIdRoute = lazyRoute(() => import('@/app/api/sql/history/[id]/route'), 'sqlHistoryIdRoute');
export const sqlRunRoute = lazyRoute(() => import('@/app/api/sql/run/route'), 'sqlRunRoute');
export const sqlSchemasRoute = lazyRoute(() => import('@/app/api/sql/schemas/route'), 'sqlSchemasRoute');

// Status routes
export const statusRoute = lazyRoute(() => import('@/app/api/p/status/route'), 'statusRoute');
export const appsStatusRoute = lazyRoute(() => import('@/app/api/apps/[appId]/status/route'), 'appsStatusRoute');

// SSE route
export const sseStreamRoute = lazyRoute(() => import('@/app/api/sse/stream/route'), 'sseStreamRoute');

// Integration test route
export const integrationTestRoute = lazyRoute(
  () => import('@/app/api/integrations/[id]/test/route'),
  'integrationTestRoute',
);
