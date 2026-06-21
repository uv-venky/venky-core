import { type PgPoolClient } from '../../../lib/core/server/db';
import type { Session } from '../../../auth';
export declare const withDBSessionRoute: (
  callback: (
    client: PgPoolClient,
    session: Session,
    req: Request,
    routeContext: {
      params: Promise<any>;
    },
  ) => Promise<Response>,
) => (
  req: Request,
  routeContext: {
    params: Promise<any>;
  },
) => Promise<Response>;
export declare const withSessionRoute: (
  callback: (session: Session, req: Request) => Promise<Response>,
) => (req: Request) => Promise<Response>;
export declare const withDBRoute: (
  callback: (client: PgPoolClient, req: Request) => Promise<Response>,
) => (req: Request) => Promise<Response>;
//# sourceMappingURL=withDBRoutes.d.ts.map
