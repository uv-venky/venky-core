import type { Team } from './types';
/**
 * First navigable URL: `http(s)` app URL (`uv_apps.full_url` is always absolute), first visible
 * one-level nav, first visible module page (in order across modules/groups). No bare internal
 * `teamPath` fallback.
 */
export declare function getTeamLandingUrl(team: Team): string | null;
/**
 * First usable landing URL across teams in order, or null if none.
 * `validTeam` is the first team that can produce a URL (same cases as `getTeamLandingUrl`).
 */
export declare function getFirstTeamLandingUrl(teams: Team[]): string | null;
//# sourceMappingURL=team-landing-url.d.ts.map
