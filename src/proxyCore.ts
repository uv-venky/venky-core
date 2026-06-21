/* Copyright (c) 2024-present Venky Corp. */
'use server';

import { auth } from '@/auth';
// biome-ignore lint/style/noRestrictedImports: NextResponse.next() is required for middleware, not an API route
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRateLimiters, type RateLimiter } from '@/lib/core/server/ratelimit';
import { getContentSecurityPolicy } from '@/lib/core/server/secure-headers';
import { logActivity } from '@/lib/core/server/activity';
import logger from '@/lib/core/server/logger';
import { genTrackId } from '@/lib/server/gen_id';
import { getValidIpAddress } from './lib/core/server/utils';
import { checkPageAccess } from '@/lib/core/server/sidebar';
import { getErrorMessage } from './lib/utils';

// Pathname prefixes that don't require authentication (checked before session)
const UNAUTHENTICATED_STATIC_PREFIXES = [
  '/api/auth/sso',
  '/api/mobile/auth',
  '/api/auth/magic-link',
  '/api/ping',
  '/p/',
  '/api/p/',
  '/login',
  '/legal',
] as const;

// Next.js static asset prefixes (checked after session, rate-limited only if unauthenticated)
const NEXT_STATIC_PREFIXES = ['/_next/image'] as const;

interface StaticRequestOptions {
  pathname: string;
  requestUrl: string;
  validIp: string;
  nonce: string;
  unauthenticatedStaticRateLimiter?: RateLimiter;
  pathnamePrefixes: readonly string[];
  cspPolicy?: (nonce: string) => string;
}

/**
 * Handles static/public requests that don't require authentication.
 * Returns a response if the pathname matches any of the provided prefixes, null otherwise.
 */
function handleStaticRequest({
  pathname,
  requestUrl,
  validIp,
  nonce,
  unauthenticatedStaticRateLimiter,
  pathnamePrefixes,
  cspPolicy = getContentSecurityPolicy,
}: StaticRequestOptions): NextResponse | Response | null {
  // Check if pathname matches any prefix (early return for performance)
  const matchesPrefix = pathnamePrefixes.some((prefix) => pathname.startsWith(prefix));
  if (!matchesPrefix) {
    return null;
  }

  // Apply rate limiting if provided and request is unauthenticated
  if (unauthenticatedStaticRateLimiter?.isRateLimited(validIp)) {
    return unauthenticatedStaticRateLimiter.rejectRateLimitedRequest(validIp, requestUrl);
  }

  return NextResponse.next({
    headers: {
      'x-pathname': pathname,
      'Content-Security-Policy': cspPolicy(nonce),
      'x-nonce': nonce,
    },
  });
}

// Allow only the static asset extensions we intentionally serve for direct file requests.
const ALLOWED_STATIC_EXTENSIONS = /\.(js|css|woff2?|ttf|otf|png|jpg|jpeg|webp|svg|ico|txt|map)$/i;

function isExtensionBearingPath(pathname: string): boolean {
  const lastSegment = pathname.split('/').pop() ?? '';
  return /\.[^./]+$/.test(lastSegment);
}

function isAllowedStaticAssetPath(pathname: string): boolean {
  if (!ALLOWED_STATIC_EXTENSIONS.test(pathname)) {
    return false;
  }

  if (pathname.startsWith('/_next/static/')) {
    return true;
  }

  // Next.js serves public/ assets from the root URL space, not under a /public prefix.
  return !pathname.startsWith('/api/');
}

export interface ProxyCoreOptions {
  /** Allowed hostnames (e.g. ['work.venky.local', 'feedback.venky.local']). Requests with other Host headers are rejected. */
  allowedHosts?: string[];
}

let resolvedAllowedHosts: Set<string> | null = null;

function getAllowedHosts(options?: ProxyCoreOptions): Set<string> {
  if (!resolvedAllowedHosts || (options?.allowedHosts && resolvedAllowedHosts.size === 0)) {
    resolvedAllowedHosts = new Set(options?.allowedHosts);
    // Also include APP_URL as a fallback
    const appUrl = process.env.APP_URL;
    if (appUrl) {
      try {
        resolvedAllowedHosts.add(new URL(appUrl).host);
      } catch (error) {
        logger.error('Invalid APP_URL', { appUrl, error: getErrorMessage(error) });
      }
    }
  }
  return resolvedAllowedHosts;
}

