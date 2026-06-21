import type { PgPoolClient } from '../../../../../lib/core/server/db';
import type { Session } from '../../../../../auth';
export declare function resendEmailRequest(client: PgPoolClient, _session: Session, requestId: number): Promise<void>;
//# sourceMappingURL=action.d.ts.map