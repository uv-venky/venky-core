import type { PgPoolClient } from '../../../../../lib/core/server/db';
import type { Session } from '../../../../../auth';
import { type CacheStats } from '../../../../../lib/core/server/cache';
export declare function getCacheStatsAction(_client: PgPoolClient, session: Session): Promise<CacheStats>;
export declare function clearCacheAction(_client: PgPoolClient, session: Session): Promise<void>;
//# sourceMappingURL=action.d.ts.map