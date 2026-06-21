import type { Session } from '../../../auth';
import type { Team } from '../../../components/sidebar/types';
export declare function getUserTeams(session: Session): Promise<Team[]>;
/**
 * Checks if a user has access to a given pathname based on their teams/navigation.
 * Returns true if user has access, false otherwise.
 */
export declare function checkPageAccess(session: Session, pathname: string): Promise<boolean>;
//# sourceMappingURL=sidebar.d.ts.map