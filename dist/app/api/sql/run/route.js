import logger from '../../../../lib/core/server/logger';
import { getAttributeType } from '../../../../app/(secure)/gen/utils';
import { withDBSessionRoute } from '../../../../lib/core/server/withDBRoutes';
import { UserError } from '../../../../lib/core/common/error';
import { assertReadOnlySelect, getPgTypeName } from '../../../../lib/server/sql/read-only-select';
// Cap rows even when the admin's query has no LIMIT — wrapping in a derived
// table is safer than appending text (handles ORDER BY / LIMIT inside the
// admin's query without breaking precedence).
const MAX_ROWS = 1000;
function prepareQuery(raw) {
  // Single source of truth for read-only validation: shared with the agent
  // path. Rejects multi-statement, DML/DDL, denied functions, and comment
  // decoys via AST inspection.
  assertReadOnlySelect(raw);
  const trimmed = raw.replace(/;\s*$/g, '').trim();
  // Wrap in a derived table so the row cap stops Postgres scanning early
  // without colliding with any LIMIT/ORDER BY the admin already wrote.
  return `SELECT * FROM (${trimmed}) AS _VENKY_capped LIMIT ${MAX_ROWS}`;
}
export const POST = withDBSessionRoute(async (client, session, request) => {
  if (process.env.ENABLE_SQL_BROWSER !== 'true') {
    throw new UserError('SQL browser is disabled');
  }
  // Check admin role
  if (!session.user.roles.includes('admin')) {
    throw new UserError('Access restricted to admins');
  }
  const body = await request.json();
  const { query: sqlQuery } = body;
  if (!sqlQuery || typeof sqlQuery !== 'string') {
    throw new UserError('Query is required');
  }
  let query;
  try {
    query = prepareQuery(sqlQuery);
  } catch (err) {
    throw new UserError(err.message);
  }
  // Execute query in read-only mode for defense in depth
  await client.query('SET TRANSACTION READ ONLY');
  const startTime = Date.now();
  const result = await client.query(query);
  const executionTime = Date.now() - startTime;
  // Transform result for frontend with column types
  const columns =
    result.fields?.map((field) => {
      const pgType = getPgTypeName(field);
      return {
        name: field.name,
        type: getAttributeType(pgType, 0) || 'Text',
      };
    }) || [];
  const rows = result.rows || [];
  if (logger.debugEnabled) {
    logger.debug(`SQL Query executed by ${session.user.userName}:`, {
      query,
      timestamp: new Date().toISOString(),
      userId: session.user.userId,
      userName: session.user.userName,
      rowCount: rows.length,
      executionTime,
    });
  }
  return Response.json({
    status: 'OK',
    columns,
    rows,
    rowCount: rows.length,
    executionTime,
  });
});
//# sourceMappingURL=route.js.map
