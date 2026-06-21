import type { Column, Table } from './types';
export declare const genColumns: (tableName: string, schemaName: string) => Promise<import("../../../venky-exports/core/common").ErrorResponse | Column[]>;
export declare const getTableNames: (filter: string) => Promise<import("../../../venky-exports/core/common").ErrorResponse | Table[]>;
//# sourceMappingURL=action.d.ts.map