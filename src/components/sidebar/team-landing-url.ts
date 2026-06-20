/* Copyright (c) 2024-present Venky Corp. */

import type { Team } from './types';

/**
 * First navigable URL: `http(s)` app URL (`uv_apps.full_url` is always absolute), first visible
 * one-level nav, first visible module page (in order across modules/groups). No bare internal
 * `teamPath` fallback.
 */
export function getTeamLandingUrl(team: Team): string | null {
  const visibleNav = team.oneLevelNav.find((n) => !n.hidden);
  if (visibleNav != null) {
    return `${team.teamPath}${visibleNav.pagePath}`;
  }
  for (const mod of team.modules) {
    for (const group of mod.pageGroups) {
      if (group.pages.length === 0) {
        continue;
      }
      const page = group.pages.find((p) => !p.hidden);
      if (!page) {
        continue;
      }
      return `${mod.modulePath}${group.groupPath}${page.pagePath}`;
    }
  }
  return null;
}

/**
 * First usable landing URL across teams in order, or null if none.
 * `validTeam` is the first team that can produce a URL (same cases as `getTeamLandingUrl`).
 */
export function getFirstTeamLandingUrl(teams: Team[]): string | null {
  const validTeam = teams.find(
    (t) =>
      t.oneLevelNav.some((n) => !n.hidden) ||
      t.modules.some((m) => m.pageGroups.some((g) => g.pages.some((p) => !p.hidden))),
  );
  return validTeam != null ? getTeamLandingUrl(validTeam) : null;
}
