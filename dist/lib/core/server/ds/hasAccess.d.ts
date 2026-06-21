import type { DataSource } from '../../../../lib/core/common/ds/types/DataSource';
import type { Session } from '../../../../auth';
export declare function hasAccess<T extends object>(ds: DataSource<T>, session: Session, accessType: 'Query' | 'Update' | 'Insert' | 'Delete' | 'Export' | 'Audit'): Promise<boolean>;
//# sourceMappingURL=hasAccess.d.ts.map