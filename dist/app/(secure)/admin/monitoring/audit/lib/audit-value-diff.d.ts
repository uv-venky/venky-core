import type { AuditValueType } from '../../../../../../lib/common/ds/types/core/Audit';
export type AuditChangeType = 'added' | 'removed' | 'modified' | 'activated' | 'deactivated';
export interface AuditRowValueData {
    valueType?: AuditValueType | string;
    oldStringValue?: string | null;
    newStringValue?: string | null;
    oldDoubleValue?: number | null;
    newDoubleValue?: number | null;
    oldDatetimeValue?: string | null;
    newDatetimeValue?: string | null;
    oldClobValue?: string | null;
    newClobValue?: string | null;
    attributeCode?: string;
}
export declare function getAuditRawValue(data: AuditRowValueData, isOld: boolean): unknown;
export declare function getAuditChangeType(data: AuditRowValueData): AuditChangeType;
export declare function formatAuditValueForDiff(value: unknown, valueType?: string): string;
export declare function getAuditDiffTexts(data: AuditRowValueData): {
    oldText: string;
    newText: string;
    language: 'json' | 'plaintext';
};
export declare function canShowAuditValueDiff(data: AuditRowValueData): boolean;
//# sourceMappingURL=audit-value-diff.d.ts.map