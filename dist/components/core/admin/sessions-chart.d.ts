import type { UserSessions } from '../../../lib/common/ds/types/core/UserSessions';
import type { DBRow } from '../../../lib/core/common/ds/types/filter';
interface SessionsChartProps {
    sessions: readonly DBRow<UserSessions>[];
}
export default function SessionsChart({ sessions }: SessionsChartProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=sessions-chart.d.ts.map