/* Copyright (c) 2024-present Venky Corp. */
import { isAbortedRequestError } from '@/lib/core/common/error';
import { newReadOnlyClient, type PgPoolReadOnlyClient } from '@/lib/core/server/db';
import type { Session } from '@/auth';
import { auth } from '@/auth';
import logger from '@/lib/core/server/logger';
import { genTrackId } from '@/lib/server/gen_id';
import { getServer } from './getServer';
import { createErrorResponse } from '@/lib/core/server/error-response';

/**
 * Route handler wrapper that provides a readonly DB client.
 * No BEGIN/COMMIT — autocommit is sufficient; the readonly pool sets
 * default_transaction_read_only at the session level.
 */
export const withReadOnlyDBSessionRoute = (
  callback: (
    client: PgPoolReadOnlyClient,
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
    getServer('withReadOnlyDBSessionRoute').config.validateAccess({ session, headers: req.headers });
    return logger.runWithLogContext(
      {
        sessionId: session.id,
        userName: session.user.userName,
        trackId: req.headers.get('x-track-id') ?? (await genTrackId()),
        apiName: new URL(req.url).pathname,
      },
      async (): Promise<Response> => {
        const client = await newReadOnlyClient();
        try {
          return await callback(client, session, req, routeContext);
        } catch (error) {
          if (isAbortedRequestError(error)) {
            return new Response(null, { status: 499 });
          }
          return Response.json(createErrorResponse(error, session), { status: 200 });
        } finally {
          client.release();
        }
      },
    );
  };
};

export const withReadOnlyDBRoute = (callback: (client: PgPoolReadOnlyClient, req: Request) => Promise<Response>) => {
  return async (req: Request): Promise<Response> => {
    return logger.runWithLogContext(
      {
        sessionId: 'public',
        trackId: req.headers.get('x-track-id') ?? (await genTrackId()),
        apiName: new URL(req.url).pathname,
      },
      async (): Promise<Response> => {
        const client = await newReadOnlyClient();
        try {
          return await callback(client, req);
        } catch (error) {
          if (isAbortedRequestError(error)) {
            return new Response(null, { status: 499 });
          }
          return Response.json(createErrorResponse(error, null), { status: 200 });
        } finally {
          client.release();
        }
      },
    );
  };
};
