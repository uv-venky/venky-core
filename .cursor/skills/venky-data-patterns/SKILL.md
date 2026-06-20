---
name: venky-data-patterns
description: Data management with useStore, DataSource definitions, and caching. Use when creating stores, DataSources, implementing CRUD operations, or working with store hooks and dialog patterns.
---

# VENKY Data Patterns

Patterns for state management with useStore and DataSource definitions.

## Core Concepts

### Store Identity

Stores are identified by: `${alias}-${datasourceId}-${page}`. Stores with the same key are **shared across the app**.

```typescript
// These return the SAME store instance
const store1 = useStore<Users>({ datasourceId: 'Users', page: 'users-page', alias: 'users-list' });
const store2 = useStore<Users>({ datasourceId: 'Users', page: 'users-page', alias: 'users-list' });
// store1 === store2 ✅
```

### Row Status

| Status | Description |
|--------|-------------|
| `Q` | Queried (from database, unchanged) |
| `I` | Insert (new, pending save) |
| `U` | Update (modified, pending save) |
| `D` | Delete (marked for deletion) |
| `N` | New (local-only, won't save) |

## Store Configuration by Use Case

### List Page Store

```typescript
export function useEntityListStore() {
  return useStore<Entity>({
    datasourceId: 'Entity',
    page: 'entity-page',
    alias: 'entity-list',
    limit: 20,
    includeCount: true,
    autoQuery: true,
    sort: { createdAt: -1 },
  });
}
```

### Detail/Edit Page Store

```typescript
export function useEntityEditStore() {
  return useStore<Entity>({
    datasourceId: 'Entity',
    page: 'entity-detail-page',
    alias: 'entity-edit',
    limit: 1,
    autoQuery: false,
  });
}
```

### Dialog Form Store

```typescript
export function useEntityDialogStore() {
  return useStore<Entity>({
    datasourceId: 'Entity',
    page: 'entity-page',
    alias: 'entity-dialog',
    limit: 1,
    autoQuery: false,
  });
}
```

### Combobox Lookup Store

```typescript
export function useUserLookupStore() {
  return useStore<Users>({
    datasourceId: 'Users',
    page: 'user-lookup',
    alias: 'user-combobox',
    limit: 50,
    autoQuery: false,
    select: ['userName', 'displayName', 'email'],
  });
}
```

### Filtered Store with Default Conditions

Use `match` for simple equality and `filters` for complex operators:

```typescript
// Simple equality filter
export function useActiveProjectsStore() {
  return useStore<WKProjects>({
    datasourceId: 'WKProjects',
    page: 'project-switcher',
    alias: 'active-projects',
    limit: 500,
    autoQuery: true,
    match: { isArchived: false },  // Equality filter
    sort: { projectName: 1 },
  });
}

// Complex filters with operators
export function useRecentPeriodsStore() {
  return useStore<WKTimesheetPeriods>({
    datasourceId: 'WKTimesheetPeriods',
    page: 'period-selector',
    alias: 'recent-periods',
    autoQuery: true,
    filters: [
      { periodEnd: { inthepast: new Date().toISOString() } },
      { periodYear: { gte: new Date().getFullYear() - 1 } },
    ],
    sort: { periodYear: 1 },
  });
}
```

**Note:** Use `match`/`filters` for static conditions. For dynamic filters (from state/props), use `usePreQuery` or `executeQuery()` instead.

## Essential Hooks

| Hook | Purpose |
|------|---------|
| `useCurrentRowSync` | Current row (sync mode for forms) |
| `useDBRows` | All rows from database |
| `useRows` | All rows (includes unsaved) |
| `useRowValue` | Single field from row |
| `useIsStoreLoading` | Loading state |
| `useIsStorePosting` | Saving state |
| `useIsStoreDirty` | Has unsaved changes |

### Form Pattern (Always use useCurrentRowSync)

```typescript
import { useCurrentRowSync, useIsStoreDirty, useIsStorePosting } from 'venky-core/ui';

function EntityForm({ store }: { store: Store<Entity> }) {
  const row = useCurrentRowSync(store);  // ✅ Prevents cursor jumping
  const isDirty = useIsStoreDirty(store);
  const isPosting = useIsStorePosting(store);

  if (!row) return null;

  return (
    <form>
      <TextInput label="Name" store={store} attributeCode="name" />
      <Button disabled={isPosting || !isDirty}>Save</Button>
    </form>
  );
}
```

### List Pattern (Use useDBRows)

```typescript
import { useDBRows, useIsStoreLoading } from 'venky-core/ui';

function EntityList({ store }: { store: Store<Entity> }) {
  const rows = useDBRows(store);  // DB rows - fields are guaranteed
  const isLoading = useIsStoreLoading(store);

  if (isLoading) return <Spinner />;

  return (
    <ul>
      {rows.map((row) => (
        <li key={row._id}>{row.name}</li>
      ))}
    </ul>
  );
}
```

## CRUD Operations

### Create New

```typescript
// ✅ Initialize BEFORE opening dialog
const handleAdd = useCallback(() => {
  store.createNew({
    partialRecord: { status: 'draft' },
  });
  setIsDialogOpen(true);
}, [store]);
```

### Edit Existing

```typescript
const handleEdit = useCallback((row: Entity) => {
  store.setCurrentRow(row);
  setIsDialogOpen(true);
}, [store]);
```

### Update Fields

```typescript
store.setValue('name', 'New Name');
store.setValue('name', 'New Name', rowId);
store.updateRow(rowId, { name: 'New Name', status: 'active' });
```

### Save

```typescript
const success = await store.save();
await store.save({ feedback: 'Saved successfully' });  // Preferred - custom message
await store.save({ feedback: 'NONE' });  // Suppress all toasts
```

**Important:** After `save()`, the store auto-refreshes. Do NOT call `executeQuery()` or `refresh()` after save.

### Delete

```typescript
store.deleteRow(rowId);
await store.save({ feedback: 'Deleted' });
```

### Delete with Confirmation

Use `confirmWithUser` from `venky-core/ui`:

```typescript
import { confirmWithUser } from 'venky-core/ui';

const handleDelete = useCallback(async (entity: Entity) => {
  const confirmed = await confirmWithUser({
    title: 'Delete Entity',
    content: `Are you sure you want to delete "${entity.name}"?`,
  });
  if (confirmed) {
    store.deleteRow(entity.id);
    await store.save({ feedback: 'Entity deleted' });
  }
}, [store]);
```

## Anti-Patterns to Avoid

### Don't call store methods during render

```typescript
// ❌ Wrong - won't re-render on changes
const rows = store.rows();
const isLoading = store.isLoading();

// ✅ Correct - uses reactive hooks
const rows = useDBRows(store);
const isLoading = useIsStoreLoading(store);
```

### Don't add manual query deduplication guards

The store handles query deduplication internally. If the same query is called again, it's automatically skipped.

```typescript
// ❌ Wrong - unnecessary, store handles this
useEffect(() => {
  if (row?.projectId === projectId) return;  // Redundant check
  store.executeQuery({ query: { match: { projectId } } });
}, [projectId, store, row?.projectId]);

// ❌ Also wrong - useRef guards are unnecessary
const queriedIdRef = useRef<string | null>(null);
useEffect(() => {
  if (queriedIdRef.current === projectId) return;
  queriedIdRef.current = projectId;
  store.executeQuery({ query: { match: { projectId } } });
}, [projectId, store]);

// ✅ Correct - just call executeQuery, store handles deduplication
useEffect(() => {
  store.executeQuery({ query: { match: { projectId } } });
}, [projectId, store]);
```

### Don't have multiple useEffects calling executeQuery

Consolidate into a single effect to avoid duplicate queries on mount.

```typescript
// ❌ Wrong - both effects run on mount, causing duplicate queries
useEffect(() => {
  if (customerId) store.setSmartSearchFilters([{ customerId: { is: customerId } }]);
  store.executeQuery();
}, [customerId, store]);

useEffect(() => {
  store.executeQuery();  // Also runs on mount!
}, [includeArchived, store]);

// ✅ Correct - single effect handles all dependencies
useEffect(() => {
  if (customerId) store.setSmartSearchFilters([{ customerId: { is: customerId } }]);
  store.executeQuery();
}, [customerId, includeArchived, store]);
```

### Don't initialize store in useEffect for dialogs

```typescript
// ❌ Wrong - timing issues
useEffect(() => {
  if (open) store.createNew({ ... });
}, [open]);

// ✅ Correct - initialize before opening
const handleAdd = () => {
  store.createNew({ ... });
  setOpen(true);
};
```

### Don't call executeQuery or refresh after save

```typescript
// ❌ Wrong - save auto-refreshes
await store.save();
await store.executeQuery();

// ❌ Also wrong
await store.save();
await store.refresh();

// ✅ Just save - UI updates automatically
await store.save({ feedback: 'Saved' });

// ✅ Only refresh a DIFFERENT store after cascade delete
await parentStore.save({ feedback: 'Parent deleted' });
childStore.refresh();  // Cascade-deleted by DB, different store
```

### Don't use useCurrentRow for form fields

```typescript
// ❌ Causes cursor jumping
const row = useCurrentRow(store);

// ✅ Use sync mode
const row = useCurrentRowSync(store);
```

## Store vs Actions Decision

| Use Case | Solution |
|----------|----------|
| Standard CRUD | `useStore` |
| Paginated lists | `useStore` |
| Charts/aggregations | Actions + `useQuery` |
| Reports with SQL | Actions + `useQuery` |
| Complex mutations | Actions + `useMutation` |

## Query Parameters

### Use `match` instead of `data`, `filters` instead of `filter`

The `data` and `filter` properties are deprecated. Use `match` and `filters` instead:

```typescript
// ❌ Deprecated
store.executeQuery({ query: { data: { projectId } } });
store.executeQuery({ query: { filter: [{ status: { is: 'active' } }] } });

// ✅ Correct
store.executeQuery({ query: { match: { projectId } } });
store.executeQuery({ query: { filters: [{ status: { is: 'active' } }] } });
```

**Note:** The core normalizes `data` to `match` and `filter` to `filters` internally for backward compatibility, but always use the new property names in new code.

## Precise Store Invalidation

When using `invalidateStoresOnSuccess` in mutations, be specific about which stores to invalidate:

```typescript
// ❌ Wrong - invalidates ALL stores for this datasource
const duplicateProject = useMutation('duplicateProject', {
  invalidateStoresOnSuccess: ['WKProjects'],  // Invalidates both list and detail stores
});

// ✅ Correct - only invalidate the list store
const duplicateProject = useMutation('duplicateProject', {
  invalidateStoresOnSuccess: [{ datasourceId: 'WKProjects', alias: 'wk-projects-all' }],
});
```

**Why this matters:** If you're on a detail page and trigger a mutation, invalidating by datasource name only will also invalidate the current detail store, causing unnecessary queries. Be precise to avoid the "Query is being executed too frequently" warning.

## Additional Resources

- For complete store patterns, see [store-reference.md](store-reference.md)
- For DataSource definitions, see [datasource-reference.md](datasource-reference.md)
