import { isAbortedRequestError } from '@/lib/core/common/error';
import { newClient, type PgPoolClient } from '@/lib/core/server/db';
import type { Session } from '@/auth';
import { auth } from '@/auth';
import logger from '@/lib/core/server/logger';
import { genTrackId } from '@/lib/server/gen_id';
import { getServer } from './getServer';
import { createErrorResponse } from '@/lib/core/server/error-response';
import { assertCsrf, CsrfError } from './csrf';

export const withDBSessionRoute = (
  callback: (
    client: PgPoolClient,
    session: Session,
    req: Request,
    routeContext: { params: Promise<any> },
  ) => Promise<Response>,
) => {
  return async (req: Request, routeContext: { params: Promise<any> }): Promise<Response> => {
    const session = await auth();
    if (!session) {
      return Response.json({ status: 'ERROR', message: 'Unauthorized' }, { status: 401 });
    }
    getServer('withDBSessionRoute').config.validateAccess({ session, headers: req.headers });
    return logger.runWithLogContext(
      {
        sessionId: session.id,
        userName: session.user.userName,
        trackId: req.headers.get('x-track-id') ?? (await genTrackId()),
        apiName: new URL(req.url).pathname,
      },
      async (): Promise<Response> => {
        const client = await newClient();
        try {
          await client.query('BEGIN');
          try {
            await assertCsrf(client, session, req);
          } catch (err) {
            if (err instanceof CsrfError) {
              await client.query('ROLLBACK');
              logger.warn('[CSRF] Rejecting request', {
                path: new URL(req.url).pathname,
                method: req.method,
                userName: session.user.userName,
                reason: err.message,
              });
              return Response.json({ status: 'ERROR', message: 'Invalid CSRF token' }, { status: 403 });
            }
            throw err;
          }
          const response = await callback(client, session, req, routeContext);
          await client.query('COMMIT');
          return response;
        } catch (error) {
          await client.query('ROLLBACK');
          if (isAbortedRequestError(error)) {
            // Return empty response for aborted requests - no logging needed
            return new Response(null, { status: 499 }); // 499 Client Closed Request
          }
          return Response.json(createErrorResponse(error, session), { status: 200 });
        } finally {
          client.release();
        }
      },
    );
  };
};

export const withSessionRoute = (callback: (session: Session, req: Request) => Promise<Response>) => {
  return async (req: Request): Promise<Response> => {
    const session = await auth();
    if (!session) {
      return Response.json({ status: 'ERROR', message: 'Unauthorized' }, { status: 401 });
    }
    return logger.runWithLogContext(
      {
        sessionId: session.id,
        userName: session.user.userName,
        trackId: req.headers.get('x-track-id') ?? (await genTrackId()),
        apiName: new URL(req.url).pathname,
      },
      async (): Promise<Response> => {
        try {
          const response = await callback(session, req);
          return response;
        } catch (error) {
          if (isAbortedRequestError(error)) {
            // Return empty response for aborted requests - no logging needed
            return new Response(null, { status: 499 }); // 499 Client Closed Request
          }
          return Response.json(createErrorResponse(error, session), { status: 200 });
        }
      },
    );
  };
};

export const withDBRoute = (callback: (client: PgPoolClient, req: Request) => Promise<Response>) => {
  return async (req: Request): Promise<Response> => {
    return logger.runWithLogContext(
      {
        sessionId: 'public',
        trackId: req.headers.get('x-track-id') ?? (await genTrackId()),
        apiName: new URL(req.url).pathname,
      },
      async (): Promise<Response> => {
        const client = await newClient();
        try {
          await client.query('BEGIN');
          const response = await callback(client, req);
          await client.query('COMMIT');
          return response;
        } catch (error) {
          await client.query('ROLLBACK');
          if (isAbortedRequestError(error)) {
            // Return empty response for aborted requests - no logging needed
            return new Response(null, { status: 499 }); // 499 Client Closed Request
          }
          return Response.json(createErrorResponse(error, null), { status: 200 });
        } finally {
          client.release();
        }
      },
    );
  };
};
