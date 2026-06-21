import { withDBSessionRoute } from '../../../../lib/core/server/withDBRoutes';
import { UserError } from '../../../../lib/core/common/error';
export const POST = withDBSessionRoute(async function callback(client, session, req) {
  if (!session.user.roles.includes('admin')) {
    throw new UserError('Access restricted to admins');
  }
  const body = await req.json();
  const { schema, table } = body;
  if (!schema || !table) {
    throw new UserError('Schema and table parameters are required');
  }
  const columnQuery = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale
      FROM information_schema.columns 
      WHERE table_schema = $1 AND table_name = $2
      ORDER BY ordinal_position
    `;
  const result = await client.query(columnQuery, [schema, table]);
  return Response.json({
    status: 'OK',
    data: {
      schema,
      table,
      columns: result.rows,
    },
  });
});
//# sourceMappingURL=route.js.map
