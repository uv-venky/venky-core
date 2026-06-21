/* Copyright (c) 2024-present Venky Corp. */
const registry = globalThis._$commentContextAuthorizers ??
    new Map([
        [
            'page',
            (_contextId, session) => {
                return session.user.userName !== 'guest';
            },
        ],
    ]);
globalThis._$commentContextAuthorizers = registry;
export function registerCommentContextAuthorizer(context, fn) {
    registry.set(context, fn);
}
export async function authorizeCommentAccess(context, contextId, session) {
    const fn = registry.get(context);
    if (!fn) {
        return false;
    }
    return fn(contextId, session);
}
//# sourceMappingURL=comment-authorizer.js.map