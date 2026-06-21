import type { CommentWithParent, Comment } from '../../../types/comments';
interface MessageReferenceProps {
    comment: CommentWithParent;
    onNavigateToMessage?: (messageId: string) => void;
}
export declare function MessageReference({ comment, onNavigateToMessage }: MessageReferenceProps): import("react/jsx-runtime").JSX.Element;
interface ReplyPreviewProps {
    comment: Comment;
    currentUser: string;
    onCancelReply?: () => void;
}
export declare function ReplyPreview({ comment, currentUser, onCancelReply }: ReplyPreviewProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=message-reference.d.ts.map