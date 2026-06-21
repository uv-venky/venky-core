/* Copyright (c) 2024-present Venky Corp. */
/**
 * venky-core/data-ui
 *
 * Framework-agnostic data UI components.
 * Contains SmartSearch, DataTable, Pivot, table cells, and supporting components.
 *
 * ZERO dependency on Next.js — safe to use from TanStack Start, Remix, etc.
 * For Next.js apps, prefer venky-core/ui which includes everything.
 *
 * Key exports:
 *   - SmartSearch: filter/search bar with saved views
 *   - DataTable: data table with sorting, pagination, sticky columns, DnD
 *   - Pivot: pivot table with aggregation, collapse, settings
 *   - useTable: hook for creating TanStack Table instances with store integration
 *   - DataTablePagination: pagination controls
 *   - ColumnsMenu: column visibility/order management
 *   - Filters: combined SmartSearch + saved views wrapper
 *   - Table sub-components: HeaderCell, DataTableCell, styled cells, etc.
 */
'use client';
// ── SmartSearch ──────────────────────────────────────────────────────
export { SmartSearch } from '../../../components/core/smart-search';
// ── DataTable ────────────────────────────────────────────────────────
export { default as DataTable } from '../../../components/core/page/table';
export { default as useTable } from '../../../components/core/page/useTable';
export { default as DataTablePagination } from '../../../components/core/page/data-table-pagination';
export { default as Filters } from '../../../components/core/page/filters';
export { default as ColumnsMenu, ColumnViewsDialog } from '../../../components/core/page/columns-menu';
export * from '../../../components/core/page/table-column-preferences';
export { default as TableHeaderFilters } from '../../../components/core/page/table-header-filters';
export { RowIdProvider, StoreProvider, useRowId, useCurrentStore } from '../../../components/core/page/RowIdProvider';
// ── Table sub-components (cells, headers, styled cells) ─────────────
export * from '../../../components/core/table';
// ── Pivot ────────────────────────────────────────────────────────────
export * from '../../../components/core/pivot';
export { PivotFilters } from '../../../components/core/page/filters';
// ── Page scaffolding (shell, layout template, fields) ────────────────
export { default as PageShell } from '../../../components/core/page/page-shell';
export { PageShellModeProvider, usePageShellModeSafe, } from '../../../components/core/page/page-shell-mode-context';
export { default as PageLayoutTemplate } from '../../../components/core/page/page-layout-template';
export * from '../../../components/core/page/fields';
// ── Common components used by SmartSearch/DataTable ──────────────────
export { default as ErrorBoundary, useErrorHandler, withErrorBoundary } from '../../../components/core/common/ErrorBoundary';
export { default as EmptyState } from '../../../components/core/common/EmptyState';
export { default as ErrorCard } from '../../../components/core/common/error';
export { Popup } from '../../../components/core/page/popup';
// ── Shared combobox (used by SmartSearch column picker) ─────────────
export * from '../../../components/core/combobox';
export { default as LOVCombobox } from '../../../components/core/lov-combobox';
// ── Session context (used by SavedSearch) ────────────────────────────
export { useClientSession } from '../../../components/core/session-context';
// ── Date field (used by SmartSearch date filters) ────────────────────
export * from '../../../components/core/date-field';
// ── Personalization (saved table layouts) ────────────────────────────
export * from '../../../components/core/page/personalization';
export * from '../../../components/core/page/table-personalization';
// ── EditPopup (used by page templates with dialog actions) ───────────
export { EditPopup } from '../../../components/core/page/edit-popup';
// ── Constants (framework-agnostic config) ────────────────────────────
export { default as CONSTANTS } from '../../../lib/core/client/constants';
// ── Sidebar context (needed when hosting core pages outside core's layout) ──
export { SidebarProvider, useSidebarSafe } from '../../../components/ui/sidebar';
// ── App context (needed by PageLayoutTemplate for config values) ─────
export { BaseAppProvider, useAppContext, useDeployConfig, useAppSidebarContext, } from '../../../components/sidebar/app-provider-base';
export { AppProvider } from '../../../components/sidebar/app-provider';
// ── Providers (framework-agnostic, for hosting core pages outside core's layout) ──
export { SessionProvider } from '../../../components/core/session-provider';
export { SessionContext } from '../../../components/core/session-context';
export { TeamProvider, useTeamContext, useTeamContextSafe } from '../../../components/sidebar/team-context';
// ── Theme ─────────────────────────────────────────────────────────────
export { ThemeProvider } from '../../../components/theme-provider';
export { ThemeToggle } from '../../../components/theme-toggle';
// ── Pre-built pages (framework-agnostic, no next/* deps) ────────────
export { RolesPage } from '../../../app/(secure)/admin/config/roles/RolesPage';
export { UsersPage } from '../../../app/(secure)/admin/config/users/UsersPage';
export { ThemesPage } from '../../../app/(secure)/admin/config/themes/ThemesPage';
export { AppsPage } from '../../../app/(secure)/admin/config/apps/AppsPage';
export { default as AppsPageContent } from '../../../app/(secure)/admin/config/apps/page-content';
export { LookupsPage } from '../../../app/(secure)/admin/config/lookups/LookupsPage';
export { default as LookupsPageContent } from '../../../app/(secure)/admin/config/lookups/page-content';
export { ActivityMonitorPage } from '../../../app/(secure)/admin/monitoring/activity/ActivityMonitorPage';
export { ApiTesterPage } from '../../../app/(secure)/admin/monitoring/api-playground/ApiTesterPage';
export { AuditDashboardPage } from '../../../app/(secure)/admin/monitoring/audit/AuditDashboardPage';
export { CacheDashboard } from '../../../app/(secure)/admin/monitoring/cache/CacheDashboard';
export { DBLogsPage } from '../../../app/(secure)/admin/monitoring/db-logs/DBLogsPage';
export { EmailRequestsPage } from '../../../app/(secure)/admin/monitoring/email-requests/email-requests-page';
export { JobsPage } from '../../../app/(secure)/admin/monitoring/jobs/JobsPage';
export { HealthDashboard } from '../../../components/core/admin/health-dashboard';
export { SessionsMonitorPage } from '../../../components/core/admin/SessionsMonitorPage';
export { SQLBrowserPage } from '../../../app/(secure)/admin/monitoring/sql-browser/SQLBrowserPage';
export { UserActivityPage } from '../../../app/(secure)/admin/monitoring/user-activity/UserActivityPage';
export { UserActivityHistoryPage } from '../../../app/(secure)/admin/monitoring/user-activity-history/UserActivityHistoryPage';
export { useHideSidebar } from '../../../components/sidebar/sidebar-visibility-context';
// ── Router & navigation hooks (pluggable, for client-side navigation) ──
export { setRouterImplementation } from '../../../components/core/hooks/useRouter';
export { setPathnameImplementation } from '../../../components/core/hooks/usePathname';
export { setSearchParamsImplementation } from '../../../components/core/hooks/useSearchParams';
export { setParamsImplementation } from '../../../components/core/hooks/useParams';
// ── Link (pluggable, for client-side navigation) ──
export { Link, setLinkComponent, getLinkComponent } from '../../../components/core/link';
export { default as GlobalTooltip } from '../../../components/core/common/GlobalTooltip';
export { default as ToasterComponent } from '../../../components/core/common/toaster';
export { default as SetupHashListener } from '../../../components/core/common/SetupHashListener';
//# sourceMappingURL=index.js.map