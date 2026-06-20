/* Copyright (c) 2024-present Venky Corp. */

// Re-export database utilities from @/lib/core/server/db
export {
  getPool,
  getReadOnlyPool,
  getPoolStatus,
  getReadOnlyPoolStatus,
  executeQuery,
  execute,
  newClient,
  newReadOnlyClient,
  makeLazyDbAccessors,
  transaction,
  transactionWithRetry,
  resetTransaction,
  withAdvisoryLock,
  withBlockingAdvisoryLock,
  hashJobName,
  type PgPoolClient,
  type PgPoolReadOnlyClient,
} from '@/lib/core/server/db';
export type { PoolStatus } from '@/lib/core/common/types/PoolStatus';

// Re-export database wrapper functions
export * from '@/lib/core/server/withDBActions';
export * from '@/lib/core/server/withDBRoutes';
export * from '@/lib/core/server/withDBPages';
export * from '@/lib/core/server/withReadOnlyDBActions';
export * from '@/lib/core/server/withReadOnlyDBRoutes';
export * from '@/lib/core/server/withReadOnlyDBPages';

// Re-export error response utility
export { createErrorResponse } from '@/lib/core/server/error-response';

// Re-export query utilities
export * from '@/lib/core/server/query';

// Re-export logger
export { default as logger } from '@/lib/core/server/logger';
export type { LogContext } from '@/lib/core/server/logger';

// Re-export cache utilities
export * from '@/lib/core/server/cache';

// Re-export configuration
export * from '@/lib/core/server/config';

// Re-export security utilities
export * from '@/lib/core/server/secure';
export * from '@/lib/core/server/secure-headers';

// Re-export session utilities
export * from '@/lib/core/server/session';
export * from '@/lib/core/server/session-tracker';

// Re-export user utilities
export * from '@/lib/core/server/user';

export type {
  RelayStateContext,
  RelayStateProcessor,
  RelayStateProcessorResult,
} from '@/lib/core/server/relay-state-plugin';

// Re-export activity logging
export * from '@/lib/core/server/activity';

// Re-export email utilities
export * from '@/lib/core/server/email';

// Re-export migration utilities
export * from '@/lib/core/server/migrate';
// Re-export password reset utilities
export * from '@/lib/core/server/password-reset';

// Re-export magic link utilities
export * from '@/lib/core/server/magic-link';

// Re-export rate limiting
export * from '@/lib/core/server/ratelimit';

// Re-export TTL store
export * from '@/lib/core/server/ttl-store';

// Re-export server events
export * from '@/lib/core/server/server-events';

// Re-export listener
export * from '@/lib/core/server/listener';

// Re-export transport
export * from '@/lib/core/server/transport';

// Re-export MySQL utilities
export * as mysql from '@/lib/core/server/mysql';

// Re-export export utilities
export * from '@/lib/core/server/export-utils';

// SSE server (publish real-time events to clients + authorize subscriptions)
export { publishSSE, registerChannelAuthorizer, type ChannelAuthorizer } from '@/lib/sse/server';
export { registerAppSSEAuthorizers } from '@/lib/server/init/sse-authorizers';
export {
  authorizeCommentAccess,
  registerCommentContextAuthorizer,
  type CommentContextAuthorizer,
} from '@/components/core/comments/comment-authorizer';

// Re-export server utilities
export * from '@/lib/core/server/utils';

export { getUserTeams } from '@/lib/core/server/sidebar';

export { proxyCore, type ProxyCoreOptions } from '@/proxyCore';

export * from '@/lib/core/server/ds';

export * from '@/lib/server/actions';
export { WORKFLOW_CALLABLE_ACTIONS, setActionRegistry } from '@/lib/server/actions';

// Request context (framework-agnostic adapter pattern)
export { setRequestContextProvider, getRequestContext } from '@/lib/core/server/request-context';
export type { RequestContextProvider, CookieOptions } from '@/lib/core/server/request-context';
export { nextjsRequestContext } from '@/lib/core/server/request-context-nextjs';

// Server redirect (framework-agnostic)
export { redirect, setRedirectImplementation, getRedirect } from '@/lib/core/server/redirect';
export type { RedirectImplementation } from '@/lib/core/server/redirect';
export { nextjsRedirectImplementation } from '@/lib/core/server/redirect-nextjs';

// Feature flags (read from config YAML)
export { isNaturalLanguageSearchEnabled } from '@/lib/core/server/natural-language-search-feature';

// Plugin registry (framework-agnostic)
export {
  registerIntegration,
  type IntegrationPlugin,
  type IntegrationPluginBase,
  type CustomIntegrationPlugin,
  type PluginAction,
  type ActionConfigField,
  type ActionConfigFieldBase,
  type ActionConfigFieldGroup,
  type OutputField,
  type OutputDisplayConfig,
  type SelectOption,
} from '@/plugins/registry';
export type { IntegrationType, AnyIntegrationType, IntegrationConfig } from '@/lib/types/integration';

// Tiny URLs (framework-agnostic)
export { createTinyUrl, getOriginalUrl } from '@/lib/core/server/tinyUrls';
export * as coreActions from '@/lib/server/actions';

export {
  runJobByName,
  computeNextRun,
  type RunJobByNameResult,
  type RunJobByNameOptions,
} from '@/lib/server/jobs/scheduler';

export { getNodeRunId, PREFIX } from '@/lib/server/constants';
