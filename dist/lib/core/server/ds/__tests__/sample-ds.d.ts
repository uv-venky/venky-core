import type { DataSource, ISODateString } from '../../../../../lib/core/common/ds/types/DataSource';
import type { DBRow } from '../../../../../lib/core/common/ds/types/filter';
import type { TF, YN } from '../../../../../lib/core/common/ds/types/YN';
export interface TestDataSourceType {
    createdAt: ISODateString;
    createdBy: string;
    description?: string | null;
    endDate?: ISODateString | null;
    roleCode: string;
    roleName: string;
    startDate: ISODateString;
    updatedAt: ISODateString;
    updatedBy: string;
    seqNo: number;
    calcField: number;
    isActive: boolean;
    ynFlag: YN;
    tfFlag: TF;
}
export declare function getTestRow(id: number): DBRow<TestDataSourceType>;
export declare const TestDS: DataSource<TestDataSourceType>;
export declare const BASE_QUERY = "SELECT x.\"created_at\" \"createdAt\", x.\"created_by\" \"createdBy\", x.\"description\" \"description\", x.\"end_date\" \"endDate\", x.\"role_code\" \"roleCode\", x.\"role_name\" \"roleName\", x.\"start_date\" \"startDate\", x.\"updated_at\" \"updatedAt\", x.\"updated_by\" \"updatedBy\", x.\"seq_no\" \"seqNo\", x.seq_no * 2 \"calcField\", x.\"is_active\" \"isActive\", x.\"yn_flag\" \"ynFlag\", x.\"tf_flag\" \"tfFlag\" FROM \"test_data_source_table\" AS x";
//# sourceMappingURL=sample-ds.d.ts.map