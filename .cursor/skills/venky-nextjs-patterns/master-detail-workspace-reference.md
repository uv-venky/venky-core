# Master/Detail Workspace Pattern

A modern UX pattern for viewing and editing a main entity with multiple related entities, using collapsible sections and card-based layouts instead of inline table editing.

## When to Use

- Viewing a single entity with multiple related child entities
- When you want a dashboard-like experience for an entity
- Alternative to multi-tab pages when all sections should be visible
- When related data benefits from card/visual representation over tables

## Architecture Overview

```
page.tsx
├── Loads main entity (e.g., Project)
├── Handles loading/error states
└── Renders PageContent with entity

page-content.tsx
├── Uses workspace hook for all related data
├── Renders header with entity info + metrics
├── Renders collapsible sections for each related entity
└── Each section manages its own CRUD dialogs

hooks/use-{entity}-workspace.ts
├── Creates stores for each related entity
├── Uses usePreQuery to filter by parent ID
├── Executes queries when parent ID changes
└── Returns stores, rows, and loading states

components/sections/{entity}-section.tsx
├── Receives parent entity + related data + store
├── Manages dialog open/close state
├── Handles CRUD operations
└── Renders cards/list with action buttons
```

## Directory Structure

```
src/app/(secure)/module/entity/[entityId]/
├── page.tsx                      # Entry point, loads main entity
├── page-content.tsx              # Main workspace layout
├── hooks/
│   └── use-entity-workspace.ts   # All related stores + data
└── components/
    ├── workspace-header.tsx      # Header with entity info
    ├── metrics-bar.tsx           # Computed metrics display
    ├── collapsible-section.tsx   # Reusable section wrapper
    ├── sections/
    │   ├── details-section.tsx   # Main entity details
    │   ├── items-section.tsx     # Related items
    │   └── other-section.tsx     # Other related data
    ├── cards/
    │   ├── item-card.tsx         # Card for related items
    │   └── other-card.tsx        # Other card types
    └── dialogs/
        ├── add-item-dialog.tsx   # Add/edit dialogs
        └── edit-entity-dialog.tsx
```

## 1. Page Entry Point

**Note:** `PageShell` already includes `ErrorBoundary` and `Suspense` internally, so you don't need to wrap content manually.

```typescript
// page.tsx
'use client';

import { use, useEffect } from 'react';
import { PageShell, useIsStoreLoading, useDBRows } from 'venky-core/ui';
import dynamic from 'next/dynamic';
import { useEntityStore } from '../hooks/use-store';
import { Loader2 } from 'lucide-react';

const PageContent = dynamic(() => import('./page-content'), { ssr: false });

interface Props {
  params: Promise<{ entityId: string }>;
}

function PageInner({ params }: Props) {
  const { entityId } = use(params);
  const store = useEntityStore();
  const isLoading = useIsStoreLoading(store);
  const row = useDBRows(store)[0];

  useEffect(() => {
    store.executeQuery({
      query: { data: { entityId } },
    });
  }, [entityId, store]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!row) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Entity not found</p>
      </div>
    );
  }

  return <PageContent entity={row} />;
}

export default function Page({ params }: Props) {
  return (
    <PageShell title="Entity Workspace" noPadding>
      <PageInner params={params} />
    </PageShell>
  );
}
```

## 2. Workspace Content

