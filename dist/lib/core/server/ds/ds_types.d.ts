import type { DBRow } from '../../../../lib/core/common/ds/types/filter';
export interface FieldDef {
    name: string;
    tableID: number;
    columnID: number;
    dataTypeID: number;
    dataTypeSize: number;
    dataTypeModifier: number;
    format: string;
}
export type QueryResult<T extends object> = {
    rows: DBRow<T>[];
    elapsed?: number;
    fields?: FieldDef[];
    sql?: string;
    params?: unknown[];
    count?: number;
};
//# sourceMappingURL=ds_types.d.ts.map