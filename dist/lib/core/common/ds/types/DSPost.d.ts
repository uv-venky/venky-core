import type { DBRow } from '../../../../../lib/core/common/ds/types/filter.js';
import type { Transaction } from '../../../../../lib/core/common/ds/types/Transaction.js';
export type DSPost<T extends object> = {
    datasourceId: string;
    rows: DBRow<T>[];
    transaction?: Transaction;
};
//# sourceMappingURL=DSPost.d.ts.map