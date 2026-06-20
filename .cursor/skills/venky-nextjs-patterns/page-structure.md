# Page Structure Reference

Detailed patterns for creating pages with PageShell and PageLayoutTemplate.

## Directory Structure

```
src/app/(secure)/module/page-name/
├── page.tsx                          # Entry point with PageShell
├── page-content.tsx                  # Main content with PageLayoutTemplate
├── hooks/
│   ├── use-store.ts                  # Store hook
│   ├── use-table-columns.tsx         # Table column definitions
│   └── use-smart-search-columns.ts   # Dynamic search column definitions
└── components/
    ├── edit-form.tsx                 # Edit/Add form
    └── other-components.tsx          # Page-specific components
```

## Store Hook Pattern

```typescript
// hooks/use-store.ts
import { useStore } from 'venky-core/client';
import type { DataType } from '@/lib/common/ds/types/module/DataType';

export function useDataTypeStore() {
  return useStore<DataType>({
    datasourceId: 'DataType',
    page: 'data-type-page',
    alias: 'data-type-list',
    limit: 20,
    includeCount: true,
    autoQuery: true,
  });
}
```

## Table Columns Hook

**CRITICAL**: `row.original` only contains the row `id` - use `useRowValue` or `TableCell` to access data.

```typescript
// hooks/use-table-columns.tsx
import type { Store } from 'venky-core/common';
import type { DataType } from '@/lib/common/ds/types/module/DataType';
import type { AccessorKeyColumnDef } from '@tanstack/react-table';
import { HeaderCell, TableCell } from 'venky-core/ui';
import { useMemo } from 'react';

export default function useTableColumns(store: Store<DataType>): AccessorKeyColumnDef<DataType>[] {
  return useMemo(() => [
    {
      accessorKey: 'fieldName',
      meta: { label: 'Field Label' },
      header: (props) => <HeaderCell {...props} type="Text" store={store} accessorKey="fieldName" title="Field Label" />,
      cell: (props) => <TableCell type="Text" attributeCode="fieldName" {...props} />,
    },
  ], [store]);
}
```

## Smart Search Columns

Smart search columns support dynamic definitions (e.g., role-based filtering):

```typescript
// hooks/use-smart-search-columns.ts
import type { SmartSearchColumn } from 'venky-core/common';
import { useSession } from 'venky-core/client';

export default function useSmartSearchColumns(): SmartSearchColumn[] {
  const { user } = useSession();
  const isAdmin = user?.roles?.includes('admin');

  return [
    {
      id: 'fieldName',
      label: 'Field Label',
      type: 'text',
    },
    // Admin-only search column
    ...(isAdmin ? [{
      id: 'internalCode',
      label: 'Internal Code',
      type: 'text',
    }] : []),
  ];
}
```

## Key Rules

| Rule | Description |
|------|-------------|
| PageShell | Wraps entire page in `page.tsx` (includes ErrorBoundary and Suspense internally) |
| PageLayoutTemplate | Used in `page-content.tsx` (NOT wrapped in PageShell) |
| dynamic() import | Use for page-content to enable code splitting |
| includeCount: true | Required for pagination |
| No redundant wrappers | Do NOT add ErrorBoundary/Suspense inside PageShell - it handles this |
| Default exports | Required for Next.js pages and dynamic imports |
| use() hook | Use for route params in client pages (React 19) |

## Async APIs (Next.js 15+)

```typescript
// Always use async versions
const cookieStore = await cookies();
const headersList = await headers();
const { isEnabled } = await draftMode();

// Handle async params
const params = await props.params;
const searchParams = await props.searchParams;
```
