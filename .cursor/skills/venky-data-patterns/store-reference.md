# Store Reference

Complete store patterns and hook reference.

## Store Configuration Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `datasourceId` | `string` | Required | DataSource name |
| `page` | `string` | Required | Page identifier |
| `alias` | `string` | Required | Instance identifier |
| `limit` | `number` | `20` | Page size |
| `autoQuery` | `boolean` | `false` | Auto-fetch on mount |
| `autoRefresh` | `boolean` | `false` | Real-time updates |
| `includeCount` | `boolean` | `false` | Include total for pagination |
| `filterLocally` | `boolean` | `false` | Client-side filtering |
| `select` | `string[]` | `undefined` | Field projection |
| `sort` | `object` | `undefined` | Default sort |
| `invalidateOnSave` | `string[]` | `undefined` | Query actions to invalidate |
| `invalidateStoresOnSave` | `StoreIdentifier[]` | `undefined` | Stores to refresh |

## Sort Priority System

Sort values use signed priority:
- **Sign** = direction: positive = ascending, negative = descending
- **Absolute value** = priority: `1` = primary, `2` = secondary

```typescript
sort: {
  createdAt: -1,    // Primary: descending
  name: 2,          // Secondary: ascending
  status: -3,       // Tertiary: descending
}
```

## Alias Naming Convention

| Pattern | Use Case | Example |
|---------|----------|---------|
| `{module}-list` | List pages | `users-list` |
| `{module}-edit` | Edit pages | `user-edit` |
| `{module}-dialog` | Dialogs | `user-dialog` |
| `{module}-combobox` | Lookups | `user-combobox` |
| `{module}-options` | Select/Combobox options | `customer-options` |

## Options Hook Pattern

For lookup data used in ComboboxInput fields and SmartSearch Select columns:

```typescript
// hooks/use-customer-options.ts
import { useStore } from 'venky-core/client';
import { useDBRows, useIsStoreLoading } from 'venky-core/ui';
import type { Customer } from '@/lib/common/ds/types/module/Customer';

export function useCustomerOptions() {
  const store = useStore<Customer>({
    datasourceId: 'Customers',
    page: 'page-name',
    alias: 'customer-options',
    limit: 1000,
    autoQuery: true,
    select: ['customerId', 'customerName'],  // Only needed fields
    sort: { customerName: 1 },
  });

  const rows = useDBRows(store);
  const isLoading = useIsStoreLoading(store);

  return { rows, isLoading };
}
```

**Key configuration:**
- `autoQuery: true` - Load options on mount
- `select: [...]` - Only fetch ID and display fields
- `limit: 1000` - High limit for all options
- `sort` - Alphabetical for user-friendly display

## SmartSearch Select Column

Use `type: 'Select'` for dropdown filters in SmartSearch:

### Fixed Options (Constants)

```typescript
// For status, type, or other fixed values
import { CURRENCY_OPTIONS } from '@/lib/common/ui-constants';

{
  key: 'status',
  label: 'Status',
  type: 'Select',
  defaultOperator: 'is',
  options: [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
  ],
  getOptionLabel: (opt) => opt.label,
  getOptionValue: (opt) => opt.value,
}
```

### Dynamic Options (From Store)

```typescript
// For master data like customers, users, projects
import { useCustomerOptions } from './use-customer-options';

export default function useSmartSearchColumns() {
  const { rows: customerOptions } = useCustomerOptions();

  return useMemo(() => [
    {
      key: 'customerId',
      label: 'Customer',
      type: 'Select',
      defaultOperator: 'is',
      options: customerOptions,
      getOptionLabel: (opt) => opt.customerName,
      getOptionValue: (opt) => opt.customerId,
    },
    // ... other columns
  ], [customerOptions]);
}
```

**Consistency Rule:** When a field needs both SmartSearch filter AND form ComboboxInput, use the same options hook for both to ensure consistency.

## Complete Hooks Reference

### Row Access Hooks

| Hook | Returns | Use Case |
|------|---------|----------|
| `useCurrentRowSync(store)` | `Row<T> \| undefined` | Forms (prevents cursor jump) |
| `useCurrentRow(store)` | `Row<T> \| undefined` | Display only |
| `useDBRows(store)` | `ReadonlyArray<DBRow<T>>` | Lists (fields guaranteed) |
| `useRows(store)` | `ReadonlyArray<Row<T>>` | Lists with new rows |
| `useRowAtId(store, id)` | `Row<T> \| undefined` | Specific row |
| `useValue(store, key)` | `T[K] \| undefined` | Single field |
| `useRowValue(store, id, key)` | `T[K] \| undefined` | Field from row |

### State Hooks

| Hook | Returns | Use Case |
|------|---------|----------|
| `useIsStoreLoading(store)` | `boolean` | Loading indicator |
| `useIsStorePosting(store)` | `boolean` | Save indicator |
| `useIsStoreBusy(store)` | `boolean` | Any operation |
| `useIsStoreDirty(store)` | `boolean` | Unsaved changes |
| `useIsRowDirty(store, id)` | `boolean` | Row unsaved |
| `useStoreError(store)` | `string \| undefined` | Error state |
| `useStoreRowCount(store)` | `number \| undefined` | Total rows |
| `useHasMoreRows(store)` | `boolean` | Pagination |

