---
name: venky-nextjs-patterns
description: Create Next.js pages with PageShell and PageLayoutTemplate, server actions with useQuery/useMutation, and API routes. Use when creating new pages, page-content files, server actions, API routes, multi-tab detail pages, or master/detail workspace pages with collapsible sections.
---

# VENKY Next.js Patterns

Patterns for creating pages, server actions, and API routes in VENKY applications.

## Page Structure Overview

Every page follows a two-file pattern:

```
src/app/(secure)/module/feature/
├── page.tsx              # Entry point with PageShell
├── page-content.tsx      # Main content with PageLayoutTemplate
├── hooks/
│   ├── use-store.ts
│   └── use-table-columns.tsx
└── components/
    └── edit-form.tsx
```

## 1. Page Entry Point (`page.tsx`)

**Note:** `PageShell` already includes `ErrorBoundary` and `Suspense` internally, so you don't need to wrap content manually.

```typescript
'use client';

import { PageShell } from 'venky-core/ui';
import dynamic from 'next/dynamic';

const PageContent = dynamic(() => import('./page-content'), { ssr: false });

export default function PageName() {
  return (
    <PageShell title="Page Title" noPadding>
      <PageContent />
    </PageShell>
  );
}
```

### With Route Params (Next.js 15+)

```typescript
'use client';

import { use } from 'react';
import { PageShell } from 'venky-core/ui';
import dynamic from 'next/dynamic';

const PageContent = dynamic(() => import('./page-content'), { ssr: false });

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DetailPage({ params }: PageProps) {
  const { id } = use(params);
  
  return (
    <PageShell title="Detail Page" noPadding>
      <PageContent id={id} />
    </PageShell>
  );
}
```

## 2. Page Content (`page-content.tsx`)

```typescript
'use client';

import { Icon } from 'lucide-react';
import { PageLayoutTemplate } from 'venky-core/ui';
import { useStore } from 'venky-core/client';
import type { Entity } from '@/lib/common/ds/types/module/Entity';
import useTableColumns from './hooks/use-table-columns';
import useSmartSearchColumns from './hooks/use-smart-search-columns';
import EditForm from './components/edit-form';

export default function PageContent() {
  const store = useStore<Entity>({
    page: 'entity-page',
    datasourceId: 'Entity',
    alias: 'entity-list',
    limit: 20,
    includeCount: true,
    autoQuery: true,
  });

  const tableColumns = useTableColumns(store);
  const smartSearchColumns = useSmartSearchColumns();

  return (
    <PageLayoutTemplate
      title="Entities"
      subTitle="Manage your entities"
      icon={<Icon className="size-12 text-muted-foreground" />}
      store={store}
      smartSearchColumns={smartSearchColumns}
      tableColumns={tableColumns}
      pageId="entity-page"
      itemId="entity-id"
      editForm={<EditForm store={store} />}
      getDefaultRow={() => ({ status: 'draft' })}
      addNewButtonText="Add Entity"
    />
  );
}
```

## 3. Server Actions Pattern

**When to use**: Charts, reports, complex aggregations, multi-table joins.

### Action Definition

```typescript
// src/app/(secure)/module/feature/action.ts
import type { PgPoolClient } from 'venky-core/server';
import type { Session } from 'venky-core/auth';

export interface DashboardStats {
  total: number;
  active: number;
  items: Array<{ id: string; name: string }>;
}

export async function getDashboardStats(
  client: PgPoolClient,
  session: Session,
  dateRange?: string,
): Promise<DashboardStats> {
  const result = await client.query(`
    SELECT ... FROM table
    WHERE user_name = $1
  `, [session.user.userName]);
  
  return { total: result.rows.length, active: 0, items: result.rows };
}
```

### Register Action

```typescript
// src/lib/server/actions/module/index.ts
import { getDashboardStats } from '@/app/(secure)/module/feature/action';

export const MODULE_ACTIONS = { getDashboardStats };
export const MODULE_ACTION_ACCESS_ROLES = {
  getDashboardStats: ['all_users'], // Any authenticated user
};
```

### Use in Component

```typescript
import { useQuery } from '@/lib/core/client/useQuery';

function Dashboard() {
  const result = useQuery('getDashboardStats', dateRange);
  
  if (result.status === 'loading') return <Loader />;
  if (result.status === 'error') return <Error message={result.error} />;
  
  return <Chart data={result.data} />;
}
```

## 4. API Routes (Use Sparingly)

Only for webhooks, public endpoints, file streaming, or external integrations.

```typescript
import { withDBSessionRoute } from 'venky-core/server';
import type { Session } from 'venky-core/auth';
import type { PgPoolClient } from 'venky-core/server';

export const POST = withDBSessionRoute(async function callback(
  client: PgPoolClient,
  session: Session,
  req: Request,
) {
  const body = await req.json();
  return Response.json({ status: 'OK', data: body });
});

export const runtime = 'nodejs';
```

## 5. Data Fetching Decision Tree

| Use Case | Solution |
|----------|----------|
| Standard CRUD | DataSource + `useStore` |
| Paginated lists | DataSource + `useStore` |
| Charts/aggregations | **Actions** + `useQuery` |
| Reports with SQL | **Actions** + `useQuery` |
| Mutations with logic | **Actions** + `useMutation` |
| Webhooks | API Routes |
| File streaming | API Routes |

## Additional Resources

- For detailed page patterns, see [page-structure.md](page-structure.md)
- For server action patterns, see [actions-reference.md](actions-reference.md)
- For multi-tab detail pages, see [multi-tab-reference.md](multi-tab-reference.md)
- For master/detail workspace pages, see [master-detail-workspace-reference.md](master-detail-workspace-reference.md)
