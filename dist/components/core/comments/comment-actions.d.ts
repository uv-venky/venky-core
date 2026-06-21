import type { PgPoolClient } from '../../../lib/core/server/db';
import type { Session } from '../../../auth';
import type { Comment, CommentWithParent, NewComment } from '../../../types/comments';
export declare const getComments: (client: PgPoolClient, session: Session, context: string, contextId: string, cursor: string | null) => Promise<{
    comments: CommentWithParent[];
    hasMore: boolean;
    nextCursor: string | null;
    lastViewedAt?: string;
}>;
export declare const createComment: (client: PgPoolClient, session: Session, context: string, contextId: string, comment: NewComment) => Promise<Comment>;
export declare const reactToComment: (client: PgPoolClient, session: Session, commentId: string, reaction: string | null, context: string, contextId: string) => Promise<void>;
export declare const getCommentStats: (client: PgPoolClient, session: Session, context: string, contextId: string) => Promise<{
    totalComments: number;
    authors: string[];
}>;
export declare const getCommentView: (client: PgPoolClient, session: Session, context: string, contextId: string) => Promise<string | undefined>;
export declare const setCommentView: (client: PgPoolClient, session: Session, context: string, contextId: string) => Promise<void>;
export declare const genID: (_client: PgPoolClient, _session: Session) => Promise<string>;
//# sourceMappingURL=comment-actions.d.ts.map