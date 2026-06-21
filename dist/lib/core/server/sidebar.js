'use server';
import { getServer } from './Server';
import { getConfig } from './config';
import { PREFIX } from '../../../lib/server/constants';
import { executeQuery } from './db';
async function getAppsFromDatabase(currentAppId, userName) {
  try {
    const result = await executeQuery(
      `SELECT a.app_id, a.name, a.full_url, a.icon 
       FROM ${PREFIX}apps a
       WHERE a.app_id != $1 
         AND EXISTS (
           SELECT 1
           FROM ${PREFIX}roles r
           INNER JOIN ${PREFIX}user_roles ur ON ur.role_code = r.role_code
           WHERE r.app_id = a.app_id
             AND ur.user_name = $2
             AND ur.start_date <= now() 
             AND (ur.end_date IS NULL OR ur.end_date >= now())
             AND r.start_date <= now() 
             AND (r.end_date IS NULL OR r.end_date >= now())
         )
       ORDER BY a.name`,
      [currentAppId, userName],
    );
    // `full_url` is absolute http(s); `getTeamLandingUrl` handles these via the http branch.
    return result.rows.map((app) => ({
      name: app.name,
      menuTitle: app.name,
      logo: app.icon || 'MiniLogo',
      teamPath: app.full_url,
      modules: [],
      oneLevelNav: [],
    }));
  } catch {
    // If table doesn't exist yet, return empty array
    return [];
  }
}
export async function getUserTeams(session) {
  const { roles } = session.user;
  if (!roles.includes('user')) {
    roles.push('user');
  }
  const teams = getServer('sidebar').config.teams;
  const currentAppId = getConfig('getUserTeams').appId;
  // Get apps from database - only return apps where user has at least one role
  const dbApps = await getAppsFromDatabase(currentAppId, session.user.userName);
  const clientTeams = teams.map((team) => ({
    ...team,
    modules: team.modules
      .map((module) => ({
        ...module,
        pageGroups: module.pageGroups
          .map((group) => ({
            ...group,
            pages: group.pages
              .filter((page) => page.roles.some((role) => roles.includes(role)))
              .map((page) => {
                const { roles: _unused, isHidden, ...rest } = page;
                if (isHidden) {
                  return { ...rest, hidden: isHidden(roles) };
                }
                return rest;
              }),
          }))
          .filter((group) => group.pages.length > 0),
      }))
      .filter((module) => module.pageGroups.length > 0),
    oneLevelNav: team.oneLevelNav
      .filter((nav) => nav.roles.some((role) => roles.includes(role)))
      .map((nav) => {
        const { roles: _unused, isHidden, ...rest } = nav;
        if (isHidden) {
          return { ...rest, hidden: isHidden(roles) };
        }
        return rest;
      }),
  }));
  // .filter(
  //   (team) =>
  //     team.modules.some((module) => module.pageGroups.some((group) => group.pages.some((page) => !page.hidden))) ||
  //     team.oneLevelNav.some((nav) => !nav.hidden),
  // )
  // Merge database apps with config teams
  return [...clientTeams, ...dbApps];
}
// Pathname prefixes that don't require access check (public/system pages)
const ACCESS_CHECK_EXEMPT_PREFIXES = [
  '/login',
  '/access-denied',
  '/404',
  '/home',
  '/gen',
  '/no-access',
  '/force-password-change',
  '/go',
  '/api',
];
/**
 * Checks if a user has access to a given pathname based on their teams/navigation.
 * Returns true if user has access, false otherwise.
 */
export async function checkPageAccess(session, pathname) {
  // Check if pathname is exempt from access check
  if (
    pathname === '/' ||
    ACCESS_CHECK_EXEMPT_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  ) {
    return true;
  }
  const teams = await getUserTeams(session);
  // No teams means no access (user will be redirected to /no-access by the layout)
  if (teams.length === 0) {
    return true; // Let the layout handle the no-access case
  }
  // Check oneLevelNav access
  const hasOneLevelNavAccess = teams.some((team) =>
    team.oneLevelNav.some((nav) => pathname.startsWith(`${team.teamPath}${nav.pagePath}`)),
  );
  if (hasOneLevelNavAccess) {
    return true;
  }
  // Check modules access
  const hasModuleAccess = teams.some((team) =>
    team.modules.some((module) =>
      module.pageGroups.some((group) =>
        group.pages.some((page) => pathname.startsWith(`${module.modulePath}${group.groupPath}${page.pagePath}`)),
      ),
    ),
  );
  return hasModuleAccess;
}
//# sourceMappingURL=sidebar.js.map
