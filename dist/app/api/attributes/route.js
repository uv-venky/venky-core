import { isAbortedRequestError, UserError } from '../../../lib/core/common/error';
import { withSessionRoute } from '../../../lib/core/server/withDBRoutes';
import logger from '../../../lib/core/server/logger';
import { getDataSource } from '../../../lib/server/ds/defs/ds';
export const POST = withSessionRoute(async function callback(_session, req) {
    let body;
    try {
        body = (await req.json());
    }
    catch (error) {
        if (isAbortedRequestError(error)) {
            return new Response(null, { status: 499 }); // 499 Client Closed Request
        }
        logger.error('Failed to parse request body:', error);
        throw new UserError('Invalid request body');
    }
    const { ds: dsName } = body;
    const ds = getDataSource(dsName);
    if (!ds) {
        throw new UserError(`Data source ${dsName} not found!`);
    }
    const attributes = ds.attributes;
    return Response.json({ status: 'OK', attributes });
});
export const runtime = 'nodejs';
//# sourceMappingURL=route.js.map