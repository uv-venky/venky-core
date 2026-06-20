/* Copyright (c) 2024-present Venky Corp. */

import type { Session } from '@/auth';

export type CommentContextAuthorizer = (contextId: string, session: Session) => Promise<boolean> | boolean;

declare global {
  var _$commentContextAuthorizers: Map<string, CommentContextAuthorizer> | undefined;
}

const registry =
  globalThis._$commentContextAuthorizers ??
  new Map<string, CommentContextAuthorizer>([
    [
      'page',
      (_contextId, session) => {
        return session.user.userName !== 'guest';
      },
    ],
  ]);
globalThis._$commentContextAuthorizers = registry;

export function registerCommentContextAuthorizer(context: string, fn: CommentContextAuthorizer): void {
  registry.set(context, fn);
}

export async function authorizeCommentAccess(context: string, contextId: string, session: Session): Promise<boolean> {
  const fn = registry.get(context);
  if (!fn) {
    return false;
  }
  return fn(contextId, session);
}