export async function proxyCore(req: NextRequest, options?: ProxyCoreOptions) {
  const pathname = req.nextUrl.pathname;
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';

  if (process.env.NODE_ENV === 'production' && pathname !== '/api/ping') {
    // Block requests with unrecognized Host headers (bot scanners hitting random hostnames)
    const allowedHosts = getAllowedHosts(options);
    if (allowedHosts.size > 0 && !allowedHosts.has(host)) {
      return new Response(null, { status: 404 });
    }
  }

  // Allow extensionless pages/routes, but reject direct file requests outside approved static asset surfaces.
  if (isExtensionBearingPath(pathname) && pathname !== '/robots.txt' && !isAllowedStaticAssetPath(pathname)) {
    return new Response(null, { status: 404 });
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const requestUrl = `${proto}://${host}${pathname}${req.nextUrl.search}`;

  if (pathname.startsWith('/_next/static')) {
    return NextResponse.next({
      headers: {
        'x-pathname': pathname,
        'Content-Security-Policy': getContentSecurityPolicy(nonce),
        'x-nonce': nonce,
      },
    });
  }

  const { rateLimiter, unauthenticatedPageAPIRateLimiter, unauthenticatedStaticRateLimiter } = getRateLimiters('proxy');

  const validIp = getValidIpAddress(req.headers);

  // Handle unauthenticated static routes (auth endpoints, public pages, etc.)
  // These are checked before session to avoid unnecessary auth calls
  const unauthenticatedStaticResponse = handleStaticRequest({
    pathname,
    requestUrl,
    validIp,
    nonce,
    unauthenticatedStaticRateLimiter,
    pathnamePrefixes: UNAUTHENTICATED_STATIC_PREFIXES,
  });
  if (unauthenticatedStaticResponse) {
    return unauthenticatedStaticResponse;
  }

  // Get session - only needed for routes that require authentication
  const session = await auth(true);

  // Handle Next.js static assets (rate-limited only if unauthenticated)
  const nextStaticResponse = handleStaticRequest({
    pathname,
    requestUrl,
    validIp,
    nonce,
    unauthenticatedStaticRateLimiter: session ? undefined : unauthenticatedStaticRateLimiter,
    pathnamePrefixes: NEXT_STATIC_PREFIXES,
  });
  if (nextStaticResponse) {
    return nextStaticResponse;
  }

  return logger.runWithLogContext(
    {
      trackId: req.headers.get('x-track-id') ?? (await genTrackId()),
      userName: session?.user.userName,
      sessionId: session?.id,
      apiName: pathname,
    },
    async () => {
      if (!session) {
        if (unauthenticatedPageAPIRateLimiter.isRateLimited(validIp)) {
          return unauthenticatedPageAPIRateLimiter.rejectRateLimitedRequest(validIp, requestUrl);
        }

        if (pathname.startsWith('/api')) {
          logger.warn('Unauthorized API request', { pathname, validIp });
          return Response.json({ status: 'ERROR', message: 'Unauthorized' }, { status: 401 });
        }
        if (pathname !== '/') {
          logger.warn('Unauthorized page request', { pathname, validIp });
        }
        const newUrl = new URL('/login', req.nextUrl.origin);
        const searchParams = req.nextUrl.search;
        const sourceUrl = `${pathname}${searchParams}`;
        newUrl.searchParams.set('sourceUrl', sourceUrl);
        return Response.redirect(newUrl);
      }
      const userName = session.user.userName;

      // Check if user needs to change password (only for non-SSO users)
      if (
        session.user.forcePasswordChange &&
        !pathname.startsWith('/force-password-change') &&
        !pathname.startsWith('/no-access') &&
        !pathname.startsWith('/api/')
      ) {
        const newUrl = new URL('/force-password-change', req.nextUrl.origin);
        const searchParams = req.nextUrl.search;
        const sourceUrl = `${pathname}${searchParams}`;
        newUrl.searchParams.set('sourceUrl', sourceUrl);
        return Response.redirect(newUrl);
      }

      // Apply rate limiting to API routes
      if (rateLimiter.isRateLimited(userName)) {
        return rateLimiter.rejectRateLimitedRequest(userName, requestUrl);
      }

      if (!pathname.startsWith('/api')) {
        try {
          await logActivity({
            userName,
            eventType: 'Page View',
            eventId: pathname.split('/').pop() ?? 'unknown',
            metadata: {
              ipAddress: validIp,
              userAgent: req.headers.get('user-agent') ?? undefined,
            },
            sessionId: session.id,
            pageUrl: pathname,
            createdAt: new Date().toISOString(),
          });
        } catch (error) {
          logger.error('Failed to log user activity', error);
        }
        // Check page access based on user's teams/navigation (only for page routes, not API)
        const hasAccess = await checkPageAccess(session, pathname);
        if (!hasAccess) {
          const newUrl = new URL('/access-denied', req.nextUrl.origin);
          newUrl.searchParams.set('path', pathname);
          return Response.redirect(newUrl);
        }
      }

      return NextResponse.next({
        headers: {
          'x-pathname': pathname,
          'Content-Security-Policy': getContentSecurityPolicy(nonce),
          'x-nonce': nonce,
        },
      });
    },
  );
}
