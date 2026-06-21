import type { ISODateTimeString } from '../../../../../lib/core/common/ds/types/DataSource';
export interface Logs {
    appId: string;
    apiName?: string | null;
    createdAt: ISODateTimeString;
    dataSource?: string | null;
    hostname?: string | null;
    level: number;
    logId: number;
    message: string;
    pid?: string | null;
    sessionId?: string | null;
    trackId?: string | null;
    userName?: string | null;
    appVersion?: string | null;
}
//# sourceMappingURL=Logs.d.ts.map