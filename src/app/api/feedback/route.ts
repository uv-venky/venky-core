/* Copyright (c) 2024-present Venky Corp. */

import { getConfig } from '@/lib/core/server/config';
import logger from '@/lib/core/server/logger';
import { withSessionRoute } from '@/lib/core/server/withDBRoutes';
import { getNodeRunId } from '@/lib/server/constants';

const FEEDBACK_INGEST_URL = 'https://feedback.venky.local/api/p/feedback/ingest';

/** Prevent the route handler from hanging indefinitely when the ingest service is unreachable */
const UPSTREAM_TIMEOUT_MS = 120_000;

/**
 * Proxy route for feedback submission.
 *
 * Receives feedback FormData from the client-side FeedbackProvider,
 * adds server-side metadata (API key, appId, NODE_RUN_ID, userName),
 * and forwards everything to the Venky feedback service.
 *
 * Secured via withSessionRoute — only authenticated users can submit.
 * The API key is stored in VENKY_FEEDBACK_API_KEY and never exposed to the browser.
 */
export const POST = withSessionRoute(async (session, request) => {
  try {
    const apiKey = process.env.VENKY_FEEDBACK_API_KEY;
    if (!apiKey) {
      logger.error('VENKY_FEEDBACK_API_KEY is not configured');
      return Response.json({ status: 'ERROR', message: 'Feedback service is not configured' }, { status: 503 });
    }

    const config = getConfig('feedback-proxy');
    const appId = config.appId;
    const nodeRunId = getNodeRunId();
    const userName = session.user.userName;

    // Read the incoming FormData from the client
    const incomingFormData = await request.formData();

    // Build a new FormData to forward, adding server-side metadata
    const outgoingFormData = new FormData();

    // Reserved keys set by the server — strip from client submission to prevent spoofing
    const RESERVED_KEYS = new Set(['appId', 'nodeRunId', 'userName']);

    // Copy client fields, skipping reserved keys
    for (const [key, value] of incomingFormData.entries()) {
      if (!RESERVED_KEYS.has(key)) {
        outgoingFormData.append(key, value);
      }
    }

    // Add trusted server-side metadata
    outgoingFormData.append('appId', appId);
    outgoingFormData.append('nodeRunId', nodeRunId);
    outgoingFormData.append('userName', userName);

    // Forward to the Venky feedback service
    let response: Response;
    try {
      response = await fetch(FEEDBACK_INGEST_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: outgoingFormData,
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      });
    } catch (error) {
      const name = error instanceof Error ? error.name : '';
      if (name === 'AbortError' || name === 'TimeoutError') {
        logger.error('Feedback upstream request timed out', { url: FEEDBACK_INGEST_URL });
        return Response.json(
          { status: 'ERROR', message: 'Feedback service did not respond in time. Please try again.' },
          { status: 504 },
        );
      }
      throw error;
    }

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Feedback submission failed', { status: response.status, error: errorText });
      return Response.json({ status: 'ERROR', message: 'Failed to submit feedback' }, { status: response.status });
    }

    const result = await response.json();
    return Response.json(result);
  } catch (error) {
    logger.error('Feedback proxy error', { error });
    return Response.json({ status: 'ERROR', message: 'Failed to submit feedback' }, { status: 500 });
  }
});

export const runtime = 'nodejs';
