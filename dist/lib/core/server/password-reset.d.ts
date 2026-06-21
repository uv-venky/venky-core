import type { PgPoolClient } from '../../../lib/core/server/db';
export declare function createPasswordResetToken(
  client: PgPoolClient,
  email: string,
  userName: string,
): Promise<{
  key: string;
  token: string;
}>;
export declare function validatePasswordResetToken(
  client: PgPoolClient,
  key: string,
  token: string,
  email: string,
  userName: string,
): Promise<boolean>;
export declare function validateNewPassword(password: string, previousPasswordHashes: string[]): Promise<string | null>;
export declare function signOutAllUserSessions(con: PgPoolClient, userName: string): Promise<void>;
//# sourceMappingURL=password-reset.d.ts.map
