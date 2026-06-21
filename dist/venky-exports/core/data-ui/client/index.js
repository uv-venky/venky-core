/* Copyright (c) 2024-present Venky Corp. */
/**
 * Client-only entrypoint for venky-core/data-ui.
 * Curated exports to avoid pulling server-coupled modules into browser bundles.
 */
// App scaffolding/providers
export { AppProvider } from '../../../../components/sidebar/app-provider';
export {
  BaseAppProvider,
  useAppContext,
  useDeployConfig,
  useAppSidebarContext,
} from '../../../../components/sidebar/app-provider-base';
export { SessionProvider } from '../../../../components/core/session-provider';
export { TeamProvider, useTeamContext, useTeamContextSafe } from '../../../../components/sidebar/team-context';
// Router/link adapters
export { setRouterImplementation } from '../../../../components/core/hooks/useRouter';
export { setPathnameImplementation } from '../../../../components/core/hooks/usePathname';
export { setSearchParamsImplementation } from '../../../../components/core/hooks/useSearchParams';
export { setParamsImplementation } from '../../../../components/core/hooks/useParams';
export { setLinkComponent } from '../../../../components/core/link';
// Core layout + shared UI
export { default as GlobalTooltip } from '../../../../components/core/common/GlobalTooltip';
export { default as ToasterComponent } from '../../../../components/core/common/toaster';
export { default as SetupHashListener } from '../../../../components/core/common/SetupHashListener';
export { ThemeProvider } from '../../../../components/theme-provider';
// Admin pages
export { RolesPage } from '../../../../app/(secure)/admin/config/roles/RolesPage';
export { UsersPage } from '../../../../app/(secure)/admin/config/users/UsersPage';
export { ThemesPage } from '../../../../app/(secure)/admin/config/themes/ThemesPage';
export { AppsPage } from '../../../../app/(secure)/admin/config/apps/AppsPage';
export { LookupsPage } from '../../../../app/(secure)/admin/config/lookups/LookupsPage';
export { ActivityMonitorPage } from '../../../../app/(secure)/admin/monitoring/activity/ActivityMonitorPage';
export { ApiTesterPage } from '../../../../app/(secure)/admin/monitoring/api-playground/ApiTesterPage';
export { AuditDashboardPage } from '../../../../app/(secure)/admin/monitoring/audit/AuditDashboardPage';
export { CacheDashboard } from '../../../../app/(secure)/admin/monitoring/cache/CacheDashboard';
export { DBLogsPage } from '../../../../app/(secure)/admin/monitoring/db-logs/DBLogsPage';
export { EmailRequestsPage } from '../../../../app/(secure)/admin/monitoring/email-requests/email-requests-page';
export { JobsPage } from '../../../../app/(secure)/admin/monitoring/jobs/JobsPage';
export { HealthDashboard } from '../../../../components/core/admin/health-dashboard';
export { SessionsMonitorPage } from '../../../../components/core/admin/SessionsMonitorPage';
export { SQLBrowserPage } from '../../../../app/(secure)/admin/monitoring/sql-browser/SQLBrowserPage';
export { UserActivityPage } from '../../../../app/(secure)/admin/monitoring/user-activity/UserActivityPage';
export { UserActivityHistoryPage } from '../../../../app/(secure)/admin/monitoring/user-activity-history/UserActivityHistoryPage';
//# sourceMappingURL=index.js.map
