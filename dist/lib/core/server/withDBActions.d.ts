import { type ErrorResponse } from '../../../lib/core/common/error';
import { type PgPoolClient } from '../../../lib/core/server/db';
import type { Session } from '../../../auth';
export declare const withDB: (
  callback: (client: PgPoolClient, request: Request) => Promise<Response>,
) => (request: Request) => Promise<Response>;
export declare const withDBSessionAction: <Args extends unknown[], Output>(
  callback: (client: PgPoolClient, session: Session, ...args: Args) => Promise<Output>,
) => (...args: Args) => Promise<Output | ErrorResponse>;
export declare const withSessionAction: <Args extends any[], Output>(
  callback: (session: Session, ...args: Args) => Promise<Output>,
) => (...args: Args) => Promise<Output | ErrorResponse>;
export declare const withDBAction: <Args extends unknown[], Output>(
  callback: (client: PgPoolClient, ...args: Args) => Promise<Output>,
) => (...args: Args) => Promise<Output | ErrorResponse>;
//# sourceMappingURL=withDBActions.d.ts.map
