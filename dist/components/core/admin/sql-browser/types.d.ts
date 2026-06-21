import type { AttributeType } from '../../../../lib/core/common/ds/types/AttributeType';
export interface QueryTab {
    id: string;
    name: string;
    sql: string;
    result?: QueryResult;
}
export interface QueryResult {
    columns: {
        name: string;
        type: AttributeType;
    }[];
    rows: Record<string, any>[];
    rowCount: number;
    executionTime: number;
    error?: string;
}
//# sourceMappingURL=types.d.ts.map