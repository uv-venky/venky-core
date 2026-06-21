import { getErrorMessage } from '../../../lib/core/common/error';
import { newClient } from '../../../lib/core/server/db';
import { auth } from '../../../auth';
import { getRequestContext } from './request-context';
import { getServer } from './getServer';
export const withDB = (callback) => {
    return async function POST(request) {
        const client = await newClient();
        try {
            const response = await callback(client, request);
            if (response.body instanceof ReadableStream) {
                const { readable, writable } = new TransformStream();
                const stream = response.body;
                stream.pipeTo(writable).finally(async () => {
                    await closeClient(client);
                });
                const newResponse = new Response(readable);
                response.headers.forEach((value, key) => {
                    newResponse.headers.set(key, value);
                });
                return newResponse;
            }
            else {
                await closeClient(client);
                return response;
            }
        }
        catch (error) {
            await closeClient(client);
            return Response.json({ status: 'ERROR', message: getErrorMessage(error) }, { status: 500 });
        }
    };
};
export const withDBSessionAction = (callback) => {
    return async function action(...args) {
        const session = await auth();
        if (!session) {
            return { status: 'ERROR', message: 'Unauthorized' };
        }
        const ctx = getRequestContext('withDBSessionAction');
        const h = await ctx.getHeaders();
        getServer('withDBSessionAction').config.validateAccess({ session, headers: h });
        const client = await newClient();
        await client.query('BEGIN');
        try {
            const response = await callback(client, session, ...args);
            await client.query('COMMIT');
            return response;
        }
        catch (error) {
            await client.query('ROLLBACK');
            return { status: 'ERROR', message: getErrorMessage(error) };
        }
        finally {
            await closeClient(client);
        }
    };
};
export const withSessionAction = (callback) => {
    return async function action(...args) {
        const session = await auth();
        if (!session) {
            return { status: 'ERROR', message: 'Unauthorized' };
        }
        try {
            const response = await callback(session, ...args);
            return response;
        }
        catch (error) {
            return { status: 'ERROR', message: getErrorMessage(error) };
        }
    };
};
export const withDBAction = (callback) => {
    return async function action(...args) {
        const client = await newClient();
        await client.query('BEGIN');
        try {
            const response = await callback(client, ...args);
            await client.query('COMMIT');
            return response;
        }
        catch (error) {
            await client.query('ROLLBACK');
            return { status: 'ERROR', message: getErrorMessage(error) };
        }
        finally {
            await closeClient(client);
        }
    };
};
async function closeClient(client) {
    try {
        await client.query('ROLLBACK');
    }
    catch (error) {
        console.error('Error rolling back transaction', error);
    }
    finally {
        client.release();
    }
}
//# sourceMappingURL=withDBActions.js.map