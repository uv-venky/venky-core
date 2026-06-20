'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Attachment, Comment, CommentWithParent } from '@/types/comments';
import { formatDistanceToNow } from 'date-fns';
import { Download, Heart, Loader2, MoreHorizontal, Reply } from 'lucide-react';
import { useState } from 'react';
import UserAvatar from '@/components/core/common/user-avatar';
import { CustomEmojiPicker } from '@/components/core/comments/emoji-picker';
import { MessageReference } from '@/components/core/comments/message-reference';
import { cn } from '@/lib/utils';

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

export function CommentItem({
  comment,
  currentUser,
  onLike,
  onReply,
  onEdit,
  onReactionToggle,
  onReactionAdd,
  onNavigateToMessage,
  enableEmojiReactions = true,
  enableLike = true,
}: CommentItemProps) {
  const [_showReplies, _setShowReplies] = useState(false);
  const isLiked = comment.reactions[currentUser] === 'likes';
  const isOwnComment = comment.author === currentUser;
  const reactions: Record<string, string[]> = {};
  const [isReacting, setIsReacting] = useState(false);
  Object.entries(comment.reactions ?? {}).forEach(([userName, emoji]) => {
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }
    reactions[emoji].push(userName);
  });
  const totalLikes = reactions.likes?.length ?? 0;
  delete reactions.likes;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const renderAttachment = (attachment: Attachment) => {
    const url = `/api/s3-upload?key=${encodeURIComponent(attachment.key)}&filename=${encodeURIComponent(attachment.name ?? '')}`;
    if (attachment.type.startsWith('image')) {
      return (
        <div key={attachment.id}>
          {/** biome-ignore lint/performance/noImgElement: img is ok */}
          <img
            src={url}
            alt={attachment.name}
            className="max-w-xs cursor-pointer rounded-lg border hover:opacity-90"
            onClick={() => window.open(url, '_blank')}
          />
        </div>
      );
    }

    return (
      <div key={attachment.id} className="flex max-w-xs items-center gap-2 rounded-lg border bg-background/50 p-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-sm">{attachment.name}</p>
          <p className="text-muted-foreground text-xs">{formatFileSize(attachment.size)}</p>
        </div>
        <Button size="sm" variant="ghost" onClick={() => window.open(url, '_blank')}>
          <Download className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="group relative overflow-hidden" data-testid={`comment-item-${comment.id}`}>
      <div className={`flex gap-3 p-4 transition-colors hover:bg-muted/30 ${isOwnComment ? 'flex-row-reverse' : ''}`}>
        <UserAvatar userName={comment.author} showDisplayName={false} showEmail={false} />

        <div className={`min-w-0 max-w-[80%] flex-1 ${isOwnComment ? 'items-end' : ''}`}>
          <div className={`mb-1 flex items-center gap-2 ${isOwnComment ? 'flex-row-reverse' : ''}`}>
            <span className="font-medium text-sm">{isOwnComment ? 'You' : comment.author}</span>
            {comment.author && (
              <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
                {comment.author}
              </Badge>
            )}
            <span className="text-muted-foreground text-xs">
              {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
            </span>
            {comment.updatedAt && <span className="text-muted-foreground text-xs">(edited)</span>}
          </div>

          {comment.parentId && (
            <MessageReference comment={comment as CommentWithParent} onNavigateToMessage={onNavigateToMessage} />
          )}

          <div
            className={cn(
              'z-10 rounded-md px-4 py-3',
              isOwnComment ? 'ml-auto bg-blue-500 text-white' : 'bg-muted text-foreground',
              comment.parentId && 'rounded-t-none',
            )}
          >
            <div className="whitespace-pre-wrap break-all text-sm">{comment.comment}</div>

            {comment.attachments && comment.attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">{comment.attachments.map(renderAttachment)}</div>
            )}
          </div>

          <div className={`mt-2 flex flex-wrap items-center gap-1 ${isOwnComment ? 'flex-row-reverse' : ''}`}>
            {enableLike && (
              <Button
                size="sm"
                variant="ghost"
                className={`h-7 px-2 ${isLiked ? 'text-red-600 hover:text-red-700' : 'text-muted-foreground'}`}
                onClick={() => onLike(comment.id)}
                data-testid={`comment-like-${comment.id}`}
                data-tip={
                  totalLikes > 0
                    ? totalLikes === 1
                      ? isLiked
                        ? 'You liked. Click to unlike'
                        : '1 person liked. Click to like'
                      : totalLikes === 2 && isLiked
                        ? 'You and 1 other liked. Click to unlike'
                        : isLiked
                          ? `You and ${totalLikes - 1} others liked. Click to unlike`
                          : `${totalLikes} people liked. Click to like`
                    : 'Click to like'
                }
              >
                <Heart className={`mr-1 h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
                {totalLikes > 0 && <span className="text-xs">{totalLikes}</span>}
              </Button>
            )}

            {enableEmojiReactions && (
              <CustomEmojiPicker
                onEmojiSelect={async (emoji) => {
                  if (isReacting) return;
                  setIsReacting(true);
                  try {
                    await onReactionAdd?.(comment.id, emoji);
                  } finally {
                    setIsReacting(false);
                  }
                }}
                size="sm"
              />
            )}

            {/* Inline Reactions */}
            {enableEmojiReactions && reactions && Object.keys(reactions).length > 0 && (
              <>
                <div className="mx-1 h-4 w-px bg-border" />
                {isReacting && <Loader2 className="h-4 w-4 animate-spin" />}
                {Object.entries(reactions)
                  .sort((a, b) => a[0].localeCompare(b[0]))
                  .map(([emoji, users]) => {
                    const hasReacted = users.includes(currentUser);
                    return (
                      <Button
                        key={emoji}
                        size="sm"
                        variant={hasReacted ? 'secondary' : 'ghost'}
                        className={`h-7 gap-1 px-2 text-xs ${
                          hasReacted
                            ? 'border border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'hover:bg-muted'
                        }`}
                        disabled={isReacting}
                        onClick={async () => {
                          if (isReacting) return;
                          setIsReacting(true);
                          try {
                            await onReactionToggle?.(comment.id, emoji);
                          } finally {
                            setIsReacting(false);
                          }
                        }}
                        data-tip={
                          users.length === 1
                            ? users.includes(currentUser)
                              ? 'You reacted'
                              : '1 person reacted'
                            : users.length === 2 && users.includes(currentUser)
                              ? 'You and 1 other reacted'
                              : users.includes(currentUser)
                                ? `You and ${users.length - 1} others reacted`
                                : `${users.length} people reacted`
                        }
                      >
                        <span className="text-sm">{emoji}</span>
                        <span>{users.length}</span>
                      </Button>
                    );
                  })}
              </>
            )}

            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-muted-foreground"
              onClick={() => onReply(comment)}
              data-testid={`comment-reply-${comment.id}`}
            >
              <Reply className="mr-1 h-3 w-3" />
              Reply
            </Button>

            {isOwnComment && onEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                    data-testid={`comment-menu-${comment.id}`}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(comment.id)} data-testid={`comment-edit-${comment.id}`}>
                    Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
