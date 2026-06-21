/* Copyright (c) 2024-present Venky Corp. */
import { withDBSessionRoute } from '../../../../../lib/core/server/withDBRoutes';
import { PREFIX } from '../../../../../lib/server/constants';
import { UserError } from '../../../../../lib/core/common/error';
export const GET = withDBSessionRoute(async function callback(client, _session, _req, { params }) {
    const { appId } = await params;
    if (!appId) {
        throw new UserError('App ID is required');
    }
    // Look up the app in the database
    const appResult = await client.query(`SELECT app_id, name, full_url, status_token FROM ${PREFIX}apps WHERE app_id = $1`, [appId]);
    if (appResult.rows.length === 0) {
        throw new UserError('App not found');
    }
    const app = appResult.rows[0];
    const { full_url: fullUrl, status_token: statusToken } = app;
    if (!fullUrl || !statusToken) {
        throw new UserError('Status token or URL not configured');
    }
    // Make the request to the external app's status endpoint
    const statusUrl = new URL('/api/p/status', fullUrl);
    const response = await fetch(statusUrl.toString(), {
        headers: {
            Authorization: `Bearer ${statusToken}`,
        },
    });
    if (!response) {
        throw new UserError('Failed to fetch status: response is undefined');
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch status' }));
        throw new UserError(errorData.message || `Failed to fetch status: ${response.statusText}`);
    }
    const data = await response.json();
    return Response.json(data);
});
export const runtime = 'nodejs';
//# sourceMappingURL=route.js.map