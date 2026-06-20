# DataSource Reference

Complete patterns for creating DataSource definitions.

## Directory Structure

```
src/lib/server/ds/defs/
├── defaults.ts           # DefaultDataSource, DefaultAttribute, DefaultAccess
├── index.ts              # getAllDataSources(), getDataSource()
└── module/
    ├── EntityDS.ts       # DataSource definition
    └── index.ts          # Module exports
```

## Basic DataSource Definition

```typescript
/* Copyright (c) 2024-present Venky Corp. */

import type { DataSource } from 'venky-core/common';
import { DefaultAttribute, DefaultDataSource, DefaultFullAccess, DefaultReadOnlyAccess } from 'venky-core/ds';
import type { Entity } from '@/lib/common/ds/types/module/Entity';
import { PREFIX } from '@/lib/server/constants';

export const EntityDataSource: DataSource<Entity> = {
  ...DefaultDataSource,
  id: 'Entity',
  tableName: `${PREFIX}entity`,
  description: 'Entity description',
  attributes: [
    // Primary key
    {
      ...DefaultAttribute,
      code: 'id',
      name: 'ID',
      type: 'Text',
      column: 'id',
      maxLength: 40,
      primary: true,
      defaultValue: 'ULID',
      optional: false,
    },
    // Text field
    {
      ...DefaultAttribute,
      code: 'name',
      name: 'Name',
      type: 'Text',
      column: 'name',
      maxLength: 120,
      optional: false,
    },
    // Optional text field
    {
      ...DefaultAttribute,
      code: 'description',
      name: 'Description',
      type: 'Text',
      column: 'description',
      maxLength: 500,
      // optional: true is default
    },
    // Number field
    {
      ...DefaultAttribute,
      code: 'amount',
      name: 'Amount',
      type: 'Number',
      column: 'amount',
      allowDecimals: true,
    },
    // Date field
    {
      ...DefaultAttribute,
      code: 'createdAt',
      name: 'Created At',
      type: 'Date',
      column: 'created_at',
      optional: false,
    },
    // Boolean field
    {
      ...DefaultAttribute,
      code: 'isActive',
      name: 'Is Active',
      type: 'Boolean',
      column: 'is_active',
      optional: false,
    },
    // Foreign key reference
    {
      ...DefaultAttribute,
      code: 'userId',
      name: 'User ID',
      type: 'Text',
      column: 'user_id',
      maxLength: 40,
      ref: 'Users',
      refTableName: 'uv_users',
    },
    // Audit fields
    {
      ...DefaultAttribute,
      code: 'createdBy',
      name: 'Created By',
      type: 'Text',
      column: 'created_by',
      maxLength: 128,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'updatedAt',
      name: 'Updated At',
      type: 'Date',
      column: 'updated_at',
    },
    {
      ...DefaultAttribute,
      code: 'updatedBy',
      name: 'Updated By',
      type: 'Text',
      column: 'updated_by',
      maxLength: 128,
    },
  ],
  access: [
    {
      ...DefaultReadOnlyAccess,
      roleCode: 'viewer',
    },
    {
      ...DefaultFullAccess,
      roleCode: 'editor',
    },
    {
      ...DefaultFullAccess,
      roleCode: 'admin',
    },
  ],
};
```

## Attribute Types

| Type | Description | Properties |
|------|-------------|------------|
| `Text` | String values | `maxLength` |
| `Number` | Numeric values | `allowDecimals` |
| `Date` | Date/datetime | - |
| `Boolean` | True/false | - |

## Calculated Attributes

SQL-based calculations for derived fields:

```typescript
{
  ...DefaultAttribute,
  code: 'totalAmount',
  name: 'Total Amount',
  type: 'Number',
  allowDecimals: true,
  calculated: true,
  column: 'quantity * unit_price',  // SQL expression
},
{
  ...DefaultAttribute,
  code: 'fullName',
  name: 'Full Name',
  type: 'Text',
  calculated: true,
  column: "CONCAT(first_name, ' ', last_name)",
},
{
  ...DefaultAttribute,
  code: 'daysSinceCreated',
  name: 'Days Since Created',
  type: 'Number',
  calculated: true,
  column: "EXTRACT(DAY FROM NOW() - created_at)",
},
```

**Notes:**
- `calculated: true` marks field as computed
- `column` contains SQL expression (not column name)
- Calculated fields are read-only
- Use column names (snake_case) in SQL

## Access Roles

```typescript
// Read-only access
{
  ...DefaultReadOnlyAccess,  // query: true, export: true
  roleCode: 'viewer',
}

// Full access
{
  ...DefaultFullAccess,  // query, insert, update, delete, audit, export: true
  roleCode: 'admin',
}

// Custom access
{
  roleCode: 'editor',
  query: true,
  insert: true,
  update: true,
  delete: false,
  audit: true,
  export: true,
}
```

## TypeScript Type Definition

Create matching type in `src/lib/common/ds/types/module/Entity.ts`:

```typescript
/* Copyright (c) 2024-present Venky Corp. */

export interface Entity {
  id: string;
  name: string;
  description?: string;
  amount?: number;
  createdAt: string;
  isActive: boolean;
  userId?: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}
```

## Lifecycle Hooks

### Query Hooks

