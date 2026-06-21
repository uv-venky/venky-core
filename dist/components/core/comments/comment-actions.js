import { ulid } from 'ulidx';
import { PREFIX } from '../../../lib/server/constants';
import { getConfig } from '../../../lib/core/server/config';
import { publishSSE } from '../../../lib/sse/server';
import { authorizeCommentAccess } from './comment-authorizer';
import { UserError } from '../../../lib/core/common/error';
const LIMIT = 50;
async function requireCommentAccess(context, contextId, session) {
  const allowed = await authorizeCommentAccess(context, contextId, session);
  if (!allowed) {
    throw new UserError('Forbidden');
  }
}
export const getComments = async (client, session, context, contextId, cursor) => {
  await requireCommentAccess(context, contextId, session);
  const appId = getConfig('getComments').appId;
  const SQL_GET_COMMENTS_PREFIX = `select 
c.id, c.comment, c.author, c.created_at as "createdAt", c.updated_at as "updatedAt", 
c.attachments, c.reactions, c.parent_id as "parentId",
pc.comment as "parentComment", pc.author as "parentAuthor", 
pc.created_at as "parentCreatedAt",
pc.updated_at as "parentUpdatedAt"
from ${PREFIX}comments c
LEFT JOIN ${PREFIX}comments pc ON pc.id = c.parent_id AND pc.app_id = $3
WHERE c.context = $1 and c.context_id = $2 AND c.app_id = $3`;
  // Always order DESC (newest first) for consistent pagination
  // For initial load: get newest comments, reverse so oldest are first (newest at bottom)
  // For pagination: get older comments (c.id < cursor), reverse and prepend at top
  const where = cursor ? `AND c.id < $4` : '';
  const sql = `${SQL_GET_COMMENTS_PREFIX} ${where} ORDER BY c.id DESC LIMIT ${LIMIT + 1}`;
  const params = cursor ? [context, contextId, appId, cursor] : [context, contextId, appId];
  const data = await client.query(sql, params);
  const hasMore = data.rows.length > LIMIT;
  let comments = data.rows.slice(0, LIMIT);
  // Reverse so oldest are first in array (newest at bottom when displayed)
  comments = comments.reverse();
  const lastViewedAt = await getCommentView(client, session, context, contextId);
  // nextCursor should be the ID of the oldest comment in the current batch
  // This is comments[0] (oldest after reverse) which was data.rows[LIMIT-1] before reverse
  // We use this to fetch older comments in the next pagination request
  const nextCursor = hasMore && comments.length > 0 ? comments[0].id : null;
  return {
    comments,
    lastViewedAt,
    hasMore,
    nextCursor,
  };
};
export const createComment = async (client, session, context, contextId, comment) => {
  await requireCommentAccess(context, contextId, session);
  const appId = getConfig('createComment').appId;
  const id = ulid();
  const author = session.user.userName;
  const createdAt = new Date().toISOString();
  const sql = `INSERT INTO ${PREFIX}comments 
  (id, context, context_id, comment, author, parent_id, attachments, reactions, created_at, app_id) 
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
  const _comment = {
    ...comment,
    comment: comment.comment ?? '',
    id: comment.id ?? id,
    author,
    createdAt,
    attachments: comment.attachments ?? [],
    reactions: {},
  };
  await client.query(sql, [
    _comment.id,
    context,
    contextId,
    _comment.comment,
    _comment.author,
    _comment.parentId,
    JSON.stringify(_comment.attachments),
    JSON.stringify(_comment.reactions),
    _comment.createdAt,
    appId,
  ]);
  await setCommentView(client, session, context, contextId);
  // Publish SSE event for new comment
  await publishSSE(client, `comment:${context}:${contextId}`, {
    type: 'comment_created',
    comment: _comment,
  });
  return _comment;
};
export const reactToComment = async (client, session, commentId, reaction, context, contextId) => {
  await requireCommentAccess(context, contextId, session);
  const appId = getConfig('reactToComment').appId;
  const userName = session.user.userName;
  if (reaction == null) {
    const sql = `UPDATE ${PREFIX}comments SET reactions = reactions - $1 WHERE id = $2 AND app_id = $3`;
    await client.query(sql, [userName, commentId, appId]);
  } else {
    const sql = `UPDATE ${PREFIX}comments SET reactions[$1] = $2 WHERE id = $3 AND app_id = $4`;
    await client.query(sql, [userName, JSON.stringify(reaction), commentId, appId]);
  }
  // Fetch updated reactions to publish
  const fetchSql = `SELECT reactions FROM ${PREFIX}comments WHERE id = $1 AND app_id = $2`;
  const result = await client.query(fetchSql, [commentId, appId]);
  const updatedReactions = result.rows[0]?.reactions ?? {};
  // Publish SSE event for reaction update
  await publishSSE(client, `comment:${context}:${contextId}`, {
    type: 'reaction_updated',
    commentId,
    reactions: updatedReactions,
  });
};
export const getCommentStats = async (client, session, context, contextId) => {
  await requireCommentAccess(context, contextId, session);
  const appId = getConfig('getCommentStats').appId;
  const sql = `SELECT COUNT(1) as "totalComments", ARRAY_AGG(DISTINCT author) AS authors
  FROM ${PREFIX}comments
  WHERE context = $1 AND context_id = $2 AND app_id = $3`;
  const data = await client.query(sql, [context, contextId, appId]);
  return data.rows[0] ?? { totalComments: 0, authors: [] };
};
export const getCommentView = async (client, session, context, contextId) => {
  await requireCommentAccess(context, contextId, session);
  const appId = getConfig('getCommentView').appId;
  const sql = `SELECT viewed_at as "viewedAt" FROM ${PREFIX}comment_views WHERE context = $1 AND context_id = $2 AND viewer = $3 AND app_id = $4`;
  const data = await client.query(sql, [context, contextId, session.user.userName, appId]);
  return data.rows[0]?.viewedAt?.toISOString();
};
export const setCommentView = async (client, session, context, contextId) => {
  await requireCommentAccess(context, contextId, session);
  const appId = getConfig('setCommentView').appId;
  const viewedAt = new Date().toISOString();
  const sql = `INSERT INTO ${PREFIX}comment_views (context, context_id, viewer, viewed_at, app_id) VALUES ($1, $2, $3, $4, $5)
  ON CONFLICT (context_id, context, viewer) DO UPDATE SET viewed_at = $4`;
  await client.query(sql, [context, contextId, session.user.userName, viewedAt, appId]);
  // Publish SSE event for view update
  await publishSSE(client, `comment:${context}:${contextId}`, {
    type: 'view_updated',
    viewer: session.user.userName,
    viewedAt,
  });
};
export const genID = async (_client, _session) => {
  return ulid();
};
//# sourceMappingURL=comment-actions.js.map
