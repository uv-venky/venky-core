/* Copyright (c) 2024-present Venky Corp. */
'use client';

import { createContext, Suspense, useContext, useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { EnvProvider } from '@/app/(secure)/EnvProvider';
import { isSidebarItemActive as defaultIsSidebarItemActive, useSidebarActions } from './actions';
import type { PageItem, SidebarAction, Team } from './types';
import { useQuery } from '@/lib/core/client/useQuery';
import { setConfigInfo } from '@/lib/core/client/devtools/devtools-store';
import { ErrorCard } from '@/components/core/common';
import CONSTANTS from '@/lib/core/client/constants';
import { setNotificationProvider, type NotificationProvider } from '@/lib/core/client/notifications';
import {
  APP_DESCRIPTION as DEFAULT_APP_DESCRIPTION,
  APP_NAME as DEFAULT_APP_NAME,
  DISABLE_HEADER_FILTERS_DEFAULT as DEFAULT_DISABLE_HEADER_FILTERS,
  IGNORE_CASE_DEFAULT as DEFAULT_IGNORE_CASE,
  TEST_PASSWORD as DEFAULT_TEST_PASSWORD,
  ENABLE_NATURAL_LANGUAGE_SEARCH_DEFAULT,
  SEARCH_INPUT_MODE_DEFAULT,
} from '@/lib/common/ui-constants';
import type { DeployConfigMap } from '@/lib/core/common/types/DeployConfig';
import type { SidebarIconRegistry } from './icons';
import type { TableVariant } from '@/components/core/common/types';
import type { SearchInputMode } from '@/components/core/smart-search/SearchModeToggle';

/**
 * Props for a custom mini logo component.
 * Should match the interface of the default MiniLogo component.
 */
export interface CustomMiniLogoProps {
  className?: string;
  fill?: string;
}

export interface AppContextValue {
  dynamicSidebarContent?: ComponentType<{ activeTeam: Team }>;
  executeSidebarAction?: (actionName: SidebarAction, path: string) => void;
  isSidebarItemActive?: (pathname: string, item: PageItem, team: Team) => boolean;
  APP_NAME: string;
  APP_DESCRIPTION: string;
  DISABLE_HEADER_FILTERS_DEFAULT: boolean;
  IGNORE_CASE_DEFAULT: boolean;
  TEST_PASSWORD: string;
  DEFAULT_SEARCH_INPUT_MODE: SearchInputMode;
  DEFAULT_ENABLE_NATURAL_LANGUAGE_SEARCH: boolean;

  // Deployment configuration (externalized from core)
  /** AWS ECS deployment configuration per environment */
  deployConfig?: DeployConfigMap;
  /** AWS region for deployments (defaults to 'us-east-1') */
  awsRegion?: string;
  /** GitHub repository name for GitHub Actions links (e.g., 'uv-venky/metro-one-cop') */
  gitHubRepoName?: string;

  // Debug configuration (externalized from core)
  /** Enable useWhyDidYouUpdate debug logging (default: false) */
  whyDidYouUpdateEnabled?: boolean;
  /** Component names to debug with useWhyDidYouUpdate (default: []) */
  whyDidYouUpdateNames?: string[];

  // Custom mini logo component (externalized from core)
  /** Custom mini logo component to replace the default MiniLogo in the sidebar */
  customMiniLogo?: ComponentType<CustomMiniLogoProps>;

  // Custom sidebar icons (externalized from core)
  /** Custom sidebar icons; merged with core icons. Augment SidebarIconRegistry to add type-safe keys. */
  customSidebarIcons?: Record<keyof SidebarIconRegistry, ComponentType<{ className?: string }>>;

  // Global table/pivot variant (externalized from core)
  /** Default row density for all DataTable and Pivot components. Per-component props override this. */
  tableVariant?: TableVariant;

  /** True unless config sets `features.naturalLanguageSearch: false` (via getAppConfigForDevtools). Override via AppProvider prop. */
  naturalLanguageSearchEnabled: boolean;
}

export const AppContext = createContext<AppContextValue | undefined>(undefined);

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within an AppProvider');
  return ctx;
}

/** @deprecated Use useAppContext instead */
export const useAppSidebarContext = useAppContext;

/**
 * Hook to access deployment configuration from context.
 * Throws error if deployConfig is not provided by the consuming project.
 */
export function useDeployConfig() {
  const { deployConfig, awsRegion, gitHubRepoName } = useAppContext();

  if (!deployConfig) {
    throw new Error(
      'deployConfig not configured. Please pass deployConfig prop to AppProvider. ' +
        'See .cursor/rules/config-externalization-pattern.mdc for the pattern.',
    );
  }

  return { deployConfig, awsRegion: awsRegion ?? 'us-east-1', gitHubRepoName };
}

export interface BaseAppProviderProps extends Partial<AppContextValue> {
  children: ReactNode;
  /**
   * Optional notification provider for core client modules (store, useQuery, etc.).
   * If omitted, the default sonner-based provider is used.
   */
  notificationProvider?: NotificationProvider;
}

