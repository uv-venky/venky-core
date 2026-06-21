import type { DataSource } from '../../../../lib/core/common/ds/types/DataSource';
import type { Query } from '../../../../lib/core/common/ds/types/filter';
import type { PgPoolClient } from '../../../../lib/core/server/db';
import type { QueryResult } from '../../../../lib/core/server/ds/ds_types';
import type { Session } from '../../../../auth';
export declare function queryDataSource<T extends object>(client: PgPoolClient, session: Session, ds: DataSource<T>, query: Query<T>): Promise<QueryResult<T>>;
//# sourceMappingURL=queryDataSource.d.ts.map