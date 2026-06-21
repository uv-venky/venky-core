/* Copyright (c) 2024-present Venky Corp. */
import { withDBRoute } from '../../../../lib/core/server/withDBRoutes';
import { ulid } from 'ulidx';
import { PREFIX } from '../../../../lib/server/constants';
export const GET = withDBRoute(async function callback(client) {
    if (process.env.NODE_ENV !== 'development') {
        return Response.json({ status: 'ERROR', message: 'This route is only available in development mode' }, { status: 403 });
    }
    const baseTime = Date.now();
    const comments = Array.from({ length: 200 }, (_, index) => {
        // Increment timestamp by 1ms for each comment to ensure ULIDs are generated in order
        // This ensures lexicographic ordering matches creation order
        const timestamp = baseTime + index;
        const createdAt = new Date(timestamp).toISOString();
        return {
            id: ulid(timestamp),
            comment: `Comment ${index + 1}`,
            author: index % 3 === 0 ? 'admin' : 'admin2',
            createdAt,
            attachments: [],
            reactions: {},
        };
    });
    const params = [];
    let paramCounter = 0;
    const binds = [];
    for (const comment of comments) {
        const rowBinds = [];
        rowBinds.push(`$${++paramCounter}`);
        params.push(comment.id);
        rowBinds.push(`$${++paramCounter}`);
        params.push('page');
        rowBinds.push(`$${++paramCounter}`);
        params.push('/admin/config/apps');
        rowBinds.push(`$${++paramCounter}`);
        params.push(comment.comment);
        rowBinds.push(`$${++paramCounter}`);
        params.push(comment.author);
        rowBinds.push(`$${++paramCounter}::jsonb`);
        params.push(JSON.stringify(comment.attachments));
        rowBinds.push(`$${++paramCounter}::jsonb`);
        params.push(JSON.stringify(comment.reactions));
        rowBinds.push(`$${++paramCounter}::timestamptz`);
        params.push(comment.createdAt);
        rowBinds.push(`$${++paramCounter}`);
        params.push('core');
        binds.push(`(${rowBinds.join(', ')})`);
    }
    const sql = `INSERT INTO ${PREFIX}comments (id, context, context_id, comment, author, attachments, reactions, created_at, app_id) 
  VALUES ${binds.join(', ')}`;
    await client.query(sql, params);
    return Response.json({ status: 'OK', count: comments.length });
});
export const runtime = 'nodejs';
//# sourceMappingURL=route.js.map