export function BaseAppProvider({
  children,
  executeSidebarAction,
  isSidebarItemActive = defaultIsSidebarItemActive,
  dynamicSidebarContent = () => null,
  APP_NAME = DEFAULT_APP_NAME,
  APP_DESCRIPTION = DEFAULT_APP_DESCRIPTION,
  DISABLE_HEADER_FILTERS_DEFAULT = DEFAULT_DISABLE_HEADER_FILTERS,
  DEFAULT_SEARCH_INPUT_MODE = SEARCH_INPUT_MODE_DEFAULT,
  DEFAULT_ENABLE_NATURAL_LANGUAGE_SEARCH = ENABLE_NATURAL_LANGUAGE_SEARCH_DEFAULT,
  IGNORE_CASE_DEFAULT = DEFAULT_IGNORE_CASE,
  TEST_PASSWORD = DEFAULT_TEST_PASSWORD,
  deployConfig,
  awsRegion,
  gitHubRepoName,
  whyDidYouUpdateEnabled = false,
  whyDidYouUpdateNames = [],
  customMiniLogo,
  customSidebarIcons,
  tableVariant,
  naturalLanguageSearchEnabled: naturalLanguageSearchEnabledProp,
  notificationProvider,
}: BaseAppProviderProps) {
  const envResult = useQuery('getEnvironment');
  const appConfigResult = useQuery('getAppConfigForDevtools');
  const defaultExecuteSidebarAction = useSidebarActions();

  const error =
    envResult.status === 'error' ? envResult.error : appConfigResult.status === 'error' ? appConfigResult.error : null;
  const isLoading = envResult.status === 'loading' || appConfigResult.status === 'loading';
  const isSuccess = envResult.status === 'success' && appConfigResult.status === 'success';

  // Wire the notification provider for core client modules (store, useQuery, etc.).
  // Default (sonner-based) provider is lazy-loaded only when no custom provider is passed.
  useEffect(() => {
    if (notificationProvider !== undefined) {
      setNotificationProvider(notificationProvider);
      return;
    }
    let cancelled = false;
    void Promise.all([
      import('@/components/core/common/Notification'),
      import('@/components/core/common/UserConfirmationState'),
      import('@/components/core/common/active'),
    ]).then(([notif, confirmation, active]) => {
      if (cancelled) return;
      setNotificationProvider({
        showError: notif.showError,
        showSuccess: notif.showSuccess,
        showWarning: notif.showWarning,
        confirmWithUser: confirmation.confirmWithUser,
        touch: active.touch,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [notificationProvider]);

  // Set global constants
  CONSTANTS.IGNORE_CASE_DEFAULT = IGNORE_CASE_DEFAULT;
  CONSTANTS.DISABLE_HEADER_FILTERS_DEFAULT = DISABLE_HEADER_FILTERS_DEFAULT;
  CONSTANTS.TEST_PASSWORD = TEST_PASSWORD;
  CONSTANTS.APP_NAME = APP_NAME;
  CONSTANTS.APP_DESCRIPTION = APP_DESCRIPTION;
  CONSTANTS.whyDidYouUpdateEnabled = whyDidYouUpdateEnabled;
  CONSTANTS.whyDidYouUpdateNames = whyDidYouUpdateNames;

  const appConfigData = appConfigResult.status === 'success' ? appConfigResult.data : null;
  const naturalLanguageSearchEnabled =
    naturalLanguageSearchEnabledProp ?? appConfigData?.features?.naturalLanguageSearch !== false;

  const contextValue: AppContextValue = {
    executeSidebarAction: executeSidebarAction ?? defaultExecuteSidebarAction,
    isSidebarItemActive,
    dynamicSidebarContent,
    APP_NAME,
    APP_DESCRIPTION,
    DISABLE_HEADER_FILTERS_DEFAULT,
    DEFAULT_SEARCH_INPUT_MODE,
    DEFAULT_ENABLE_NATURAL_LANGUAGE_SEARCH,
    IGNORE_CASE_DEFAULT,
    TEST_PASSWORD,
    deployConfig,
    awsRegion,
    gitHubRepoName,
    whyDidYouUpdateEnabled,
    whyDidYouUpdateNames,
    customMiniLogo,
    customSidebarIcons,
    tableVariant,
    naturalLanguageSearchEnabled,
  };

  useEffect(() => {
    if (appConfigData) {
      setConfigInfo(appConfigData);
    }
  }, [appConfigData]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const loadingShell = (
    <div className="flex h-full w-full items-center justify-center gap-2 bg-background">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading...
    </div>
  );

  if (!mounted) {
    return loadingShell;
  }

  if (error) {
    return <ErrorCard>{error}</ErrorCard>;
  }

  if (isLoading || !isSuccess) {
    return loadingShell;
  }

  const env = envResult.data;

  return (
    <Suspense fallback={loadingShell}>
      <EnvProvider env={env}>
        <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
      </EnvProvider>
    </Suspense>
  );
}
