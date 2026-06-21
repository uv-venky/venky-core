import type { Users } from '../../../lib/common/ds/types/core/Users';
import type { PgPoolClient } from '../../../lib/core/server/db';
export declare function createUser(
  client: PgPoolClient,
  createdBy: string,
  newUser: Omit<
    Users,
    | 'createdAt'
    | 'createdBy'
    | 'updatedAt'
    | 'updatedBy'
    | 'passwordHash'
    | 'previousPasswordHashes'
    | 'lastLogin'
    | 'lastFailedLogin'
    | 'lastFailedLoginIpAddress'
    | 'lastPasswordReset'
    | 'lastPasswordResetIpAddress'
    | 'lastPasswordResetBy'
    | 'failedLoginAttempts'
    | 'ipAddress'
  > & {
    password: string;
  },
  sendEmail?: boolean,
): Promise<string>;
type NewUserInput = Omit<
  Users,
  | 'createdAt'
  | 'createdBy'
  | 'updatedAt'
  | 'updatedBy'
  | 'passwordHash'
  | 'previousPasswordHashes'
  | 'lastLogin'
  | 'lastFailedLogin'
  | 'lastFailedLoginIpAddress'
  | 'lastPasswordReset'
  | 'lastPasswordResetIpAddress'
  | 'lastPasswordResetBy'
  | 'failedLoginAttempts'
  | 'ipAddress'
> & {
  password: string;
  sendEmail?: boolean;
};
export declare function bulkCreateUsers(
  client: PgPoolClient,
  createdBy: string,
  newUsers: NewUserInput[],
  options?: {
    isInternal?: boolean;
  },
): Promise<string[]>;
export declare function bulkAssignRolesToUsers(
  client: PgPoolClient,
  data: {
    createdBy: string;
    assignments: {
      userName: string;
      roles: string[];
      startDate?: Date;
      endDate?: Date;
    }[];
  },
): Promise<void>;
export declare function endDateUser(
  client: PgPoolClient,
  data: {
    updatedBy: string;
    userName: string;
    endDate?: Date;
  },
): Promise<void>;
export declare function reactivateUser(
  client: PgPoolClient,
  data: {
    updatedBy: string;
    userName: string;
  },
): Promise<void>;
export declare function assignRolesToUser(
  client: PgPoolClient,
  data: {
    createdBy: string;
    roles: string[];
    userName: string;
    startDate?: Date;
    endDate?: Date;
  },
): Promise<void>;
export declare function endDateRolesToUser(
  client: PgPoolClient,
  data: {
    updatedBy: string;
    roles: string[];
    userName: string;
    endDate?: Date;
  },
): Promise<void>;
export declare function syncUserRoles(
  client: PgPoolClient,
  data: {
    createdBy: string;
    updatedBy: string;
    roles: string[];
    userName: string;
    startDate?: Date;
  },
): Promise<void>;
export {};
//# sourceMappingURL=user.d.ts.map
