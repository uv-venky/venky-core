import { withDBSessionRoute } from '@/lib/core/server/withDBRoutes';
import type { Session } from '@/auth';
import type { PgPoolClient } from '@/lib/core/server/db';
import type { DataSource } from '@/lib/core/common/ds/types/DataSource';
import { getAllDataSources } from '@/lib/server/ds/defs/ds';

export const GET = withDBSessionRoute(async function callback(_client: PgPoolClient, session: Session) {
  // Convert DataSources object to array format
  const dataSourceList = Object.entries(getAllDataSources())
    .map(([id, ds]) => {
      const d = ds as DataSource<any>;
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
