'use server';
import { getActionRegistry } from './registry-context';
import { UserError } from '../../../lib/core/common/error';
import { logAccessDenied } from '../../../lib/core/server/activity';
import { AccessDeniedResourceType } from '../../../lib/core/common/types/AccessDenied';
import { ACTION_PARAM_SCHEMAS as GENERATED_PARAM_SCHEMAS } from './param-schemas.generated';
import { validateActionParams } from './param-validation';
/**
 * Validate action args against the registered/generated param schema.
 * Prefers registry schemas (consuming projects), falls back to core's generated
 * schemas. Actions with no known schema are skipped (cannot validate an unknown
 * shape) — every core action is covered by the generated file.
 */
function assertValidActionParams(action, args) {
    const { ACTION_PARAM_SCHEMAS: registrySchemas } = getActionRegistry();
    const entries = registrySchemas?.[action] ?? GENERATED_PARAM_SCHEMAS[action];
    if (!entries)
        return;
    validateActionParams(action, entries, args);
}
export async function invokeAction(client, session, action, ...args) {
    const { ACTIONS, ACTION_ACCESS_ROLES } = getActionRegistry();
    const actionFn = ACTIONS[action];
    if (!actionFn) {
        throw new UserError(`Action ${action} not found!`);
    }
    const accessRoles = ACTION_ACCESS_ROLES[action];
    if (!accessRoles?.some((role) => {
        if (role === 'all_users') {
            return session.user.userName !== 'guest';
        }
        return session.user.roles.includes(role);
    })) {
        await logAccessDenied({
            userName: session.user.userName,
            roles: session.user.roles,
            sessionId: session.id,
            resourceType: AccessDeniedResourceType.Action,
            resource: action,
            reason: `User lacks a required role for action ${action} (allowed: ${(accessRoles ?? []).join(', ') || 'none'})`,
        });
        throw new UserError(`You do not have access to action ${action}!`);
    }
    assertValidActionParams(action, args);
    return actionFn(client, session, ...args);
}
export async function invokePublicAction(client, action, ...args) {
    const { ACTIONS, ACTION_ACCESS_ROLES } = getActionRegistry();
    const actionFn = ACTIONS[action];
    if (!actionFn) {
        throw new UserError(`Action ${action} not found!`);
    }
    const accessRoles = ACTION_ACCESS_ROLES[action];
    if (!accessRoles?.some((role) => role === 'public')) {
        throw new UserError(`You do not have access to action ${action}!`);
    }
    // Param validation intentionally skipped here: public actions have the
    // signature (client, ...args) while the generated schemas index params from
    // position 2 (assuming (client, session, ...)), so they would be off-by-one.
    return actionFn(client, ...args);
}
//# sourceMappingURL=invoke.js.map