import type { DataSource } from '../../../../lib/core/common/ds/types/DataSource';
import type { Row } from '../../../../lib/core/common/ds/types/filter';
import type { PgPoolClient } from '../../../../lib/core/server/db';
import type { QueryResult } from '../../../../lib/core/server/ds/ds_types';
import type { Session } from '../../../../auth';
export interface PostDataSourceOptions {
    /** Browser tab trackId for self-refresh prevention in autoRefresh stores */
    sourceTrackId?: string;
    /** Skip publishing SSE event (e.g., for internal system operations) */
    skipSSE?: boolean;
}
export declare function postDataSource<T extends object>(client: PgPoolClient, session: Session, ds: DataSource<T>, rows: Row<T>[], options?: PostDataSourceOptions): Promise<QueryResult<T>>;
//# sourceMappingURL=postDataSource.d.ts.map