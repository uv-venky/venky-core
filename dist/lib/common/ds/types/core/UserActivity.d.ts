import type { ISODateTimeString } from '../../../../../lib/core/common/ds/types/Base';
export interface UserActivity {
    appId: string;
    activityId: number;
    apiName?: string | null;
    createdAt: ISODateTimeString;
    dataSource?: string | null;
    elapsedTimeMs?: number | null;
    eventId: string;
    eventType: string;
    metadata?: unknown | null;
    pageUrl?: string | null;
    rowCount?: number | null;
    sessionId?: string | null;
    trackId?: string | null;
    userName: string;
    appVersion?: string | null;
}
//# sourceMappingURL=UserActivity.d.ts.map