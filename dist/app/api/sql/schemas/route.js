import { withDBSessionRoute } from '../../../../lib/core/server/withDBRoutes';
import { UserError } from '../../../../lib/core/common/error';
export const GET = withDBSessionRoute(async (client, session) => {
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
    const result = await client.query(schemaQuery);
    // Group by schema
    const schemas = {};
    for (const row of result.rows) {
        const { table_schema, table_name, table_type } = row;
        if (!schemas[table_schema]) {
            schemas[table_schema] = { tables: [], views: [] };
        }
        if (table_type === 'BASE TABLE') {
            schemas[table_schema].tables.push(table_name);
        }
        else if (table_type === 'VIEW') {
            schemas[table_schema].views.push(table_name);
        }
    }
    // Transform to tree structure
    const schemaTree = Object.entries(schemas).map(([schemaName, schemaData]) => ({
        name: schemaName,
        type: 'schema',
        expanded: false,
        children: [
            ...schemaData.tables.map((tableName) => ({
                name: tableName,
                type: 'table',
                expanded: false,
            })),
            ...schemaData.views.map((viewName) => ({
                name: viewName,
                type: 'view',
                expanded: false,
            })),
        ],
    }));
    return Response.json({
        status: 'OK',
        schemas: schemaTree,
    });
});
//# sourceMappingURL=route.js.map