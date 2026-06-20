# Table Columns Reference

Complete patterns for creating table column definitions with useRowValue and TableCell.

## Critical: Understanding row.original vs useRowValue

**IMPORTANT**: In VENKY tables, `row.original` only contains the row `id`, NOT the full data object.

### Why This Happens

The `useTable` hook creates a minimal data array with just IDs for performance:

```typescript
// From useTable.tsx - this is what row.original contains
const rows = useMemo(
  () => rowIds.map((id) => ({ id })) as T[],
  [rowIds],
);
```

The actual data is stored in the valtio store and must be accessed using `useRowValue`.

### Wrong vs Correct

```typescript
// ❌ WRONG - row.original only has { id: "..." }
cell: ({ row }) => {
  const name = row.original.name; // undefined!
  return <span>{name}</span>;
}

// ✅ CORRECT - Use useRowValue hook
function NameCell({ store, rowId }: { store: Store<Entity>; rowId: string }) {
  const name = useRowValue(store, rowId, 'name');
  if (name == null) {
    return <span className="text-muted-foreground text-xs">-</span>;
  }
  return <span>{name}</span>;
}

// Use in column definition
{
  accessorKey: 'name',
  cell: ({ row }) => <NameCell store={store} rowId={row.id} />,
}

// ✅ ALTERNATIVE - Use TableCell component
{
  accessorKey: 'name',
  cell: (props) => <TableCell type="Text" attributeCode="name" {...props} />,
}
```

## Complete Example

```typescript
'use client';

import { Badge, HeaderCell, TableCell } from 'venky-core/ui';
import { useRowValue } from 'venky-core/client';
import type { Entity } from '@/lib/common/ds/types/module/Entity';
import type { Store } from 'venky-core/common';
import type { AccessorKeyColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

// Custom cell for complex rendering
function StatusCell({ store, rowId }: { store: Store<Entity>; rowId: string }) {
  const status = useRowValue(store, rowId, 'status');
  if (status == null) {
    return <span className="text-muted-foreground text-xs">-</span>;
  }
  return (
    <Badge variant={status === 'active' ? 'default' : 'secondary'}>
      {status}
    </Badge>
  );
}

// Currency cell
function AmountCell({ store, rowId }: { store: Store<Entity>; rowId: string }) {
  const amount = useRowValue(store, rowId, 'amount');
  if (amount == null) {
    return <span className="text-muted-foreground text-xs">-</span>;
  }
  return (
    <span className="font-mono">
      ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
    </span>
  );
}

// Link cell
function NameLinkCell({ store, rowId }: { store: Store<Entity>; rowId: string }) {
  const name = useRowValue(store, rowId, 'name');
  const id = useRowValue(store, rowId, 'id');
  if (!name) {
    return <span className="text-muted-foreground text-xs">-</span>;
  }
  return (
    <Link href={`/entities/${id}`} className="text-primary hover:underline">
      {name}
    </Link>
  );
}

export default function useTableColumns(store: Store<Entity>): AccessorKeyColumnDef<Entity>[] {
  return useMemo(() => [
    // Simple text using TableCell
    {
      accessorKey: 'name',
      meta: { label: 'Name' },
      size: 200,
      header: (props) => <HeaderCell {...props} type="Text" store={store} accessorKey="name" title="Name" />,
      cell: (props) => <TableCell type="Text" attributeCode="name" {...props} />,
    },
    // Custom cell with Badge
    {
      accessorKey: 'status',
      meta: { label: 'Status' },
      size: 100,
      header: (props) => <HeaderCell {...props} type="Text" store={store} accessorKey="status" title="Status" />,
      cell: ({ row }) => <StatusCell store={store} rowId={row.id} />,
    },
    // Date cell
    {
      accessorKey: 'createdAt',
      meta: { label: 'Created' },
      size: 150,
      header: (props) => <HeaderCell {...props} type="Date" store={store} accessorKey="createdAt" title="Created" />,
      cell: (props) => <TableCell type="Date" attributeCode="createdAt" {...props} />,
    },
    // Number cell
    {
      accessorKey: 'amount',
      meta: { label: 'Amount' },
      size: 120,
      header: (props) => <HeaderCell {...props} type="Number" store={store} accessorKey="amount" title="Amount" />,
      cell: ({ row }) => <AmountCell store={store} rowId={row.id} />,
    },
    // Boolean cell
    {
      accessorKey: 'isActive',
      meta: { label: 'Active' },
      size: 80,
      header: (props) => <HeaderCell {...props} type="Boolean" store={store} accessorKey="isActive" title="Active" />,
      cell: (props) => <TableCell type="Boolean" attributeCode="isActive" {...props} />,
    },
  ], [store]);
}
```

## Available Hooks for Cell Components

```typescript
import {
  useRowValue,           // Get a single field value
  useRowAtId,            // Get entire row object
  useIsRowSelected,      // Check if row is selected
  useIsRowAttributeDirty // Check if field was modified
} from 'venky-core/client';
```

## TableCell Types

| Type | Description |
|------|-------------|
| `Text` | String values |
| `Number` | Numeric values |
| `Date` | Date values (formatted) |
| `Boolean` | Checkbox/toggle |

## Key Points

1. **row.id** - Use to get the row identifier
2. **useRowValue(store, rowId, attributeCode)** - Fetch data from store
3. **Create wrapper components** for custom cell renderers
4. **TableCell** handles data fetching internally
5. **HeaderCell** works with accessorKey for sorting
6. **Wrap in useMemo** with store as dependency

## Styled Cell Components (from Core)