```typescript
export const EntityDataSource: DataSource<Entity> = {
  ...DefaultDataSource,
  
  // Modify query before execution
  preQuery: async ({ query, session, client }) => {
    if (!session.user.roles.includes('admin')) {
      query.filters = [...(query.filters || []), { userId: { is: session.user.id } }];
    }
    return query;
  },

  // Modify SQL directly (use sparingly)
  preQuery2: ({ query, sql, params, session }) => {
    const planId = query.match?.planId;
    if (planId) {
      params.push(planId);
      sql = sql.replace('WHERE', `WHERE plan_id = $${params.length} AND`);
    }
    return { sql, params };
  },

  // Process results before returning
  postQuery: async ({ rows, session }) => {
    return rows.map(row => ({
      ...row,
      displayName: `${row.firstName} ${row.lastName}`,
    }));
  },
};
```

### Insert/Update/Delete Hooks

```typescript
import { UserError } from 'venky-core/common';

export const EntityDataSource: DataSource<Entity> = {
  ...DefaultDataSource,

  beforeInsert: async ({ rows, session }) => {
    // Validate or transform data before insert
    // Note: Audit columns (createdAt, createdBy) are set automatically by the framework
    for (const row of rows) {
      if (!row.name?.trim()) {
        throw new UserError('Name is required');
      }
      // Set defaults that aren't handled by DataSource defaultValue
      if (!row.status) {
        row.status = 'draft';
      }
    }
    return { rows };
  },

  afterInsert: async ({ rows, session, client }) => {
    // Notifications, related records, etc.
    return rows;
  },

  beforeUpdate: async ({ rows, session }) => {
    // Validate or transform data before update
    // Note: Audit columns (updatedAt, updatedBy) are set automatically by the framework
    for (const row of rows) {
      if (row.status === 'published' && !row.publishedAt) {
        row.publishedAt = new Date().toISOString();
      }
    }
    return { rows };
  },

  afterUpdate: async ({ rows, client }) => {
    // Side effects: notifications, cache invalidation, etc.
    // Runs within same transaction
    return rows;
  },

  beforeDelete: async ({ rows }) => {
    for (const row of rows) {
      if (row.isProtected) {
        throw new UserError('Cannot delete protected records');
      }
    }
    return rows;
  },

  afterDelete: async ({ rows }) => {
    // Cleanup, notifications, etc.
    return rows;
  },
};
```

### Cascade Delete Pattern (afterDelete)

Use `afterDelete` for cascade deleting related records:

```typescript
import type { DataSource, DBRow } from 'venky-core/common';
import { UserError } from 'venky-core/common';
import { DefaultAttribute, DefaultDataSource, DefaultFullAccess } from 'venky-core/ds';
import type { PgPoolClient } from 'venky-core/server';
import type { Session } from 'venky-core/auth';
import type { Project } from '@/lib/common/ds/types/module/Project';

export const ProjectDS: DataSource<Project> = {
  ...DefaultDataSource,
  // ... attributes and access ...

  async afterDelete(props: {
    rows: DBRow<Project>[];
    session: Session;
    client: PgPoolClient;
  }): Promise<DBRow<Project>[]> {
    const { client, rows } = props;

    if (rows.length === 0) {
      return rows;
    }

    // Prevent bulk delete (optional safety check)
    if (rows.length > 1) {
      throw new UserError('Bulk deletion is not supported.');
    }

    const projectId = rows[0].projectId;
    if (!projectId) {
      return rows;
    }

    // Cascade delete related records
    await client.query(`DELETE FROM project_tasks WHERE project_id = $1`, [projectId]);
    await client.query(`DELETE FROM project_roles WHERE project_id = $1`, [projectId]);

    return rows;
  },
};
```

**Important notes for `afterDelete`:**
- Use `DBRow<T>` (not `Row<T>`) for the rows type
- Import `Session` from `venky-core/auth` (not `venky-core/server`)
- Add explicit return type `Promise<DBRow<T>[]>`
- Runs within the same transaction as the delete
- Consider adding bulk delete prevention for safety

## Hook Reference

| Hook | When | Returns |
|------|------|---------|
| `preQuery` | Before query | Modified `Query<T>` |
| `preQuery2` | After preQuery | `{ sql, params }` |
| `postQuery` | After results | Modified `DBRow<T>[]` |
| `beforeInsert` | Before insert | `{ rows, skipDML? }` |
| `afterInsert` | After insert | `DBRow<T>[]` |
| `beforeUpdate` | Before update | `{ rows, skipDML? }` |
| `afterUpdate` | After update | `DBRow<T>[]` |
| `beforeDelete` | Before delete | `DBRow<T>[]` |
| `afterDelete` | After delete | `DBRow<T>[]` |

## Registration

```typescript
// src/lib/server/ds/defs/module/index.ts
export { EntityDataSource } from './EntityDS';

// src/lib/server/ds/defs/index.ts
import { EntityDataSource } from './module';

const allDataSources = {
  Entity: EntityDataSource,
};
```

## Hot-Reloading (Dev Mode)

DataSource changes auto-reload without server restart:
1. Save the file
2. Make any request (refresh page)
3. New definition is loaded

**When to restart:**
- After modifying `init.ts`
- After changing core package
