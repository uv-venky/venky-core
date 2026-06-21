import { ADMIN_ACTION_ACCESS_ROLES, ADMIN_ACTIONS } from './admin';
import { COMMENTS_ACTION_ACCESS_ROLES, COMMENTS_ACTIONS } from './comments';
import { SESSION_ACTION_ACCESS_ROLES, SESSION_ACTIONS } from './session';
export const ACTIONS = {
  ...ADMIN_ACTIONS,
  ...COMMENTS_ACTIONS,
  ...SESSION_ACTIONS,
};
export const ACTION_ACCESS_ROLES = {
  ...ADMIN_ACTION_ACCESS_ROLES,
  ...COMMENTS_ACTION_ACCESS_ROLES,
  ...SESSION_ACTION_ACCESS_ROLES,
};
export const WORKFLOW_CALLABLE_ACTIONS = ['createComment', 'genID', 'reactToComment'];
export { setActionRegistry, getActionRegistry } from './registry-context';
//# sourceMappingURL=index.js.map
