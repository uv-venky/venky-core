export interface Attachment {
  id: string;
  name: string;
  key: string;
  type: string;
  size: number;
}
export interface AttachmentWithFile extends Attachment {
  file: File;
}
export interface Comment {
  id: string;
  comment: string;
  author: string;
  createdAt: string;
  updatedAt?: string;
  attachments: Attachment[];
  reactions: Record<string, string>;
  parentId?: string;
  parentComment?: string;
  parentAuthor?: string;
  parentCreatedAt?: string;
  parentUpdatedAt?: string;
}
export type NewComment = Partial<Comment>;
export interface CommentWithParent extends Comment {
  parentId: string;
  parentComment: string;
  parentAuthor: string;
  parentCreatedAt: string;
  parentUpdatedAt?: string;
}
export interface CommentsProps {
  context: string;
  contextId: string;
  title?: string;
  enableEmojiReactions?: boolean;
  enableLike?: boolean;
  enableAttachments?: boolean;
  className?: string;
}
//# sourceMappingURL=comments.d.ts.map
