import type { ISODateTimeString } from '../../../../../lib/core/common/ds/types/DataSource';
export interface UserRoles {
    appId: string;
    createdAt: ISODateTimeString;
    createdBy: string;
    endDate?: ISODateTimeString | null;
    roleCode: string;
    startDate: ISODateTimeString;
    updatedAt: ISODateTimeString;
    updatedBy: string;
    userName: string;
    displayName?: string;
    roleName?: string;
    email?: string;
}
//# sourceMappingURL=UserRoles.d.ts.map