```typescript
// page-content.tsx
'use client';

import type { Entity } from '@/lib/common/ds/types/module/Entity';
import { useEntityWorkspace, useWorkspaceMetrics } from './hooks/use-entity-workspace';
import { WorkspaceHeader } from './components/workspace-header';
import { MetricsBar } from './components/metrics-bar';
import { ItemsSection } from './components/sections/items-section';
import { DetailsSection } from './components/sections/details-section';

interface Props {
  entity: Entity;
}

export default function EntityWorkspaceContent({ entity }: Props) {
  const workspace = useEntityWorkspace(entity);
  const metrics = useWorkspaceMetrics(entity, workspace.items, workspace.otherData);

  return (
    <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex h-full flex-col overflow-auto">
      {/* Header with entity info and quick actions */}
      <WorkspaceHeader entity={entity} metrics={metrics} />

      {/* Metrics bar with key statistics */}
      <MetricsBar metrics={metrics} isLoading={workspace.isLoading} />

      {/* Collapsible sections for related data */}
      <div className="flex flex-col gap-4 p-6">
        <ItemsSection
          entity={entity}
          items={workspace.items}
          itemsStore={workspace.itemsStore}
          isLoading={workspace.isItemsLoading}
        />

        <DetailsSection 
          entity={entity} 
          entityStore={workspace.entityStore} 
        />
      </div>
    </div>
  );
}
```

## 3. Workspace Hook

```typescript
// hooks/use-entity-workspace.ts
'use client';

import type { Entity } from '@/lib/common/ds/types/module/Entity';
import type { RelatedItem } from '@/lib/common/ds/types/module/RelatedItem';
import { useStore } from 'venky-core/client';
import { usePreQuery, useDBRows, useIsStoreLoading } from 'venky-core/ui';
import { useEffect, useMemo } from 'react';
import { useEntityStore } from '../../hooks/use-store';

export function useEntityWorkspace(entity: Entity) {
  const entityId = entity.entityId;

  // Reuse shared entity store (already loaded from page.tsx)
  const entityStore = useEntityStore();

  // Related items store
  const itemsStore = useStore<RelatedItem>({
    datasourceId: 'RelatedItem',
    page: 'entity-workspace',
    alias: 'workspace-items',
    limit: 100,
    includeCount: true,
    autoQuery: false,
  });

  // Filter items by parent entity ID
  usePreQuery(itemsStore, (query) => {
    query.match = query.match || {};
    query.match.entityId = entityId;
    return query;
  });

  // Execute queries when entityId changes
  useEffect(() => {
    if (entityId) {
      itemsStore.executeQuery();
    }
  }, [entityId, itemsStore]);

  // Get reactive data
  const items = useDBRows(itemsStore);
  const isItemsLoading = useIsStoreLoading(itemsStore);

  return {
    entityStore,
    itemsStore,
    items,
    isItemsLoading,
    isLoading: isItemsLoading,
  };
}

// Computed metrics from workspace data
export function useWorkspaceMetrics(
  entity: Entity,
  items: readonly RelatedItem[],
  // ... other data
) {
  return useMemo(() => {
    const totalItems = items.length;
    const activeItems = items.filter((i) => i.status === 'active').length;
    const completionPercent = totalItems > 0 
      ? Math.round((activeItems / totalItems) * 100) 
      : 0;

    return {
      items: {
        total: totalItems,
        active: activeItems,
        completionPercent,
      },
      // ... other computed metrics
    };
  }, [entity, items]);
}
```

## 4. Collapsible Section Component

```typescript
// components/collapsible-section.tsx
'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  summary?: string;
  actions?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleSection({ 
  title, 
  summary, 
  actions, 
  children, 
  defaultOpen = true 
}: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border bg-card">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="size-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-5 text-muted-foreground" />
          )}
          <h3 className="font-semibold">{title}</h3>
          {summary && (
            <span className="text-muted-foreground text-sm">· {summary}</span>
          )}
        </div>
        {actions && (
          <div onClick={(e) => e.stopPropagation()}>
            {actions}
          </div>
        )}
      </button>
      
      <div className={cn('border-t px-4 pb-4', !isOpen && 'hidden')}>
        {children}
      </div>
    </div>
  );
}
```

## 5. Section Component Pattern