`venky-core/ui` provides pre-built styled cells for professional-looking tables:

```typescript
import {
  EntityNameCell,
  StatusBadgeCell,
  CodeCell,
  BadgeOutlineCell,
  NumericWithUnitsCell,
  PercentageCell,
  CompoundCell,
  // Presets and types
  ENTITY_PRESETS,
  STATUS_DEFAULTS,
  type EntityPreset,
} from 'venky-core/ui';
```

### EntityNameCell

Primary identifier with icon and click-to-edit:

```typescript
// With preset (recommended)
<EntityNameCell attributeCode="customerName" preset="customer" useTableOnEdit {...props} />

// Available presets: 'customer', 'user', 'project', 'vendor', 'document', 'task'

// Custom icon/colors
<EntityNameCell
  attributeCode="name"
  icon={<Building2 className="size-3.5" />}
  iconBgClass="bg-indigo-500/10"
  iconClass="text-indigo-600 dark:text-indigo-400"
  onClick={(rowId) => router.push(`/items/${rowId}`)}
  {...props}
/>
```

### StatusBadgeCell

Status indicators with auto-detected colors:

```typescript
// Auto-detects common statuses (Active, Inactive, Pending, etc.)
<StatusBadgeCell attributeCode="status" {...props} />

// Custom status config
<StatusBadgeCell
  attributeCode="status"
  statusConfig={{
    Open: { variant: 'success' },
    Closed: { variant: 'secondary' },
    Blocked: { variant: 'destructive' },
  }}
  {...props}
/>
```

**Auto-detected statuses:**
| Status | Variant |
|--------|---------|
| Active, Approved, Complete | success (green) |
| Inactive, Draft, Closed | secondary (gray) |
| Suspended, Rejected, Error | destructive (red) |
| Pending, Review, In Progress | warning (amber) |

### CodeCell

Monospace display for IDs, codes, technical values:

```typescript
<CodeCell attributeCode="taxId" {...props} />
<CodeCell attributeCode="referenceCode" bgClass="bg-blue-50" textClass="text-blue-700" {...props} />
```

### BadgeOutlineCell

Outline badge for short values:

```typescript
<BadgeOutlineCell attributeCode="currency" {...props} />
<BadgeOutlineCell attributeCode="category" mono={false} {...props} />
```

### NumericWithUnitsCell

Numbers with optional icon and unit:

```typescript
<NumericWithUnitsCell
  attributeCode="paymentTermsDays"
  unit="days"
  icon={<Calendar className="size-3.5" />}
  {...props}
/>

<NumericWithUnitsCell attributeCode="hourlyRate" currency unit="/hr" {...props} />
```

### PercentageCell

Shorthand for percentage values:

```typescript
<PercentageCell attributeCode="progress" {...props} />
<PercentageCell attributeCode="allocation" fractionDigits={1} {...props} />
```

### CompoundCell

Primary + secondary text in one cell:

```typescript
<CompoundCell
  primary="displayName"
  secondary="email"
  preset="user"
  useTableOnEdit
  {...props}
/>
// Renders:
// [👤] John Smith
//      john@example.com
```

## Complete Example with Styled Cells

```typescript
import {
  BadgeOutlineCell,
  CodeCell,
  createActionsColumn,
  DataTableCell,
  EntityNameCell,
  HeaderCell,
  NumericWithUnitsCell,
  StatusBadgeCell,
} from 'venky-core/ui';

export default function useTableColumns(store: Store<Entity>) {
  return useMemo(() => [
    {
      accessorKey: 'name',
      header: (props) => <HeaderCell {...props} type="Text" store={store} accessorKey="name" title="Name" />,
      cell: (props) => <EntityNameCell attributeCode="name" preset="customer" useTableOnEdit {...props} />,
    },
    {
      accessorKey: 'status',
      header: (props) => <HeaderCell {...props} type="Text" store={store} accessorKey="status" title="Status" />,
      cell: (props) => <StatusBadgeCell attributeCode="status" {...props} />,
    },
    {
      accessorKey: 'currency',
      header: (props) => <HeaderCell {...props} type="Text" store={store} accessorKey="currency" title="Currency" />,
      cell: (props) => <BadgeOutlineCell attributeCode="currency" {...props} />,
    },
    {
      accessorKey: 'code',
      header: (props) => <HeaderCell {...props} type="Text" store={store} accessorKey="code" title="Code" />,
      cell: (props) => <CodeCell attributeCode="code" {...props} />,
    },
  ], [store]);
}
```

## Custom Cells (When Needed)

For cases not covered by core components, create custom cells:

### CellContext Type

```typescript
import type { CellContext } from '@tanstack/react-table';
import type { Store } from 'venky-core/common';
import { useRowValue, EMPTY_CELL } from 'venky-core/ui';

function CustomCell({ row, ...props }: CellContext<Entity, unknown>) {
  const store = useCurrentStore<Entity>();
  const value = useRowValue(store, row.id, 'fieldName');
  
  if (!value) return EMPTY_CELL;
  
  return <div className="px-2 py-1">{/* Custom content */}</div>;
}
```

### Cell Styling Best Practices

| Pattern | Classes | Use Case |
|---------|---------|----------|
| Cell padding | `px-2 py-1` | All cells |
| Numeric alignment | `text-right tabular-nums` | Numbers, amounts |
| Monospace | `font-mono` | Codes, IDs |
| Clickable | `cursor-pointer group-hover:underline` | Interactive names |
| Icon container | `flex size-6 items-center justify-center rounded` | Icon backgrounds |
| Icon size | `size-3.5` (14px) | In-cell icons |
