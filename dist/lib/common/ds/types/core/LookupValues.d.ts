import type { ISODateTimeString } from '../../../../../lib/core/common/ds/types/DataSource';
export interface LookupValues {
    id: string;
    lookupTypeId: string;
    value: string;
    label: string;
    description?: string | null;
    displayOrder?: number | null;
    isActive: boolean;
    metadata?: Record<string, unknown> | null;
    createdAt: ISODateTimeString;
    createdBy: string;
    updatedAt: ISODateTimeString;
    updatedBy: string;
}
//# sourceMappingURL=LookupValues.d.ts.map