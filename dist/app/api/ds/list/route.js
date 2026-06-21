import { withDBSessionRoute } from '../../../../lib/core/server/withDBRoutes';
import { getAllDataSources } from '../../../../lib/server/ds/defs/ds';
export const GET = withDBSessionRoute(async function callback(_client, session) {
  // Convert DataSources object to array format
  const dataSourceList = Object.entries(getAllDataSources())
    .map(([id, ds]) => {
      const d = ds;
      return {
        id,
        type: d.type,
        description: d.description,
        readOnly: d.readOnly,
        attributes: d.attributes.map(({ column, refTableName, refWhereClause, ref, ...rest }) => rest),
        access: (d.access || []).filter((a) => session.user.roles.includes(a.roleCode)),
      };
    })
    .filter((ds) => ds.access.length > 0);
  return Response.json({
    status: 'OK',
    dataSources: dataSourceList,
  });
});
export const runtime = 'nodejs';
//# sourceMappingURL=route.js.map
