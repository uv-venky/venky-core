import type { ISODateString } from '../../../../../lib/core/common/ds/types/DataSource';
export interface UserAvatar {
    displayName: string;
    email: string;
    endDate?: ISODateString | null;
    locationName?: string | null;
    picture?: string | null;
    startDate: ISODateString;
    userId?: number | null;
    userName: string;
}
//# sourceMappingURL=UserAvatar.d.ts.map