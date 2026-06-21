'use server';
import { compare, genSaltSync, hashSync } from 'bcrypt-ts';
import { getRequestContext } from './lib/core/server/request-context';
import { executeQuery, transaction } from './lib/core/server/db';
import logger from './lib/core/server/logger';
import { logActivity } from './lib/core/server/activity';
import { decrypt, encrypt } from './lib/core/server/secure';
import { getErrorMessage, isUserError, UserError } from './lib/core/common/error';
import { getValidIpAddress, isUserActiveSync } from './lib/core/server/utils';
import { createLogoutRequest } from './lib/saml';
import { sessionTracker } from './lib/core/server/session-tracker';
import { processRelayState } from './lib/core/server/relay-state-plugin';
import { z } from 'zod/v3';
import { v7 as uuid } from 'uuid';
import { randomBytes } from 'node:crypto';
import { getSignInUserDbLimiter, getSignInIpDbLimiter, getRefreshTokenDbLimiter } from './lib/core/server/db-ratelimit';
import { getCacheProvider } from './lib/core/server/cache/CacheProviderFactory';
import { PREFIX } from './lib/server/constants';
import { getConfig } from './lib/core/server/config';
import { getMobileAuthSessionMetadata } from './lib/core/common/mobile-auth';
import { CSRF_COOKIE_NAME, DEV_AUTO_LOGIN_SESSION_ID } from './lib/core/common/constants';
const saltRounds = 10;
const SESSION_COOKIE_NAME = 'venky-session';
const SESSION_TTL_MS = (process.env.SESSION_TTL_SECONDS ? Number.parseInt(process.env.SESSION_TTL_SECONDS, 10) : 12 * 60 * 60) * 1000;
let warnedAutoLoginInProduction = false;
/**
 * Hashes a password using bcrypt with the configured salt rounds
 */
