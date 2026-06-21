import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
import { useClientSession } from '../core/session-context';
const TeamContext = createContext(undefined);
export function TeamProvider({ children }) {
    const { teams } = useClientSession();
    const [activeTeam, setActiveTeam] = useState(null);
    return _jsx(TeamContext.Provider, { value: { teams, activeTeam, setActiveTeam }, children: children });
}
export function useTeamContext() {
    const ctx = useContext(TeamContext);
    if (!ctx)
        throw new Error('useTeamContext must be used within a TeamProvider');
    return ctx;
}
export function useTeamContextSafe() {
    return useContext(TeamContext) ?? null;
}
//# sourceMappingURL=team-context.js.map