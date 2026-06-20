import type { Session } from '@/auth';
import type { PgPoolClient } from '@/lib/core/server/db';
import { ADMIN_ACTION_ACCESS_ROLES, ADMIN_ACTIONS, type AdminActionName } from './admin';
import { COMMENTS_ACTION_ACCESS_ROLES, COMMENTS_ACTIONS, type CommentsActionName } from './comments';
import { SESSION_ACTION_ACCESS_ROLES, SESSION_ACTIONS, type SessionActionName } from './session';

export const ACTIONS = {
  ...ADMIN_ACTIONS,
  ...COMMENTS_ACTIONS,
  ...SESSION_ACTIONS,
};

export type ActionName = AdminActionName | CommentsActionName | SessionActionName;

export const ACTION_ACCESS_ROLES: Record<ActionName, string[]> = {
  ...ADMIN_ACTION_ACCESS_ROLES,
  ...COMMENTS_ACTION_ACCESS_ROLES,
  ...SESSION_ACTION_ACCESS_ROLES,
};

export const WORKFLOW_CALLABLE_ACTIONS: readonly ActionName[] = ['createComment', 'genID', 'reactToComment'] as const;

export type ActionParams<T extends ActionName> = (typeof ACTIONS)[T] extends (
  client: PgPoolClient,
  session: Session,
  ...args: infer P extends unknown[]
) => any
  ? P
  : (typeof ACTIONS)[T] extends (client: PgPoolClient, ...args: infer P extends unknown[]) => any
    ? P
    : never;

export type ActionOutput<T extends ActionName> = ReturnType<(typeof ACTIONS)[T]>;

export { setActionRegistry, getActionRegistry } from './registry-context';
export type { ActionRegistry, ActionParamSchemaEntry } from './registry-context';
