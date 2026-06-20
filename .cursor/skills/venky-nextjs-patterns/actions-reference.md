# Server Actions Reference

Complete patterns for server actions with useQuery, useMutation, and cache management.

## When to Use Actions vs DataSource

| Use Case | Solution |
|----------|----------|
| Standard CRUD operations | DataSource + `useStore` |
| Paginated lists/tables | DataSource + `useStore` |
| Charts with complex aggregations | **Actions** + `useQuery` |
| Reports with custom SQL | **Actions** + `useQuery` |
| Multi-table joins for analytics | **Actions** + `useQuery` |
| Custom business logic mutations | **Actions** + `useMutation` |
| Webhooks | API Routes |
| File streaming | API Routes |

## Action Definition

```typescript
// src/app/(secure)/module/feature/action.ts
import type { PgPoolClient } from 'venky-core/server';
import type { Session } from 'venky-core/auth';
import { UserError } from 'venky-core/common';

interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export async function getSalesChart(
  client: PgPoolClient,
  session: Session,
  startDate: string,
  endDate: string,
  groupBy: 'day' | 'week' | 'month',
): Promise<SalesDataPoint[]> {
  const result = await client.query<SalesDataPoint>(
    `SELECT 
       DATE_TRUNC($3, order_date) as date,
       SUM(total_amount) as revenue,
       COUNT(*) as orders
     FROM orders
     WHERE order_date BETWEEN $1 AND $2
       AND customer_id = ANY(
         SELECT customer_id FROM user_customers WHERE user_id = $4
       )
     GROUP BY DATE_TRUNC($3, order_date)
     ORDER BY date`,
    [startDate, endDate, groupBy, session.user.id]
  );
  return result.rows;
}

// Action with validation
export async function updateEntityStatus(
  client: PgPoolClient,
  session: Session,
  entityId: string,
  status: 'active' | 'inactive',
) {
  const entity = await client.query(
    'SELECT user_id FROM entity WHERE id = $1',
    [entityId]
  );
  
  if (!entity.rows[0]) {
    throw new UserError('Entity not found');
  }
  
  if (entity.rows[0].user_id !== session.user.id && !session.user.roles.includes('admin')) {
    throw new UserError('Access denied');
  }
  
  const result = await client.query(
    `UPDATE entity SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, entityId]
  );
  
  return result.rows[0];
}
```

## Registering Actions

```typescript
// src/lib/server/actions/module/index.ts
import { getSalesChart, updateEntityStatus } from './entity-actions';

export const MODULE_ACTIONS = {
  getSalesChart,
  updateEntityStatus,
};

export type ModuleActionName = keyof typeof MODULE_ACTIONS;

export const MODULE_ACTION_ACCESS_ROLES: Record<ModuleActionName, string[]> = {
  getSalesChart: ['all_users'], // Any authenticated user
  updateEntityStatus: ['admin'], // Admin only
};
```

## Client Usage

### useQuery - Data Fetching

```typescript
import { useQuery } from '@/lib/core/client/useQuery';

function ChartComponent({ startDate, endDate }: Props) {
  const result = useQuery('getSalesChart', startDate, endDate, 'month');
  
  if (result.status === 'loading') return <Loader />;
  if (result.status === 'error') return <Error message={result.error} />;
  
  return <Chart data={result.data} />;
}
```

### useQueryWithOptions - Advanced Fetching

```typescript
import { useQueryWithOptions } from '@/lib/core/client/useQuery';

const result = useQueryWithOptions('getDashboardMetrics', {
  staleTime: 60_000,           // Data fresh for 1 minute
  refetchOnWindowFocus: true,  // Refetch when tab active
  refetchInterval: 30_000,     // Auto-refresh every 30s
  enabled: !!dashboardId,      // Only fetch when ID exists
  retry: 2,                    // Retry on failure
}, dashboardId);
```

### useSuspenseQuery - With React Suspense

```typescript
import { useSuspenseQuery } from '@/lib/core/client/useQuery';
import { Suspense } from 'react';

function ChartContent({ startDate, endDate }: Props) {
  // No loading checks needed - suspends until ready
  const data = useSuspenseQuery('getSalesChart', {}, startDate, endDate);
  return <Chart data={data} />;
}

function ChartPage() {
  return (
    <Suspense fallback={<Loader />}>
      <ChartContent startDate="2024-01-01" endDate="2024-12-31" />
    </Suspense>
  );
}
```

### useMutation - For Mutations

```typescript
import { useMutation } from '@/lib/core/client/useQuery';

function UpdateButton() {
  const updateStatus = useMutation('updateEntityStatus', {
    invalidateOnSuccess: ['getEntities', 'getEntityCount'],
    invalidateStoresOnSuccess: ['Entity'],
    onSuccess: (result) => {
      console.info('Updated:', result.id);
    },
  });
  
  return (
    <Button onClick={() => updateStatus(entityId, 'active')}>
      Activate
    </Button>
  );
}
```

## Cache Invalidation

```typescript
import { invalidateQuery, invalidateQueries } from 'venky-core/client';

// Invalidate specific query
invalidateQuery('getEntities');

// Invalidate with params
invalidateQuery('getEntity', '123');

// Invalidate multiple
invalidateQueries(['getEntities', 'getEntityCount']);
```

## Prefetching

```typescript
import { prefetchQuery } from '@/lib/core/client/useQuery';

// Prefetch on hover
<button
  onMouseEnter={() => prefetchQuery('getChartData', {}, chartId)}
  onClick={() => navigate(`/charts/${chartId}`)}
>
  View Chart
</button>
```

## Action Wrappers

```typescript
// With DB and session
import { withDBSessionAction } from 'venky-core/server';

export const myAction = withDBSessionAction(
  async (client, session, arg1, arg2) => { ... }
);

// Session only (no DB)
import { withSessionAction } from 'venky-core/server';

export const myAction = withSessionAction(
  async (session, arg1) => { ... }
);

// DB only (public actions)
import { withDBAction } from 'venky-core/server';

export const myPublicAction = withDBAction(
  async (client, arg1) => { ... }
);
```

## Error Handling

```typescript
import { UserError } from 'venky-core/common';

export async function sensitiveAction(client: PgPoolClient, session: Session) {
  // UserError - shown to user
  if (!session.user.roles.includes('admin')) {
    throw new UserError('You do not have permission');
  }
  
  // Regular errors - logged only
  try {
    await client.query('...');
  } catch (error) {
    logger.error('Database error:', error);
    throw new UserError('An error occurred. Please try again.');
  }
}
```

## Access Role Options

| Role | Description |
|------|-------------|
| `'public'` | No authentication required |
| `'all_users'` | Any authenticated user |
| `'admin'` | Admin role only |
| `'editor'` | Editor role |
| Custom roles | Any role in your system |