export async function hashPassword(pwd) {
    const salt = genSaltSync(saltRounds);
    const hash = hashSync(pwd, salt);
    return hash;
}
async function isUserActive(user) {
    const active = isUserActiveSync(user);
    if (!active) {
        const ctx = getRequestContext('isUserActive');
        const headersList = await ctx.getHeaders();
        const ipAddress = getValidIpAddress(headersList);
        const userAgent = headersList.get('user-agent');
        await logActivity({
            userName: user.user_name,
            eventType: 'Inactive User Sign In Attempt',
            eventId: user.user_name,
            sessionId: 'N/A',
            createdAt: new Date().toISOString(),
            metadata: {
                ipAddress,
                userAgent,
            },
        });
    }
    return active;
}
async function getUser(userName) {
    const result = await executeQuery(`SELECT
      user_name,
      password_hash,
      email,
      display_name,
      user_id,
      settings,
      start_date,
      end_date,
      locked,
      force_password_change
    FROM ${PREFIX}users WHERE user_name = $1`, [userName]);
    return result.rows[0] || null;
}
export async function getUserRoles(userName) {
    const appId = getConfig('auth.getUserRoles').appId;
    const rolesResult = await executeQuery(`SELECT
      r.role_code
    FROM ${PREFIX}user_roles ur, ${PREFIX}roles r 
    WHERE ur.role_code = r.role_code 
      AND ur.user_name = $1 
      AND ur.start_date <= now() 
      AND (ur.end_date IS NULL OR ur.end_date >= now()) 
      AND r.start_date <= now() 
      AND (r.end_date IS NULL OR r.end_date >= now()) 
      AND r.app_id IN ($2, 'core')`, [userName, appId]);
    return rolesResult.rows.map((row) => row.role_code);
}
async function updateUserLastLogin(userName) {
    const ctx = getRequestContext('updateUserLastLogin');
    const headersList = await ctx.getHeaders();
    const ipAddress = getValidIpAddress(headersList);
    await executeQuery(`UPDATE ${PREFIX}users SET last_login = $1, ip_address = $2 WHERE user_name = $3`, [
        new Date().toISOString(),
        ipAddress,
        userName,
    ]);
}
async function serverAuthorize(credentials) {
    const parsedCredentials = z
        .object({
        userName: z.string(),
        password: z.string().min(5),
    })
        .safeParse(credentials);
    if (parsedCredentials.success) {
        let { userName, password } = parsedCredentials.data;
        userName = userName.trim().toLowerCase();
        password = password.trim();
        const user = await getUser(userName);
        if (user) {
            if (!(await isUserActive(user))) {
                return null;
            }
            if (await compare(password, user.password_hash)) {
                await updateUserLastLogin(userName);
                return getUserFromDBUser(user);
            }
        }
        const ctx = getRequestContext('serverAuthorize');
        const headersList = await ctx.getHeaders();
        const ipAddress = getValidIpAddress(headersList);
        const userAgent = headersList.get('user-agent');
        await executeQuery(`UPDATE ${PREFIX}users SET failed_login_attempts = failed_login_attempts + 1,
      last_failed_login = $1, last_failed_login_ip_address = $2 WHERE user_name = $3`, [new Date().toISOString(), ipAddress, userName]);
        await logActivity({
            userName: userName,
            eventType: 'Sign In Failed',
            eventId: userName,
            sessionId: 'N/A',
            createdAt: new Date().toISOString(),
            metadata: {
                ipAddress,
                userAgent,
            },
        });
    }
    return null;
}
async function getUserFromDBUser(user, sessionIndex) {
    return {
        email: user.email,
        forcePasswordChange: user.force_password_change,
        name: user.display_name,
        roles: await getUserRoles(user.user_name),
        sessionIndex,
        settings: user.settings,
        userId: user.user_id,
        userName: user.user_name,
    };
}
function createMobileAuthSessionData(encryptedSessionId, expiresAt, user) {
    return {
        encryptedSessionId,
        expiresAt: expiresAt.toISOString(),
        ...getMobileAuthSessionMetadata(user),
    };
}
function getExpiresAt() {
    return new Date(Date.now() + SESSION_TTL_MS);
}
export async function cacheAutoLoginSession() {
    // Auto-login for development
    const autoLoginUser = process.env.AUTO_LOGIN_USER;
    const autoLoginPwd = process.env.AUTO_LOGIN_PWD;
    if (autoLoginUser) {
        if (process.env.NODE_ENV === 'production') {
            logger.warn('AUTO_LOGIN_USER is set but NODE_ENV=production. Auto-login is disabled in production and will be ignored.');
            return;
        }
        if (autoLoginPwd == null) {
            logger.error('AUTO_LOGIN_PWD environment variable must be set when AUTO_LOGIN_USER is set!');
            process.exit(1);
        }
        const cache = getCacheProvider();
        const cacheKey = `autoLoginSession.${autoLoginUser}`;
        const user = await serverAuthorize({ userName: autoLoginUser, password: autoLoginPwd });
        if (!user) {
            logger.error(`AUTO_LOGIN_USER: Auth failed!`);
            process.exit(1);
        }
        const autoLoginSession = {
            id: DEV_AUTO_LOGIN_SESSION_ID,
            user,
            expires: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
        };
        await cache.set(cacheKey, autoLoginSession, {
            ttlSeconds: SESSION_TTL_MS / 1000,
            autoRefreshTTL: true,
        });
        logger.info('----------------------------------------------------------');
        logger.info(`AUTO_LOGIN_USER: User '${autoLoginUser}' auto-logged in!`);
        logger.info('----------------------------------------------------------');
    }
}
// Auth function - gets session from cookie or Authorization header and validates against database
export async function auth(doNotSetSessionCookie = false) {
    const cache = getCacheProvider();
    // Auto-login for development
    const autoLoginUser = process.env.AUTO_LOGIN_USER;
    if (autoLoginUser && process.env.NODE_ENV !== 'production') {
        const cacheKey = `autoLoginSession.${autoLoginUser}`;
        let cachedAutoLoginSession = await cache.get(cacheKey);
        if (cachedAutoLoginSession) {
            return cachedAutoLoginSession;
        }
        // Session not cached yet - wait for server startup to complete
        // This happens when requests arrive before startup() finishes
        const { waitForStartup } = await import('./lib/core/server/startup');
        await waitForStartup();
        // Try again after initialization
        cachedAutoLoginSession = await cache.get(cacheKey);
        if (cachedAutoLoginSession) {
            return cachedAutoLoginSession;
        }
        // If still not found after init, something is wrong
        throw new Error('AUTO_LOGIN_USER is set but no auto-login session found after initialization!');
    }
    else if (autoLoginUser && process.env.NODE_ENV === 'production' && !warnedAutoLoginInProduction) {
        warnedAutoLoginInProduction = true;
        logger.warn('AUTO_LOGIN_USER is ignored because NODE_ENV=production.');
    }
    const ctx = getRequestContext('auth');
    let encryptedSessionId = await ctx.getCookie(SESSION_COOKIE_NAME);
    let isMobileRequest = false;
    // If no cookie, check Authorization header for Bearer token (mobile requests)
    if (!encryptedSessionId) {
        const authHeader = await ctx.getHeader('authorization');
        if (authHeader?.startsWith('Bearer ')) {
            encryptedSessionId = authHeader.substring(7); // Remove 'Bearer ' prefix
            isMobileRequest = true; // Don't set cookies for mobile requests
        }
    }
    if (!encryptedSessionId) {
        return null;
    }
    let sessionIdUserName = null;
    try {
        sessionIdUserName = await decrypt(encryptedSessionId);
    }
    catch (e) {
        logger.error(`Error decrypting session token: ${encryptedSessionId}`, getErrorMessage(e));
        return null;
    }
    const [sessionId, userName] = sessionIdUserName.split(':');
    const cacheKey = `s.${userName}.${sessionId}`;
    const cachedSession = await cache.get(cacheKey);
    const appId = getConfig('auth').appId;
    if (cachedSession) {
        const sessionResult = await executeQuery(`SELECT session_id, user_name, expires_at, signed_out_at, csrf_token FROM ${PREFIX}user_sessions WHERE session_id = $1 AND app_id = $2`, [sessionId, appId]);
        const dbSession = sessionResult.rows[0];
        if (!dbSession || dbSession.signed_out_at) {
            await cache.delete(cacheKey);
            return null;
        }
        if (dbSession.expires_at < new Date()) {
            await cache.delete(cacheKey);
            return null;
        }
        // Update session access
        sessionTracker.updateSessionAccess(sessionId, getExpiresAt().toISOString());
        if (!doNotSetSessionCookie && !isMobileRequest) {
            await setSessionCookie(encryptedSessionId, getExpiresAt());
        }
        await ensureBrowserSessionCsrf({
            sessionId,
            appId,
            isMobileRequest,
            doNotSetSessionCookie,
            dbCsrfToken: dbSession.csrf_token,
        });
        return cachedSession;
    }
    try {
        // Get session from database directly (better-auth adapter is used internally)
        const sessionResult = await executeQuery(`SELECT session_id, user_name, expires_at, signed_out_at, csrf_token FROM ${PREFIX}user_sessions WHERE session_id = $1 AND app_id = $2`, [sessionId, appId]);
        const dbSession = sessionResult.rows[0];
        if (!dbSession || dbSession.signed_out_at) {
            return null;
        }
        if (dbSession.expires_at < new Date()) {
            return null;
        }
        // Get user data
        const dbUser = await getUser(dbSession.user_name);
        if (!dbUser) {
            return null;
        }
        // Check if user is active
        if (!isUserActiveSync(dbUser)) {
            return null;
        }
        const expiresAt = getExpiresAt();
        // Update session access
        sessionTracker.updateSessionAccess(dbSession.session_id, expiresAt.toISOString());
        const session = {
            id: dbSession.session_id,
            user: await getUserFromDBUser(dbUser),
            expires: expiresAt.toISOString(),
        };
        await cache.set(`s.${session.user.userName}.${sessionId}`, session, {
            ttlSeconds: 12 * 60 * 60 * 1000,
            autoRefreshTTL: true,
        });
        if (!doNotSetSessionCookie && !isMobileRequest) {
            await setSessionCookie(encryptedSessionId, expiresAt);
        }
        await ensureBrowserSessionCsrf({
            sessionId: dbSession.session_id,
            appId,
            isMobileRequest,
            doNotSetSessionCookie,
            dbCsrfToken: dbSession.csrf_token,
        });
        return session;
    }
    catch (error) {
        logger.error('Error getting session', error);
        return null;
    }
}
// Sign in function - integrates with better-auth
export async function signIn(provider, options) {
    if (provider !== 'credentials') {
        throw new UserError('Only credentials provider is supported');
    }
    const { token, relayState, userName, password, metadata, isMobile } = options || {};
    const ctx = getRequestContext('signIn');
    const headersList = await ctx.getHeaders();
    const ipAddress = getValidIpAddress(headersList);
    const userAgent = headersList.get('user-agent') || 'unknown';
    // Cross-instance rate limit on credential sign-in. Protects against
    // targeted brute-force (per-userName) and horizontal spraying (per-IP).
    // Token / SSO flows are rate-limited upstream at their callback routes,
    // so we only throttle the credentials branch here.
    if (!token && (userName || ipAddress)) {
        const userLimiter = getSignInUserDbLimiter();
        const ipLimiter = getSignInIpDbLimiter();
        const [userBlocked, ipBlocked] = await Promise.all([
            userName ? userLimiter.isRateLimited(userName) : false,
            ipAddress ? ipLimiter.isRateLimited(ipAddress) : false,
        ]);
        if (userBlocked || ipBlocked) {
            logger.warn('[signIn] Rate limit hit', { userName, ipAddress, userBlocked, ipBlocked });
            // Generic error — never reveal which limit tripped or whether the
            // username exists.
            throw new UserError('Too many sign-in attempts. Please try again later.');
        }
    }
    let user = null;
    if (token) {
        // SAML/SSO/Google OAuth flow
        try {
            const decoded = await decrypt(token);
            const { profile, sessionIndex, cloudio, google } = JSON.parse(decoded);
            let extractedUserName = null;
            let emailAddress = null;
            let displayName = null;
            let sessionId = null;
            let cloudioRoles;
            let authProvider = 'SAML';
            if (profile) {
                ({
                    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': emailAddress,
                    'http://schemas.microsoft.com/identity/claims/displayname': displayName,
                    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': extractedUserName,
                } = profile);
                sessionId = sessionIndex;
            }
            if (cloudio) {
                ({ userName: extractedUserName, emailAddress, displayName, sessionId, roles: cloudioRoles } = cloudio);
                sessionId = `cloudio:${sessionId}`;
            }
            if (google) {
                // Google OAuth - use email as username
                emailAddress = google.email;
                displayName = google.name;
                extractedUserName = google.email; // Use email as username for Google auth
                sessionId = `google:${google.id}`;
                authProvider = 'GOOGLE';
            }
            extractedUserName = extractedUserName?.toLowerCase().trim();
            emailAddress = emailAddress?.toLowerCase().trim();
            let dbUser = await getUser(extractedUserName || '');
            if (dbUser && !(await isUserActive(dbUser))) {
                throw new Error('User is inactive');
            }
            if (!dbUser) {
                if (logger.infoEnabled) {
                    logger.info('User not found, creating user', {
                        userName: extractedUserName,
                        emailAddress,
                        displayName,
                        authProvider,
                    });
                }
                await transaction(async (con) => {
                    const today = new Date();
                    const settings = {
                        theme: 'dark',
                        sidebarOpen: true,
                    };
                    await con.query(`INSERT INTO ${PREFIX}users (
              user_name, user_id, email, display_name, password_hash,
              created_at, created_by, updated_by, updated_at, settings,
              failed_login_attempts, locked, previous_password_hashes, start_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`, [
                        extractedUserName,
                        null,
                        emailAddress,
                        displayName,
                        'SSO',
                        today,
                        authProvider,
                        authProvider,
                        today,
                        JSON.stringify(settings),
                        0,
                        false,
                        JSON.stringify([]),
                        today,
                    ]);
                });
                dbUser = await getUser(extractedUserName || '');
                if (!dbUser) {
                    throw new Error('Failed to create user');
                }
            }
            if (relayState) {
                await processRelayState(relayState, extractedUserName || '', cloudioRoles);
            }
            await updateUserLastLogin(extractedUserName || '');
            user = await getUserFromDBUser(dbUser, sessionId);
        }
        catch (e) {
            if (!isUserError(e)) {
                logger.error('Error decrypting token', e);
            }
            throw new UserError('Authentication failed');
        }
    }
    else if (userName && password) {
        // Credentials flow
        user = await serverAuthorize({ userName, password });
        if (!user) {
            throw new UserError('Invalid credentials');
        }
    }
    else if (userName && metadata) {
        // Magic link flow - user provided via magic link
        const dbUser = await getUser(userName);
        if (!dbUser) {
            throw new UserError('User not found');
        }
        if (!(await isUserActive(dbUser))) {
            throw new UserError('User is inactive');
        }
        await updateUserLastLogin(userName);
        user = await getUserFromDBUser(dbUser);
        logger.info('User signed in via magic link', { userName, metadata, roles: user.roles });
    }
    else {
        throw new UserError('Missing credentials');
    }
    // Create session using better-auth
    if (!ipAddress || !userAgent) {
        logger.error(`IP address or user agent not found! ${JSON.stringify({ ipAddress, userAgent })}`);
        throw new UserError('IP address or user agent not found!');
    }
    const expiresAt = getExpiresAt();
    const now = new Date();
    const sessionId = `s${uuid().replace(/-/g, '')}`;
    // CSRF token is a random 32-byte value, independent of the session id.
    // Stored server-side and also set as a readable cookie for the client to
    // reflect back as X-CSRF-Token (double-submit cookie pattern).
    const csrfToken = randomBytes(32).toString('hex');
    const encryptedSessionId = await encrypt(`${sessionId}:${user.userName}`);
    const cache = getCacheProvider();
    await cache.set(`s.${user.userName}.${sessionId}`, {
        id: sessionId,
        user,
        expires: expiresAt.toISOString(),
    }, {
        ttlSeconds: 12 * 60 * 60 * 1000,
        autoRefreshTTL: true,
    });
    // Insert session into database
    const appId = getConfig('signIn').appId;
    await transaction(async (client) => {
        await client.query(`INSERT INTO ${PREFIX}user_sessions (
        user_name, user_id, session_id, ip_address, user_agent,
        csrf_token, expires_at, signed_in_at, last_accessed_at, app_id, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`, [
            user.userName,
            user.userId,
            sessionId,
            ipAddress,
            userAgent,
            csrfToken,
            expiresAt,
            now,
            now,
            appId,
            metadata ? JSON.stringify(metadata) : null,
        ]);
    });
    await logActivity({
        userName: user.userName,
        eventType: 'Sign In',
        eventId: sessionId,
        metadata: {
            ipAddress,
            userAgent,
        },
        sessionId,
        createdAt: now.toISOString(),
    });
    if (isMobile) {
        return createMobileAuthSessionData(encryptedSessionId, expiresAt, user);
    }
    await setSessionCookie(encryptedSessionId, expiresAt);
    await setCsrfCookie(csrfToken, expiresAt);
}
// Refresh token function for mobile clients
export async function refreshToken(encryptedSessionId) {
    let sessionIdUserName = null;
    try {
        sessionIdUserName = await decrypt(encryptedSessionId);
    }
    catch (e) {
        logger.error(`Error decrypting session token for refresh: ${encryptedSessionId}`, getErrorMessage(e));
        return null;
    }
    const [sessionId, userName] = sessionIdUserName.split(':');
    const appId = getConfig('auth').appId;
    // Rate-limit per session so a stolen token can't be abused to mint
    // thousands of sessions before rotation-chain reuse detection fires.
    if (await getRefreshTokenDbLimiter().isRateLimited(sessionId)) {
        logger.warn('[refreshToken] Rate limit hit', { userName, sessionId });
        return null;
    }
    // Validate session exists and is valid. Select rotation fields so we can
    // detect replay of an already-rotated token.
    const sessionResult = await executeQuery(`SELECT session_id, user_name, user_id, ip_address, user_agent,
            expires_at, signed_out_at, rotated_to_session_id
       FROM ${PREFIX}user_sessions
      WHERE session_id = $1 AND app_id = $2`, [sessionId, appId]);
    const dbSession = sessionResult.rows[0];
    if (!dbSession) {
        return null;
    }
    // REUSE DETECTION: if a client presents a token that's already been
    // rotated, treat it as a leaked credential and revoke the entire chain
    // of descendants so the attacker (or original client) loses all access.
    if (dbSession.rotated_to_session_id) {
        logger.warn('[refreshToken] Rotated session id presented; revoking chain', {
            userName,
            sessionId,
            rotatedTo: dbSession.rotated_to_session_id,
        });
        await revokeSessionChain(dbSession.rotated_to_session_id, appId);
        return null;
    }
    if (dbSession.signed_out_at) {
        return null;
    }
    if (dbSession.expires_at < new Date()) {
        return null;
    }
    // Get user data and check if user is still active
    const dbUser = await getUser(dbSession.user_name);
    if (!dbUser) {
        return null;
    }
    if (!isUserActiveSync(dbUser)) {
        return null;
    }
    // Rotate: mint a new session id and CSRF token. Mark the old session as
    // rotated (signed_out_at + rotated_to_session_id) so a replay of the old
    // token triggers the reuse-detection branch above.
    const newSessionId = `s${uuid().replace(/-/g, '')}`;
    const newCsrfToken = randomBytes(32).toString('hex');
    const newEncryptedSessionId = await encrypt(`${newSessionId}:${userName}`);
    const expiresAt = getExpiresAt();
    const now = new Date();
    await transaction(async (client) => {
        // Insert the successor row carrying forward identity + network fingerprint.
        await client.query(`INSERT INTO ${PREFIX}user_sessions (
        user_name, user_id, session_id, ip_address, user_agent,
        csrf_token, expires_at, signed_in_at, last_accessed_at, app_id,
        parent_session_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, [
            dbSession.user_name,
            dbSession.user_id,
            newSessionId,
            dbSession.ip_address,
            dbSession.user_agent,
            newCsrfToken,
            expiresAt,
            now,
            now,
            appId,
            sessionId,
        ]);
        // Mark the old row as rotated.
        await client.query(`UPDATE ${PREFIX}user_sessions
          SET signed_out_at = $1,
              rotated_to_session_id = $2,
              last_accessed_at = $1
        WHERE session_id = $3 AND app_id = $4`, [now, newSessionId, sessionId, appId]);
    });
    // Drop old cache entry; seed new one.
    const cache = getCacheProvider();
    await cache.delete(`s.${userName}.${sessionId}`);
    const newSession = {
        id: newSessionId,
        user: await getUserFromDBUser(dbUser),
        expires: expiresAt.toISOString(),
    };
    await cache.set(`s.${userName}.${newSessionId}`, newSession, {
        ttlSeconds: 12 * 60 * 60 * 1000,
        autoRefreshTTL: true,
    });
    sessionTracker.updateSessionAccess(newSessionId, expiresAt.toISOString());
    return {
        ...createMobileAuthSessionData(newEncryptedSessionId, expiresAt, newSession.user),
    };
}
/**
 * Walk forward from `sessionId` and sign out every session in the rotation
 * chain. Used when a rotated token is replayed — we assume the account is
 * compromised and force re-auth across all outstanding tokens.
 */
async function revokeSessionChain(startSessionId, appId) {
    const now = new Date();
    await transaction(async (client) => {
        let current = startSessionId;
        const seen = new Set();
        while (current && !seen.has(current)) {
            seen.add(current);
            const sql = `UPDATE ${PREFIX}user_sessions
            SET signed_out_at = COALESCE(signed_out_at, $1)
          WHERE session_id = $2 AND app_id = $3
          RETURNING rotated_to_session_id`;
            const result = await client.query(sql, [
                now,
                current,
                appId,
            ]);
            current = result.rows[0]?.rotated_to_session_id ?? null;
        }
    });
}
async function setSessionCookie(encryptedSessionId, expiresAt) {
    // Set session cookie
    try {
        const ctx = getRequestContext('setSessionCookie');
        await ctx.setCookie(SESSION_COOKIE_NAME, encryptedSessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            expires: expiresAt,
            path: '/',
        });
    }
    catch (e) {
        logger.error('Error setting session cookie', e);
    }
}
/**
 * Non-httpOnly companion cookie for the double-submit CSRF pattern. Client JS
 * reads this cookie and sends its value in the `X-CSRF-Token` header on
 * mutating requests; the server compares the header to the token stored on
 * the session row.
 */
async function setCsrfCookie(csrfToken, expiresAt) {
    try {
        const ctx = getRequestContext('setCsrfCookie');
        await ctx.setCookie(CSRF_COOKIE_NAME, csrfToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: expiresAt,
            path: '/',
        });
    }
    catch (e) {
        logger.error('Error setting CSRF cookie', e);
    }
}
/**
 * For browser sessions, ensure a DB CSRF value exists (migrated pre-CSRF rows)
 * and (re)issue the `venky-csrf` cookie on each auth() so the client can send
 * X-CSRF-Token on the next action call.
 */
async function ensureBrowserSessionCsrf(params) {
    const { sessionId, appId, isMobileRequest, doNotSetSessionCookie, dbCsrfToken } = params;
    if (isMobileRequest || doNotSetSessionCookie) {
        return;
    }
    let token = dbCsrfToken;
    if (!token) {
        const minted = randomBytes(32).toString('hex');
        const resolved = await transaction(async (con) => {
            const u = await con.query(`UPDATE ${PREFIX}user_sessions SET csrf_token = $1 WHERE session_id = $2 AND app_id = $3 AND csrf_token IS NULL RETURNING csrf_token`, [minted, sessionId, appId]);
            if (u.rows[0]?.csrf_token) {
                return u.rows[0].csrf_token;
            }
            const s = await con.query(`SELECT csrf_token FROM ${PREFIX}user_sessions WHERE session_id = $1 AND app_id = $2`, [sessionId, appId]);
            return s.rows[0]?.csrf_token ?? null;
        });
        if (!resolved) {
            logger.warn('ensureBrowserSessionCsrf: could not set csrf_token', { sessionId, appId });
            return;
        }
        token = resolved;
    }
    await setCsrfCookie(token, getExpiresAt());
}
// Sign out function - uses better-auth
export async function signOut() {
    const session = await auth();
    if (!session) {
        return '/login';
    }
    const now = new Date().toISOString();
    const ctx = getRequestContext('signOut');
    const headersList = await ctx.getHeaders();
    const ipAddress = getValidIpAddress(headersList);
    const userAgent = headersList.get('user-agent');
    const appId = getConfig('signOut').appId;
    // Delete session from database
    await transaction(async (con) => {
        await con.query(`UPDATE ${PREFIX}user_sessions SET signed_out_at = $1 WHERE session_id = $2 AND app_id = $3`, [
            now,
            session.id,
            appId,
        ]);
        await con.query(`INSERT INTO ${PREFIX}user_sessions_arch (
        user_name, user_id, session_id, ip_address, user_agent,
        csrf_token, expires_at, signed_in_at, last_accessed_at, signed_out_at, app_id, metadata
      ) SELECT
        user_name, user_id, session_id, ip_address, user_agent,
        csrf_token, expires_at, signed_in_at, last_accessed_at, signed_out_at, app_id, metadata
      FROM ${PREFIX}user_sessions WHERE session_id = $1 AND app_id = $2`, [session.id, appId]);
        await con.query(`DELETE FROM ${PREFIX}user_sessions WHERE session_id = $1 AND app_id = $2`, [session.id, appId]);
    });
    await logActivity({
        userName: session.user.userName,
        eventType: 'Sign Out',
        eventId: session.id,
        sessionId: session.id,
        metadata: {
            ipAddress,
            userAgent,
        },
        createdAt: now,
    });
    // Clear session cookie
    await ctx.deleteCookie(SESSION_COOKIE_NAME);
    await ctx.deleteCookie(CSRF_COOKIE_NAME);
    if (session.user.sessionIndex) {
        try {
            if (session.user.sessionIndex.startsWith('cloudio:')) {
                let logoutUrl = process.env.CLOUDIO_LOGOUT_URL ?? '';
                logoutUrl += `?sessionId=${session.user.sessionIndex.split(':')[1]}`;
                const logoutToken = await encrypt(logoutUrl);
                return `/login/out?sso=${encodeURIComponent(logoutToken)}`;
            }
            const logoutUrl = await createLogoutRequest(process.env.APP_URL ?? '', session.user.userName, session.user.sessionIndex);
            const logoutToken = await encrypt(logoutUrl);
            return `/login/out?sso=${encodeURIComponent(logoutToken)}`;
        }
        catch (error) {
            // Session is already cleared locally; IdP logout URL can fail if SAML metadata
            // is missing/misconfigured (common in dev) or the library rejects the metadata.
            logger.error('IdP logout redirect failed; session already cleared', { error: getErrorMessage(error) });
            return '/login';
        }
    }
    return '/login';
}
export async function clearSessionCache(userName) {
    const cache = getCacheProvider();
    await cache.delete(`s.${userName}.*`);
}
//# sourceMappingURL=auth.js.map