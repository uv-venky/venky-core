# Multi-Tab Detail Page Reference

Pattern for implementing detail/edit pages with multiple tabs, centralized store management, and URL-persisted tab state.

## Architecture Overview

- **URL-based tab state** - persists in URL, survives refresh
- **Centralized store** - main entity store passed through component tree
- **Lazy-loaded tab data** - tabs query their own related data
- **Loading gates** - handled at page level, not in tabs

## Component Structure

```
page.tsx (Client Component)
├── Creates main store
├── Queries store on route param change
├── Handles loading/error states
└── Renders PageShell + DetailPage

page-inner.tsx (Wrapper)
├── Receives store + row as props
├── Adds context providers (if needed)
└── Renders DetailContent

page-content.tsx (Layout)
├── Receives store + row as props
├── Creates related stores
├── Manages tab state (URL-synced)
└── Renders tabs

tabs/*.tsx (Tab Components)
├── Receive store + row as props
├── Use store for mutations
└── Render tab-specific UI
```

## 1. Page with Store and Loading

```typescript
// page.tsx
'use client';

import { use, useEffect } from 'react';
import { PageShell } from 'venky-core/ui';
import { useIsStoreLoading, useStoreError, useCurrentRow } from 'venky-core/ui';
import { Loader2 } from 'lucide-react';
import type { DBRow } from 'venky-core/common';
import type { Entity } from '@/lib/common/ds/types/module/Entity';
import { useEntityStore } from './hooks/use-store';
import { DetailPage } from './page-inner';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  const store = useEntityStore();
  const { id } = use(params);
  
  useEffect(() => {
    store.executeQuery({
      query: { data: { entityId: id } },
      force: true,
    });
  }, [id, store]);
  
  const isLoading = useIsStoreLoading(store);
  const hasError = useStoreError(store);
  const row = useCurrentRow(store) as DBRow<Entity>;

  const handleStatusChange = (newStatus: string) => {
    if (!row) return;
    const rowId = row._id ?? row._cid ?? row.id;
    store.updateRow(rowId, { status: newStatus });
    store.save({ feedback: 'Status updated' });
  };

  return (
    <PageShell title={`Entity: ${id}`} enableShareUrl>
      {isLoading || row?.id !== id ? (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="size-10 animate-spin" />
        </div>
      ) : hasError ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-destructive">Failed to load. Please try again.</p>
        </div>
      ) : !row ? (
        <div className="flex h-full items-center justify-center">
          <p>Entity not found</p>
        </div>
      ) : (
        <DetailPage 
          entity={row} 
          entityStore={store} 
          onStatusChange={handleStatusChange} 
        />
      )}
    </PageShell>
  );
}
```

## 2. Store Hook for Detail Pages

```typescript
// hooks/use-store.ts
import { useStore } from 'venky-core/client';
import type { Entity } from '@/lib/common/ds/types/module/Entity';

export function useEntityStore() {
  return useStore<Entity>({
    datasourceId: 'Entity',
    page: 'entity-detail-page',
    alias: 'entity-edit',
    limit: 1,           // Single record
    autoQuery: false,   // Manual query with ID
  });
}
```

## 3. URL-Synced Tab State

```typescript
// page-content.tsx
import { useURLStringState } from 'venky-core/ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function DetailContent({ entity, entityStore }: Props) {
  const [activeTab, setActiveTab] = useURLStringState('tab', 'details');
  
  return (
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="schedule">Schedule</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details">
        <DetailsTab entity={entity} entityStore={entityStore} />
      </TabsContent>
      <TabsContent value="schedule">
        <ScheduleTab entity={entity} />
      </TabsContent>
      <TabsContent value="documents">
        <DocumentsTab entity={entity} />
      </TabsContent>
    </Tabs>
  );
}
```

## 4. Tab Data Querying Patterns

### Pattern A: Query on Main Entity Load

```typescript
export function DetailContent({ entity, entityStore }: Props) {
  const relatedStore = useRelatedStore('related-schedule');
  const relatedItems = useDBRows(relatedStore);

  useEffect(() => {
    if (entity.id) {
      relatedStore.executeQuery({
        query: { data: { entityId: entity.id } },
      });
    }
  }, [entity.id, relatedStore]);

  return (
    <TabsContent value="schedule">
      <ScheduleTab entity={entity} relatedItems={relatedItems} />
    </TabsContent>
  );
}
```

### Pattern B: Query on Demand

```typescript
export function Header({ entity }: Props) {
  const [showCombobox, setShowCombobox] = useState(false);
  const userStore = useUserListStore({ alias: 'user-list' });

  useEffect(() => {
    if (showCombobox) {
      userStore.executeQuery({
        query: { filter: [{ role: { like: '%coordinator%' } }] },
      });
    }
  }, [userStore, showCombobox]);

  const users = useRows(userStore);
  // ...
}
```

## 5. Mutations in Tabs

```typescript
export function DetailsTab({ entity, entityStore }: Props) {
  const rowId = entity._id ?? entity._cid ?? entity.id;
  
  const handleUpdate = async () => {
    // Optimistic update
    entityStore.updateRow(rowId, { fieldName: newValue });
    // Persist
    await entityStore.save({ feedback: 'Updated successfully' });
  };
  
  // ...
}
```

## 6. Unsaved Changes Warning

```typescript
export function DetailsTab({ entity, entityStore }: Props) {
  const isDirty = useIsStoreDirty(entityStore);
  
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);
  
  return (
    <Button onClick={handleSave} disabled={!isDirty}>
      Save Changes
    </Button>
  );
}
```

## Key Design Principles

1. **Single Source of Truth** - Main store created once at page level
2. **Prop Drilling** - Store passed down (not recreated)
3. **Separation of Concerns** - Each tab manages its own related data
4. **URL Persistence** - Tab state in URL for shareability
5. **Loading Gates** - Content only renders when data is ready
6. **Store Aliases** - Unique aliases prevent conflicts
7. **Type Safety** - TypeScript types throughout

## Implementation Checklist

- [ ] Create main entity store hook with `limit: 1`, `autoQuery: false`
- [ ] Create page component that queries on route param change
- [ ] Implement loading check (`isLoading || row?.id !== paramId`)
- [ ] Implement error check (`useStoreError(store)`)
- [ ] Pass store and row to child components
- [ ] Use `useURLStringState('tab', 'defaultTab')` for tab state
- [ ] Create related stores for shared tab data
- [ ] Query related stores in useEffect
- [ ] Use `store.updateRow()` + `store.save()` for mutations
- [ ] Track dirty state with `useIsStoreDirty()`
