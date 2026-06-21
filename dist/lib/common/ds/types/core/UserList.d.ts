import type { ISODateTimeString } from '../../../../../lib/core/common/ds/types/DataSource';
export interface UserList {
    displayName: string;
    email: string;
    endDate?: ISODateTimeString | null;
    locationName?: string | null;
    picture?: string | null;
    startDate: ISODateTimeString;
    userId?: number | null;
    userName: string;
    roleCode?: string | null;
}
//# sourceMappingURL=UserList.d.ts.map