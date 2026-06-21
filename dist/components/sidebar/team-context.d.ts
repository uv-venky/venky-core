import { type ReactNode } from 'react';
import type { Team } from './types';
interface TeamContextValue {
    teams: Team[];
    activeTeam: Team | null;
    setActiveTeam: (team: Team) => void;
}
export declare function TeamProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useTeamContext(): TeamContextValue;
export declare function useTeamContextSafe(): TeamContextValue | null;
export {};
//# sourceMappingURL=team-context.d.ts.map