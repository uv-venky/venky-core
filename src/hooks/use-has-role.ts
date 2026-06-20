import { useClientSession } from '@/components/core/session-context';

export function useCurrentUserRoles(): string[] {
  const { roles } = useClientSession();
  return roles;
}

export function useHasRole(...role: string[]) {
  const roles = useCurrentUserRoles();
  return roles.some((r) => role.includes(r));
}
