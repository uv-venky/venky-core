import type { Comment, NewComment } from '../types/comments';
export declare function useComments(
  context: string,
  contextId: string,
): {
  comments: Comment[];
  lastViewedAt: string | undefined;
  createComment: (comment: NewComment) => Promise<Comment>;
  fetchComments: () => Promise<void>;
  hasMore: boolean;
  loading: boolean;
  reactToComment: (commentId: string, emoji: string | null) => Promise<void>;
  toggleReaction: (commentId: string, emoji: string) => Promise<void>;
  setCommentView: () => Promise<void>;
};
//# sourceMappingURL=use-comments.d.ts.map
