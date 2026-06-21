/* Copyright (c) 2024-present Venky Corp. */
'use server';
import 'server-only';
import { encrypt, decrypt } from './core/server/secure';
import logger from './core/server/logger';
import { UserError } from './core/common/error';
// Google OAuth endpoints
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
// State expiration time (5 minutes)
const STATE_EXPIRY_MS = 5 * 60 * 1000;
function getGoogleClientId() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
        throw new UserError('GOOGLE_CLIENT_ID environment variable is not set');
    }
    return clientId;
}
function getGoogleClientSecret() {
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientSecret) {
        throw new UserError('GOOGLE_CLIENT_SECRET environment variable is not set');
    }
    return clientSecret;
}
function getGoogleCallbackUrl(origin) {
    return `${origin}/api/auth/google/callback`;
}
/**
 * Get the allowed Google Workspace domain for authentication.
 * If not set, any Google account can sign in.
 */
function getGoogleAllowedDomain() {
    return process.env.GOOGLE_ALLOWED_DOMAIN || null;
}
/**
 * Check if Google OAuth is enabled
 */
export async function isGoogleOAuthEnabled() {
    return Boolean(process.env.GOOGLE_CLIENT_ID);
}
/**
 * Generate an encrypted state parameter for CSRF protection
 */
export async function generateOAuthState(returnUrl = '/') {
    const state = {
        returnUrl,
        timestamp: Date.now(),
    };
    return encrypt(JSON.stringify(state));
}
/**
 * Validate and decode the state parameter
 */
export async function validateOAuthState(encryptedState) {
    try {
        const decrypted = await decrypt(encryptedState);
        const state = JSON.parse(decrypted);
        // Check if state has expired
        if (Date.now() - state.timestamp > STATE_EXPIRY_MS) {
            throw new UserError('OAuth state has expired');
        }
        return state;
    }
    catch (error) {
        if (error instanceof UserError) {
            throw error;
        }
        logger.error('Failed to validate OAuth state', error);
        throw new UserError('Invalid OAuth state');
    }
}
/**
 * Build the Google OAuth authorization URL
 */
export async function getGoogleAuthUrl(state, origin) {
    const clientId = getGoogleClientId();
    const redirectUri = getGoogleCallbackUrl(origin);
    const allowedDomain = getGoogleAllowedDomain();
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        state,
        access_type: 'offline',
        prompt: 'select_account',
    });
    // If domain restriction is set, use hd parameter to hint at the domain
    // Note: This is just a hint, actual validation happens server-side
    if (allowedDomain) {
        params.set('hd', allowedDomain);
    }
    return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}
/**
 * Exchange authorization code for access tokens
 */
export async function exchangeCodeForTokens(code, origin) {
    const clientId = getGoogleClientId();
    const clientSecret = getGoogleClientSecret();
    const redirectUri = getGoogleCallbackUrl(origin);
    const response = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        logger.error('Failed to exchange code for tokens', { status: response.status, error: errorText });
        throw new UserError('Failed to authenticate with Google');
    }
    return response.json();
}
/**
 * Fetch user information from Google using the access token
 */
export async function getGoogleUserInfo(accessToken) {
    const response = await fetch(GOOGLE_USERINFO_URL, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    if (!response.ok) {
        const errorText = await response.text();
        logger.error('Failed to fetch Google user info', { status: response.status, error: errorText });
        throw new UserError('Failed to get user information from Google');
    }
    return response.json();
}
/**
 * Validate that the user's email domain is allowed
 */
export async function validateEmailDomain(email) {
    const allowedDomain = getGoogleAllowedDomain();
    if (!allowedDomain) {
        // No domain restriction configured
        return;
    }
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (emailDomain !== allowedDomain.toLowerCase()) {
        throw new UserError(`Sign-in is restricted to ${allowedDomain} email addresses`);
    }
}
//# sourceMappingURL=google-oauth.js.map