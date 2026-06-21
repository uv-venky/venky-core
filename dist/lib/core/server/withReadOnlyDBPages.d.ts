import { type PgPoolReadOnlyClient } from '../../../lib/core/server/db';
import type { Session } from '../../../auth';
/**
 * Page wrapper that provides a readonly DB client.
 * No BEGIN/COMMIT — autocommit is sufficient for reads. Release always runs.
 */
export declare const withReadOnlyDBSessionPage: (callback: (client: PgPoolReadOnlyClient, session: Session, props: {
    params: Promise<any>;
}) => Promise<React.ReactNode>) => (props: {
    params: Promise<any>;
}) => Promise<React.ReactNode>;
//# sourceMappingURL=withReadOnlyDBPages.d.ts.map