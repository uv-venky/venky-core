import { type PgPoolClient } from '../../../lib/core/server/db';
import type { Session } from '../../../auth';
export declare const withDBSessionPage: (
  callback: (
    client: PgPoolClient,
    session: Session,
    props: {
      params: Promise<any>;
    },
  ) => Promise<React.ReactNode>,
) => (props: { params: Promise<any> }) => Promise<React.ReactNode>;
//# sourceMappingURL=withDBPages.d.ts.map
