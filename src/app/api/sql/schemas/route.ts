import { withDBSessionRoute } from '@/lib/core/server/withDBRoutes';
import type { Session } from '@/auth';
import type { PgPoolClient } from '@/lib/core/server/db';
import { UserError } from '@/lib/core/common/error';

export const GET = withDBSessionRoute(async (client: PgPoolClient, session: Session) => {
  if (process.env.ENABLE_SQL_BROWSER !== 'true') {
    throw new UserError('SQL browser is disabled');
  }
  // Check admin role
  if (!session.user.roles.includes('admin')) {
    throw new UserError('Access restricted to admins');
  }

  // Query to get schemas, tables, and views
  const schemaQuery = `
    SELECT 
      table_schema,
      table_name,
      table_type
    FROM information_schema.tables 
    WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
    ORDER BY table_schema, table_type, table_name
    LIMIT 1000
  `;

  const result = await client.query<{
    table_schema: string;
    table_name: string;
    table_type: string;
  }>(schemaQuery);

  // Group by schema
  const schemas: Record<string, { tables: string[]; views: string[] }> = {};

  for (const row of result.rows) {
    const { table_schema, table_name, table_type } = row;

    if (!schemas[table_schema]) {
      schemas[table_schema] = { tables: [], views: [] };
    }

    if (table_type === 'BASE TABLE') {
      schemas[table_schema].tables.push(table_name);
    } else if (table_type === 'VIEW') {
      schemas[table_schema].views.push(table_name);
    }
  }

  // Transform to tree structure
  const schemaTree = Object.entries(schemas).map(([schemaName, schemaData]) => ({
    name: schemaName,
    type: 'schema' as const,
    expanded: false,
    children: [
      ...schemaData.tables.map((tableName) => ({
        name: tableName,
        type: 'table' as const,
        expanded: false,
      })),
      ...schemaData.views.map((viewName) => ({
        name: viewName,
        type: 'view' as const,
        expanded: false,
      })),
    ],
  }));

  return Response.json({
    status: 'OK',
    schemas: schemaTree,
  });
});
