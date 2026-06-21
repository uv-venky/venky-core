import { useClientSession } from '../components/core/session-context';
export function useCurrentUserRoles() {
    const { roles } = useClientSession();
    return roles;
}
export function useHasRole(...role) {
    const roles = useCurrentUserRoles();
    return roles.some((r) => role.includes(r));
}
//# sourceMappingURL=use-has-role.js.map