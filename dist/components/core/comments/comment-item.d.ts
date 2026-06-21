import type { Comment } from '../../../types/comments';
interface CommentItemProps {
    comment: Comment;
    currentUser: string;
    isNew?: boolean;
    onLike: (commentId: string) => void;
    onReply: (parentComment: Comment) => void;
    onEdit?: (commentId: string) => void;
    onReactionToggle?: (commentId: string, emoji: string) => Promise<void>;
    onReactionAdd?: (commentId: string, emoji: string) => Promise<void>;
    onNavigateToMessage?: (messageId: string) => void;
    enableEmojiReactions?: boolean;
    enableLike?: boolean;
}
export declare function CommentItem({ comment, currentUser, onLike, onReply, onEdit, onReactionToggle, onReactionAdd, onNavigateToMessage, enableEmojiReactions, enableLike, }: CommentItemProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=comment-item.d.ts.map