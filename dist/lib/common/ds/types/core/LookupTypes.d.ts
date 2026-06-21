import type { ISODateTimeString } from '../../../../../lib/core/common/ds/types/DataSource';
export interface LookupTypes {
    id: string;
    appId: string;
    code: string;
    name: string;
    description?: string | null;
    valueType: 'string' | 'number';
    createdAt: ISODateTimeString;
    createdBy: string;
    updatedAt: ISODateTimeString;
    updatedBy: string;
}
//# sourceMappingURL=LookupTypes.d.ts.map