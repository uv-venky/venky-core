/* Copyright (c) 2024-present Venky Corp. */
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { PREFIX } from '../../../lib/server/constants';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME, DEV_AUTO_LOGIN_SESSION_ID } from '../../../lib/core/common/constants';
import { getRequestContext } from '../../../lib/core/server/request-context';
/** Methods that never require CSRF validation (safe methods per RFC 7231). */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
/**
 * Path prefixes exempt from CSRF checking. These are either (a) public
 * endpoints that don't have a session cookie to misuse in the first place,
 * (b) webhooks from external services that authenticate differently, or
 * (c) mobile API endpoints which use bearer tokens, not cookies.
 */
const CSRF_EXEMPT_PREFIXES = [
  '/api/p/', // public actions / public routes
  '/api/webhooks/',
  '/api/mobile/',
  '/api/sse/', // server-sent events: read-only streaming
];
export function isCsrfExempt(pathname, method) {
  if (SAFE_METHODS.has(method.toUpperCase())) return true;
  return CSRF_EXEMPT_PREFIXES.some((p) => pathname.startsWith(p));
}
function readNamedCookieFromHeader(cookieHeader, name) {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(/;\s*/)) {
    if (part.startsWith(`${name}=`)) {
      return decodeURIComponent(part.slice(name.length + 1));
    }
  }
  return null;
}
async function setResponseCsrfCookie(token, session) {
  const ctx = getRequestContext('setResponseCsrfCookie');
  const expires = new Date(session.expires);
  await ctx.setCookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires,
    path: '/',
  });
}
/**
 * Validate the X-CSRF-Token (or non-httpOnly `venky-csrf` cookie) against the
 * server-side session token. Missing tokens on pre-CSRF sessions are backfilled
 * once, then a Set-Cookie is issued. Uses timingSafeEqual to avoid leaking
 * token content via timing.
 */
export async function assertCsrf(client, session, req) {
  const url = new URL(req.url);
  if (isCsrfExempt(url.pathname, req.method)) return;
  // Mobile and other non-browser clients send Bearer tokens; CSRF is not
  // applicable the same way (cookies are not auto-attached across origins for API clients).
  const authz = req.headers.get('authorization');
  if (authz?.toLowerCase().startsWith('bearer ')) {
    return;
  }
  // Dev `AUTO_LOGIN_USER`: no `user_sessions` row; skip CSRF to avoid extra DB
  // work (auto-login is meant to be cache-only in development).
  if (process.env.NODE_ENV !== 'production' && session.id === DEV_AUTO_LOGIN_SESSION_ID) {
    return;
  }
  const result = await client.query(`SELECT csrf_token FROM ${PREFIX}user_sessions WHERE session_id = $1 LIMIT 1`, [
    session.id,
  ]);
  let stored = result.rows[0]?.csrf_token;
  if (!stored) {
    const minted = randomBytes(32).toString('hex');
    const upd = await client.query(
      `UPDATE ${PREFIX}user_sessions SET csrf_token = $1 WHERE session_id = $2 AND csrf_token IS NULL RETURNING csrf_token`,
      [minted, session.id],
    );
    if (upd.rows[0]?.csrf_token) {
      stored = upd.rows[0].csrf_token;
    } else {
      const reread = await client.query(`SELECT csrf_token FROM ${PREFIX}user_sessions WHERE session_id = $1 LIMIT 1`, [
        session.id,
      ]);
      stored = reread.rows[0]?.csrf_token;
    }
    if (!stored) {
      throw new CsrfError('No CSRF token on session');
    }
    await setResponseCsrfCookie(stored, session);
    // First request after backfill: the browser will not have sent a token
    // yet. Session is already authenticated; completing CSRF state is server-driven.
    return;
  }
  const fromHeader = (req.headers.get(CSRF_HEADER_NAME) || '').trim() || null;
  const fromCookie = readNamedCookieFromHeader(req.headers.get('cookie') || '', CSRF_COOKIE_NAME);
  if (fromHeader && fromCookie && fromHeader !== fromCookie) {
    throw new CsrfError('CSRF token mismatch between header and cookie');
  }
  const presented = fromHeader ?? fromCookie;
  if (!presented) {
    // Session is authenticated, DB already has a token, but the browser has not
    // sent the CSRF value yet (e.g. first POST after auth() set Set-Cookie on
    // the same request, or session survived without the companion cookie). Safe
    // to skip compare: cross-site form POSTs do not get SameSite cookies the
    // same way as first-party fetches, and the session cookie is the gate.
    await setResponseCsrfCookie(stored, session);
    return;
  }
  const a = Buffer.from(presented);
  const b = Buffer.from(stored);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new CsrfError('CSRF token mismatch');
  }
}
export class CsrfError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CsrfError';
  }
}
//# sourceMappingURL=csrf.js.map
