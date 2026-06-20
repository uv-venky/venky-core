import { createContext, useContext, useState, type ReactNode } from 'react';
import { useClientSession } from '../core/session-context';
import type { Team } from './types';

interface TeamContextValue {
  teams: Team[];
  activeTeam: Team | null;
  setActiveTeam: (team: Team) => void;
}

const TeamContext = createContext<TeamContextValue | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const { teams } = useClientSession();
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);

  return <TeamContext.Provider value={{ teams, activeTeam, setActiveTeam }}>{children}</TeamContext.Provider>;
}

export function useTeamContext() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error('useTeamContext must be used within a TeamProvider');
  return ctx;
}

export function useTeamContextSafe(): TeamContextValue | null {
  return useContext(TeamContext) ?? null;
}
