import { type ErrorResponse } from '../../../lib/core/common/error';
import { type PgPoolReadOnlyClient } from '../../../lib/core/server/db';
import type { Session } from '../../../auth';
/**
 * Server action wrapper that provides a readonly DB client.
 * No BEGIN/COMMIT — the readonly pool already sets default_transaction_read_only
 * at the session level, and autocommit is sufficient for read-only work.
 */
export declare const withReadOnlyDBSessionAction: <Args extends unknown[], Output>(
  callback: (client: PgPoolReadOnlyClient, session: Session, ...args: Args) => Promise<Output>,
) => (...args: Args) => Promise<Output | ErrorResponse>;
export declare const withReadOnlyDBAction: <Args extends unknown[], Output>(
  callback: (client: PgPoolReadOnlyClient, ...args: Args) => Promise<Output>,
) => (...args: Args) => Promise<Output | ErrorResponse>;
//# sourceMappingURL=withReadOnlyDBActions.d.ts.map
