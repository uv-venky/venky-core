import 'server-only';
export interface GoogleTokens {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token?: string;
  refresh_token?: string;
}
export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}
interface GoogleOAuthState {
  returnUrl: string;
  timestamp: number;
}
/**
 * Check if Google OAuth is enabled
 */
export declare function isGoogleOAuthEnabled(): Promise<boolean>;
/**
 * Generate an encrypted state parameter for CSRF protection
 */
export declare function generateOAuthState(returnUrl?: string): Promise<string>;
/**
 * Validate and decode the state parameter
 */
export declare function validateOAuthState(encryptedState: string): Promise<GoogleOAuthState>;
/**
 * Build the Google OAuth authorization URL
 */
export declare function getGoogleAuthUrl(state: string, origin: string): Promise<string>;
/**
 * Exchange authorization code for access tokens
 */
export declare function exchangeCodeForTokens(code: string, origin: string): Promise<GoogleTokens>;
/**
 * Fetch user information from Google using the access token
 */
export declare function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo>;
/**
 * Validate that the user's email domain is allowed
 */
export declare function validateEmailDomain(email: string): Promise<void>;
export {};
//# sourceMappingURL=google-oauth.d.ts.map