### Selection Hooks

| Hook | Returns |
|------|---------|
| `useSelectedRowIds(store)` | `ReadonlyArray<string>` |
| `useSelectedRows(store)` | `ReadonlyArray<Row<T>>` |

### Other Hooks

| Hook | Returns |
|------|---------|
| `usePreQuery(store, fn)` | `void` - Modify queries |
| `useFullSortState(store)` | Sort state |
| `useStoreOffset(store)` | Pagination offset |

## useDBRows vs useRows

| Hook | Return Type | Use When |
|------|-------------|----------|
| `useDBRows(store)` | `DBRow<T>[]` | All rows from database |
| `useRows(store)` | `Row<T>[]` | May contain new/unsaved rows |

**Type Differences:**
- `DBRow<T>`: All fields are required (type `T`)
- `NewRow<T>`: All fields are optional (`Partial<T>`)
- `Row<T>`: Union of both

## Store Methods

### Query Methods

```typescript
await store.executeQuery();
await store.executeQuery({ query: { filter: [...] } });
await store.executeQuery({ force: true });
await store.next();
await store.goToPage(2);
await store.refresh();
await store.refreshRow(rowId);
```

### Mutation Methods

```typescript
store.createNew({ partialRecord: { status: 'draft' } });
store.setCurrentRow(row);
store.setCurrentRowId(rowId);
store.setValue('field', value);
store.setValue('field', value, rowId);
store.updateRow(rowId, { field: value });
await store.save();
await store.save({ feedback: 'Saved' });  // Custom feedback (preferred)
await store.save({ feedback: 'NONE' });   // Suppress all toasts
store.deleteRow(rowId);
store.resetStore();
store.clearSync();
```

### Delete Pattern

```typescript
// Mark row for deletion and save
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

### Refreshing After Cascade Delete

When deleting a parent record that cascade-deletes children (via DataSource `afterDelete`), refresh the child store:

```typescript
// Delete role (afterDelete hook cascade-deletes assignments)
rolesStore.deleteRow(role.id);
await rolesStore.save({ feedback: 'Role deleted' });
// Refresh child store since children were deleted by DB
assignmentsStore.refresh();
```

**Important:** Do NOT call `refresh()` or `executeQuery()` after `save()` on the SAME store - it auto-refreshes.

## Dialog Pattern

```typescript
'use client';

import { useCallback, useState } from 'react';
import { Popup, useCurrentRowSync, useIsStoreDirty, useIsStorePosting, showSuccess } from 'venky-core/ui';
import type { Entity } from '@/lib/common/ds/types/module/Entity';
import type { Store } from 'venky-core/common';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  store: Store<Entity>;
  editingRow?: Entity | null;
}

export function EntityDialog({ open, onOpenChange, store, editingRow }: Props) {
  const row = useCurrentRowSync(store);
  const isDirty = useIsStoreDirty(store);
  const isPosting = useIsStorePosting(store);

  const handleSave = async () => {
    const success = await store.save();
    if (success) {
      showSuccess(editingRow ? 'Updated' : 'Created');
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    store.resetStore();
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <Popup
      title={editingRow ? 'Edit Entity' : 'Add Entity'}
      onClose={handleClose}
      width={520}
      height={430}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isPosting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPosting || !isDirty || !row}>
            Save
          </Button>
        </>
      }
    >
      {row && (
        <div className="grid gap-4">
          <TextInput label="Name" store={store} attributeCode="name" />
        </div>
      )}
    </Popup>
  );
}

// Parent component usage
function ParentComponent() {
  const store = useEntityDialogStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Entity | null>(null);

  // ✅ Initialize BEFORE opening dialog
  const handleAdd = useCallback(() => {
    store.createNew({ partialRecord: { status: 'draft' } });
    setEditingRow(null);
    setIsDialogOpen(true);
  }, [store]);

  const handleEdit = useCallback((row: Entity) => {
    store.setCurrentRow(row);
    setEditingRow(row);
    setIsDialogOpen(true);
  }, [store]);

  return (
    <>
      <Button onClick={handleAdd}>Add Entity</Button>
      <EntityDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        store={store}
        editingRow={editingRow}
      />
    </>
  );
}
```

## View + Staging Pattern

When table displays from a **view** but edits go to a **staging table**:

```typescript
// 1. Create two stores
const viewStore = useAdItemsVStore();      // View datasource
const stagingStore = useDealsStgStore();   // Staging table

// 2. After save, refresh view store
await stagingStore.save();
viewStore.refreshRow(rowId);  // Required refresh

// 3. On cancel, only reset staging
stagingStore.resetStore();  // View store not reset
```

## Performance Tips

1. **Use `select`** for combobox stores - only fetch needed fields
2. **Use `filterLocally`** for small, static datasets
3. **Use appropriate `limit`** - don't fetch more than needed
4. **Share stores via same key** - avoid duplicate fetches
5. **Use `autoRefresh` sparingly** - only for real-time needs
