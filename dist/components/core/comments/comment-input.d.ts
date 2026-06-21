import type { AttachmentWithFile, Comment, NewComment } from '../../../types/comments';
interface CommentInputProps {
    context: string;
    contextId: string;
    currentUser: string;
    onSubmit: (comment: NewComment, attachments: AttachmentWithFile[]) => Promise<void>;
    placeholder?: string;
    replyingTo?: Comment | null;
    onCancelReply?: () => void;
    enableAttachments: boolean;
}
export declare function CommentInput({ context, contextId, currentUser, onSubmit, placeholder, replyingTo, onCancelReply, enableAttachments, }: CommentInputProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=comment-input.d.ts.map