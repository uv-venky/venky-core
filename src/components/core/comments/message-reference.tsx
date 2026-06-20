'use client';

import { Button } from '@/components/ui/button';
import type { CommentWithParent, Comment } from '@/types/comments';
import { ArrowUpRight, Reply, X } from 'lucide-react';
import UserAvatar from '@/components/core/common/user-avatar';

interface MessageReferenceProps {
  comment: CommentWithParent;
  onNavigateToMessage?: (messageId: string) => void;
}

export function MessageReference({ comment, onNavigateToMessage }: MessageReferenceProps) {
  const truncatedContent =
    comment.parentComment.length > 100 ? `${comment.parentComment.substring(0, 100)}...` : comment.parentComment;

  return (
    <div className="">
      <Button
        variant="ghost"
        size="sm"
        className="h-auto w-full justify-start rounded-b-none border border-l-2 border-l-blue-500 bg-muted/30 px-2 py-1 text-left hover:bg-muted/50"
        onClick={() => onNavigateToMessage?.(comment.parentId)}
      >
        <div className="flex w-full items-center gap-2">
          <Reply className="mt-1 h-3 w-3 flex-shrink-0 text-muted-foreground" />
          <UserAvatar userName={comment.parentAuthor} showDisplayName={false} showEmail={false} />
          <span className="line-clamp-2 flex-1 text-muted-foreground text-xs">{truncatedContent}</span>
          <ArrowUpRight className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
        </div>
      </Button>
    </div>
  );
}

interface ReplyPreviewProps {
  comment: Comment;
  currentUser: string;
  onCancelReply?: () => void;
}

export function ReplyPreview({ comment, currentUser, onCancelReply }: ReplyPreviewProps) {
  const isOwnMessage = comment.author === currentUser;
  const truncatedContent = comment.comment.length > 100 ? `${comment.comment.substring(0, 100)}...` : comment.comment;

  return (
    <div className="flex items-start gap-2 rounded-lg border-blue-500 border-l-2 bg-muted/50 p-3">
      <Reply className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="font-medium text-muted-foreground text-sm">
            Replying to {isOwnMessage ? 'yourself' : comment.author}
          </span>
          <Button variant="ghost" size="icon" onClick={onCancelReply}>
            <X />
          </Button>
        </div>
        <p className="text-muted-foreground text-sm italic">"{truncatedContent}"</p>
      </div>
    </div>
  );
}
