import type { ISODateString } from '../../../../../lib/core/common/ds/types/DataSource';
export type AuditValueType = 'String' | 'Number' | 'Date' | 'JSON' | 'CLOB';
export interface Audit {
    appId: string;
    attributeCode: string;
    auditId: number;
    datasourceId: string;
    newClobValue?: string | null;
    newDatetimeValue?: ISODateString | null;
    newDoubleValue?: number | null;
    newStringValue?: string | null;
    oldClobValue?: string | null;
    oldDatetimeValue?: ISODateString | null;
    oldDoubleValue?: number | null;
    oldStringValue?: string | null;
    pkValue: string;
    updatedAt: ISODateString;
    updatedBy: string;
    valueType: AuditValueType;
}
//# sourceMappingURL=Audit.d.ts.map