import type { PgPoolClient } from './db';
import type { Session } from '../../../auth';
export interface MasterTokenData<T> {
  userName: string;
  recipientEmail: string;
  metadata: T;
  expiresAt: string;
  linkType: string;
  redirectUrl: string;
}
export interface LoginTokenData<T> {
  masterTokenKey: string;
  userName: string;
  metadata: T;
  expiresAt: string;
  redirectUrl: string;
}
export interface GenerateMasterLinkParams<T> {
  userName: string;
  recipientEmail: string;
  ttlMinutes: number;
  metadata: T;
  redirectUrl: string;
  linkType: string;
}
export interface GenerateMasterLinkResult {
  masterLink: string;
  masterToken: string;
}
/**
 * Generates a master link that can be used to generate login links
 */
export declare function generateMasterLink<T>(
  client: PgPoolClient,
  session: Session,
  params: GenerateMasterLinkParams<T>,
): Promise<GenerateMasterLinkResult>;
/**
 * Validates and retrieves master token data
 */
export declare function validateMasterToken<T>(client: PgPoolClient, token: string): Promise<MasterTokenData<T> | null>;
/**
 * Deletes a master token
 */
export declare function deleteMasterToken(client: PgPoolClient, token: string): Promise<void>;
/**
 * Generates a login link from a master token
 */
export declare function generateLoginLink<T>(
  client: PgPoolClient,
  masterToken: string,
  loginLinkTtlMinutes?: number,
): Promise<{
  loginLink: string;
  loginToken: string;
}>;
/**
 * Redeems a login token and returns session metadata
 * Note: This does NOT create the session - that's done in signIn
 */
export declare function redeemLoginToken<T>(
  client: PgPoolClient,
  token: string,
): Promise<{
  userName: string;
  metadata: T;
  redirectUrl: string;
}>;
//# sourceMappingURL=magic-link.d.ts.map
