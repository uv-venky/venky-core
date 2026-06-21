import { type PgPoolReadOnlyClient } from '../../../lib/core/server/db';
import type { Session } from '../../../auth';
/**
 * Route handler wrapper that provides a readonly DB client.
 * No BEGIN/COMMIT — autocommit is sufficient; the readonly pool sets
 * default_transaction_read_only at the session level.
 */
export declare const withReadOnlyDBSessionRoute: (callback: (client: PgPoolReadOnlyClient, session: Session, req: Request, routeContext: {
    params: Promise<any>;
}) => Promise<Response>) => (req: Request, routeContext: {
    params: Promise<any>;
}) => Promise<Response>;
export declare const withReadOnlyDBRoute: (callback: (client: PgPoolReadOnlyClient, req: Request) => Promise<Response>) => (req: Request) => Promise<Response>;
//# sourceMappingURL=withReadOnlyDBRoutes.d.ts.map