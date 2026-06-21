import { withDBSessionRoute } from '../../../../lib/core/server/withDBRoutes';
import { PREFIX } from '../../../../lib/server/constants';
import { getConfig } from '../../../../lib/core/server/config';
import { UserError } from '../../../../lib/core/common/error';
export const GET = withDBSessionRoute(async function callback(client, session) {
  if (process.env.ENABLE_SQL_BROWSER !== 'true') {
    throw new UserError('SQL browser is disabled');
  }
  if (!session.user.roles.includes('admin')) {
    throw new UserError('Access restricted to admins');
  }
  const appId = getConfig('getSQLHistory').appId;
  const historyQuery = `
    SELECT 
      id,
      query,
      name,
      created_at as timestamp
    FROM ${PREFIX}sql_history 
    WHERE created_by = $1 AND app_id = $2
    ORDER BY created_at DESC 
    LIMIT 100
  `;
  const result = await client.query(historyQuery, [session.user.userName, appId]);
  return Response.json({
    status: 'OK',
    history: result.rows,
  });
});
export const POST = withDBSessionRoute(async function callback(client, session, req) {
  if (process.env.ENABLE_SQL_BROWSER !== 'true') {
    throw new UserError('SQL browser is disabled');
  }
  if (!session.user.roles.includes('admin')) {
    throw new UserError('Access restricted to admins');
  }
  const body = await req.json();
  const { query, name } = body;
  if (!query || typeof query !== 'string') {
    throw new UserError('Query is required');
  }
  const appId = getConfig('saveSQLHistory').appId;
  const checkDuplicateQuery = `
    SELECT id, created_at 
    FROM ${PREFIX}sql_history 
    WHERE created_by = $1 AND query = $2 AND app_id = $3
    ORDER BY created_at DESC 
    LIMIT 1
  `;
  const duplicateResult = await client.query(checkDuplicateQuery, [session.user.userName, query, appId]);
  if (duplicateResult.rows.length > 0) {
    const updateQuery = `
      UPDATE ${PREFIX}sql_history 
      SET created_at = NOW(), name = COALESCE($2, name)
      WHERE id = $1 AND app_id = $3
      RETURNING id
    `;
    const result = await client.query(updateQuery, [duplicateResult.rows[0].id, name || null, appId]);
    return Response.json({
      status: 'OK',
      id: result.rows[0]?.id,
      updated: true,
    });
  } else {
    const saveQuery = `
      INSERT INTO ${PREFIX}sql_history (created_by, query, name, created_at, app_id)
      VALUES ($1, $2, $3, NOW(), $4)
      RETURNING id
    `;
    const result = await client.query(saveQuery, [session.user.userName, query, name || null, appId]);
    return Response.json({
      status: 'OK',
      id: result.rows[0]?.id,
      updated: false,
    });
  }
});
//# sourceMappingURL=route.js.map
