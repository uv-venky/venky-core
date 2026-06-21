export declare const COMMENTS_ACTIONS: {
    createComment: (client: import("../../core/server/db").PgPoolClient, session: import("../../../auth").Session, context: string, contextId: string, comment: import("../../../types/comments").NewComment) => Promise<import("../../../types/comments").Comment>;
    genID: (_client: import("../../core/server/db").PgPoolClient, _session: import("../../../auth").Session) => Promise<string>;
    getCommentStats: (client: import("../../core/server/db").PgPoolClient, session: import("../../../auth").Session, context: string, contextId: string) => Promise<{
        totalComments: number;
        authors: string[];
    }>;
    getCommentView: (client: import("../../core/server/db").PgPoolClient, session: import("../../../auth").Session, context: string, contextId: string) => Promise<string | undefined>;
    getComments: (client: import("../../core/server/db").PgPoolClient, session: import("../../../auth").Session, context: string, contextId: string, cursor: string | null) => Promise<{
        comments: import("../../../types/comments").CommentWithParent[];
        hasMore: boolean;
        nextCursor: string | null;
        lastViewedAt?: string;
    }>;
    reactToComment: (client: import("../../core/server/db").PgPoolClient, session: import("../../../auth").Session, commentId: string, reaction: string | null, context: string, contextId: string) => Promise<void>;
    setCommentView: (client: import("../../core/server/db").PgPoolClient, session: import("../../../auth").Session, context: string, contextId: string) => Promise<void>;
};
export type CommentsActionName = keyof typeof COMMENTS_ACTIONS;
export declare const COMMENTS_ACTION_ACCESS_ROLES: Record<CommentsActionName, string[]>;
//# sourceMappingURL=comments.d.ts.map