```typescript
// components/sections/items-section.tsx
'use client';

import { useState, useCallback } from 'react';
import type { Entity } from '@/lib/common/ds/types/module/Entity';
import type { RelatedItem } from '@/lib/common/ds/types/module/RelatedItem';
import type { Store } from 'venky-core/common';
import { CollapsibleSection } from '../collapsible-section';
import { ItemCard } from '../cards/item-card';
import { AddItemDialog } from '../dialogs/add-item-dialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { showSuccess, showError } from 'venky-core/ui';

interface Props {
  entity: Entity;
  items: readonly RelatedItem[];
  itemsStore: Store<RelatedItem>;
  isLoading: boolean;
}

export function ItemsSection({ entity, items, itemsStore, isLoading }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RelatedItem | null>(null);

  const summary = `${items.length} ${items.length === 1 ? 'item' : 'items'}`;

  // Initialize store BEFORE opening dialog
  const handleAdd = useCallback(() => {
    itemsStore.createNew({
      partialRecord: {
        entityId: entity.entityId,
        status: 'draft',
      },
    });
    setEditingItem(null);
    setIsDialogOpen(true);
  }, [itemsStore, entity]);

  const handleEdit = useCallback((item: RelatedItem) => {
    itemsStore.setCurrentRow(item);
    setEditingItem(item);
    setIsDialogOpen(true);
  }, [itemsStore]);

  const handleDelete = useCallback(async (item: RelatedItem) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await itemsStore.deleteRow(item.itemId);
      showSuccess('Item deleted');
    } catch {
      showError('Failed to delete');
    }
  }, [itemsStore]);

  const handleSaved = useCallback(() => {
    setIsDialogOpen(false);
    setEditingItem(null);
    itemsStore.executeQuery();
  }, [itemsStore]);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      itemsStore.resetStore();
      setEditingItem(null);
    }
  }, [itemsStore]);

  return (
    <>
      <CollapsibleSection
        title="Items"
        summary={summary}
        actions={
          <Button variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="mr-1 size-4" />
            Add Item
          </Button>
        }
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <p className="text-muted-foreground">No items yet</p>
            <Button variant="outline" size="sm" onClick={handleAdd}>
              <Plus className="mr-1 size-4" />
              Add First Item
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 pt-4">
            {items.map((item) => (
              <ItemCard
                key={item.itemId}
                item={item}
                onEdit={() => handleEdit(item)}
                onDelete={() => handleDelete(item)}
              />
            ))}

            {/* Add card placeholder */}
            <button
              type="button"
              onClick={handleAdd}
              className="flex min-h-[120px] min-w-[200px] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-muted/20 p-4 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/40"
            >
              <Plus className="size-6" />
              <span className="font-medium text-sm">Add Item</span>
            </button>
          </div>
        )}
      </CollapsibleSection>

      <AddItemDialog
        open={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
        entity={entity}
        item={editingItem}
        itemsStore={itemsStore}
        onSaved={handleSaved}
      />
    </>
  );
}
```

## Key Design Principles

1. **Single Page View** - All related data visible without navigation
2. **Collapsible Sections** - Users can expand/collapse to focus
3. **Card-Based Display** - Visual representation over dense tables
4. **Centralized Workspace Hook** - One hook manages all related stores
5. **usePreQuery for Filtering** - Automatic parent ID filtering
6. **Dialog-Based Editing** - Clean CRUD with Popup dialogs
7. **Computed Metrics** - Real-time statistics in header/metrics bar
8. **Loading States per Section** - Independent loading indicators

## Comparison with Multi-Tab Pattern

| Aspect | Multi-Tab | Master/Detail Workspace |
|--------|-----------|------------------------|
| Navigation | Tab switching | Scrolling, all visible |
| Focus | One section at a time | Overview of all data |
| Best for | Deep detail pages | Dashboard-like views |
| Related data | Separate tabs | Collapsible sections |
| Editing | Inline or dialog | Dialog-based |
| Metrics | Per-tab or header | Prominent metrics bar |

## When to Use Which

**Use Multi-Tab when:**
- Each section has extensive detail (forms, tables)
- Sections are independent workflows
- URL state for specific tab is important

**Use Master/Detail Workspace when:**
- Overview of entity with all relationships
- Related data is card/visual friendly
- Users need to see everything at once
- Dashboard-style information display
