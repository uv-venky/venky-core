/* Copyright (c) 2024-present Venky Corp. */

/**
 * The kind of resource an authorization gate was protecting when it denied
 * access. Used by `logAccessDenied` (see `@/lib/core/server/activity`) to tag
 * 'Access Denied' audit rows.
 *
 * Lives in a plain (non-`'use server'`) module so the const value can be
 * imported by both the server logging helper and the various rejection sites
 * — a `'use server'` file may only export async functions.
 */
export const AccessDeniedResourceType = {
  Domain: 'domain',
  Agent: 'agent',
  Action: 'action',
  DataSourceQuery: 'datasource:query',
  DataSourceInsert: 'datasource:insert',
  DataSourceUpdate: 'datasource:update',
  DataSourceDelete: 'datasource:delete',
} as const;
export type AccessDeniedResourceType = (typeof AccessDeniedResourceType)[keyof typeof AccessDeniedResourceType];
