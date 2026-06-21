import type { Roles } from '../../../../lib/common/ds/types/core/Roles';
import type { Column } from '../../../../components/core/smart-search/types';
import type { TF, YN } from '../../../../lib/core/common/ds/types/YN';
export type TestRoles = Roles & {
    seqNo: number;
    ynFlag: YN;
    tfFlag: TF;
    boolFlag: boolean;
};
export declare const columns: Column<TestRoles>[];
//# sourceMappingURL=test-data.d.ts.map