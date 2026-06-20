/* Copyright (c) 2024-present Venky Corp. */
'use client';

import { lazy } from 'react';

// Re-export all core components from @/components/core using index files
export * from '@/components/core/admin';
export { default as QueryResults } from '@/components/core/admin/sql-browser/QueryResults';
export { default as SQLBrowser } from '@/components/core/admin/sql-browser/SQLBrowser';
export { default as AvatarUploadDialog } from '@/components/core/avatar-upload-dialog';
export * from '@/components/core/card';
export * from '@/components/core/chips-input';
export * from '@/components/core/combobox';
export * from '@/components/core/comments';
export * from '@/components/core/common';
export * from '@/components/core/CsvDownloadButton';
export { default as CsvDownloadButton } from '@/components/core/CsvDownloadButton';
export * from '@/components/core/date-field';
export * from '@/components/core/download/exportStoreToCsv';
export * from '@/components/core/dropdown-menu';
export * from '@/components/core/excel-upload';
export * from '@/components/core/fusion-charts';
export * from '@/components/core/hooks';
export * from '@/components/core/lov';
export { default as LOVDialog } from '@/components/core/lov';
export * from '@/components/core/markdown-display';
export * from '@/components/core/multi-combobox';
export * from '@/components/core/mutX';
export * from '@/components/core/page';
export * from '@/components/core/session-context';
export * from '@/components/core/session-provider';
export { SecureHomePage } from '@/components/core/session/secure-home-page';
export type { SecureHomePageProps } from '@/components/core/session/secure-home-page';
export { NoAccessPage } from '@/components/core/session/no-access-page';
export type { NoAccessPageProps } from '@/components/core/session/no-access-page';
export * from '@/components/core/StoreCsvDownloadButton';
export { default as StoreCsvDownloadButton } from '@/components/core/StoreCsvDownloadButton';
export * from '@/components/core/StoreExportDropdown';
export { default as StoreExportDropdown } from '@/components/core/StoreExportDropdown';
export { exportStoreToExcel } from '@/components/core/download/exportStoreToExcel';
export * from '@/components/core/table';
export * from '@/components/core/theme';
export * from '@/components/core/utils';
export { default as TBD } from '@/components/TBD';
export { ThemeProvider } from '@/components/theme-provider';
export type {
  ServerModuleMenuItems,
  ServerTeam,
  ServerPageGroup,
  ServerPageItem,
  SidebarAction,
  SidebarActionMap,
  Team,
  PageItem,
  PageGroup,
} from '@/components/sidebar/types';
export { getFirstTeamLandingUrl, getTeamLandingUrl } from '@/components/sidebar/team-landing-url';
export { AppProvider, useAppContext, useAppSidebarContext, useDeployConfig } from '@/components/sidebar/app-provider';
export type { AppProviderProps, AppContextValue, CustomMiniLogoProps } from '@/components/sidebar/app-provider';
export type { TableVariant } from '@/components/core/common/types';
export { useTableVariant } from '@/components/core/hooks/useTableVariant';
export { AppIcon, appSidebarIcons } from '@/components/sidebar/icons';
export type {
  AppSidebarIcon,
  SidebarIcon,
  SidebarIconRegistry,
} from '@/components/sidebar/icons';
export { useEnv } from '@/app/(secure)/EnvProvider';
export type { Env } from '@/app/(secure)/EnvProvider';
export { useTeamContext } from '@/components/sidebar/team-context';
export { default as AppThemeProvider } from '@/app/theme-provider';
export { getTrackId, resetTrackId } from '@/lib/core/client/state';
export { MultiStepForm } from '@/components/multi-step-form';
export { ResetPasswordPage } from '@/app/login/reset-password/ResetPasswordPage';
export { ResetPasswordConfirmationPage } from '@/app/login/reset-password/[token]/ResetPasswordConfirmationPage';
export { exportStoreToCsv } from '@/components/core/download/exportStoreToCsv';
export { UserProfilePage } from '@/app/(secure)/user/profile/user-profile-page';
export { LoginPageContent } from '@/app/login/page-content';
export { ForcePasswordChangePage } from '@/app/(secure)/force-password-change/ForcePasswordChangePage';
export { WVAuditPage } from '@/app/(secure)/core/wv-audit/WVAuditPage';
export { useHasRole } from '@/hooks/use-has-role';
export { useCurrentUserRoles } from '@/hooks/use-has-role';
export { useClientSession } from '@/components/core/session-context';
export { useIsMobile } from '@/hooks/use-mobile';
export { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
export { CodeGenPage } from '@/app/(secure)/gen/CodeGenPage';
export type {
  TemplateOption,
  HandleGenerateProps,
  State as CodeGenState,
  TemplateCodeGenFunction,
} from '@/app/(secure)/gen/types';
export { default as AppsPageContent } from '@/app/(secure)/admin/config/apps/page-content';
export { default as LookupsPageContent } from '@/app/(secure)/admin/config/lookups/page-content';
export { useHideSidebar } from '@/components/sidebar/sidebar-visibility-context';
export { Link, setLinkComponent, getLinkComponent } from '@/components/core/link';
export type { AppLinkProps, LinkComponent } from '@/components/core/link';
export {
  useManualReadySignal,
  useLoadingControl,
  useLoadingTracker,
  type LoadingTrackerMetadata,
  type LoadingTrackerState,
  type DataLoadMeta,
} from '@/lib/core/client/loading-tracker';
// Lazy export so Tiptap/ProseMirror (gapcursor) is not loaded when barrel is evaluated (avoids duplicate selection ID on SSR)
export const RichTextEditor = lazy(() =>
  import('@/components/elements/rich-text-editor').then((m) => ({ default: m.RichTextEditor })),
);
export type { RichTextEditorProps, RichTextEditorFeatures } from '@/components/elements/rich-text-editor';
export type { CustomIntegrationPlugin } from '@/plugins/registry';
export { UserProfile } from '@/components/user-profile';
export { ThemeToggle } from '@/components/theme-toggle';
export { ShareUrlButton } from '@/components/share-url-button';
export { CommentsButton } from '@/components/comments-button';
export { default as LOVCombobox } from '@/components/core/lov-combobox';
export type { LOVComboboxProps } from '@/components/core/lov-combobox';
