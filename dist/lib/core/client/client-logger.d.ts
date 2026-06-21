import type { Activity } from '../../../lib/core/common/types/Activity';
import { resetTrackId } from '../../../lib/core/client/state';
interface Props extends Record<string, any> {
    message: string;
    dataSource?: string;
}
declare const LEVEL: {
    trace: number;
    debug: number;
    info: number;
    warn: number;
    error: number;
};
declare class Logger {
    level: number;
    log: (props: Props) => void;
    info: (props: Props) => void;
    debug: (props: Props) => void;
    warn: (props: Props) => void;
    error: (props: Props) => void;
    setLevel(level: keyof typeof LEVEL): void;
    getLevel(): number;
    get isTraceEnabled(): boolean;
    get isDebugEnabled(): boolean;
    get isInfoEnabled(): boolean;
    get isWarnEnabled(): boolean;
    logActivity: (props: Omit<Activity, "userName" | "sessionId" | "createdAt" | "trackId">) => Promise<void>;
    resetTrackId: typeof resetTrackId;
}
declare const _default: Logger;
export default _default;
//# sourceMappingURL=client-logger.d.ts.map