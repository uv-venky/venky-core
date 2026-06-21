'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '../../../components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { Download, Heart, Loader2, MoreHorizontal, Reply } from 'lucide-react';
import { useState } from 'react';
import UserAvatar from '../../../components/core/common/user-avatar';
import { CustomEmojiPicker } from '../../../components/core/comments/emoji-picker';
import { MessageReference } from '../../../components/core/comments/message-reference';
import { cn } from '../../../lib/utils';
export function CommentItem({ comment, currentUser, onLike, onReply, onEdit, onReactionToggle, onReactionAdd, onNavigateToMessage, enableEmojiReactions = true, enableLike = true, }) {
    const [_showReplies, _setShowReplies] = useState(false);
    const isLiked = comment.reactions[currentUser] === 'likes';
    const isOwnComment = comment.author === currentUser;
    const reactions = {};
    const [isReacting, setIsReacting] = useState(false);
    Object.entries(comment.reactions ?? {}).forEach(([userName, emoji]) => {
        if (!reactions[emoji]) {
            reactions[emoji] = [];
        }
        reactions[emoji].push(userName);
    });
    const totalLikes = reactions.likes?.length ?? 0;
    delete reactions.likes;
    const formatFileSize = (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };
    const renderAttachment = (attachment) => {
        const url = `/api/s3-upload?key=${encodeURIComponent(attachment.key)}&filename=${encodeURIComponent(attachment.name ?? '')}`;
        if (attachment.type.startsWith('image')) {
            return (_jsx("div", { children: _jsx("img", { src: url, alt: attachment.name, className: "max-w-xs cursor-pointer rounded-lg border hover:opacity-90", onClick: () => window.open(url, '_blank') }) }, attachment.id));
        }
        return (_jsxs("div", { className: "flex max-w-xs items-center gap-2 rounded-lg border bg-background/50 p-2", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "truncate font-medium text-sm", children: attachment.name }), _jsx("p", { className: "text-muted-foreground text-xs", children: formatFileSize(attachment.size) })] }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => window.open(url, '_blank'), children: _jsx(Download, { className: "h-4 w-4" }) })] }, attachment.id));
    };
    return (_jsx("div", { className: "group relative overflow-hidden", "data-testid": `comment-item-${comment.id}`, children: _jsxs("div", { className: `flex gap-3 p-4 transition-colors hover:bg-muted/30 ${isOwnComment ? 'flex-row-reverse' : ''}`, children: [_jsx(UserAvatar, { userName: comment.author, showDisplayName: false, showEmail: false }), _jsxs("div", { className: `min-w-0 max-w-[80%] flex-1 ${isOwnComment ? 'items-end' : ''}`, children: [_jsxs("div", { className: `mb-1 flex items-center gap-2 ${isOwnComment ? 'flex-row-reverse' : ''}`, children: [_jsx("span", { className: "font-medium text-sm", children: isOwnComment ? 'You' : comment.author }), comment.author && (_jsx(Badge, { variant: "secondary", className: "px-1.5 py-0.5 text-xs", children: comment.author })), _jsx("span", { className: "text-muted-foreground text-xs", children: formatDistanceToNow(comment.createdAt, { addSuffix: true }) }), comment.updatedAt && _jsx("span", { className: "text-muted-foreground text-xs", children: "(edited)" })] }), comment.parentId && (_jsx(MessageReference, { comment: comment, onNavigateToMessage: onNavigateToMessage })), _jsxs("div", { className: cn('z-10 rounded-md px-4 py-3', isOwnComment ? 'ml-auto bg-blue-500 text-white' : 'bg-muted text-foreground', comment.parentId && 'rounded-t-none'), children: [_jsx("div", { className: "whitespace-pre-wrap break-all text-sm", children: comment.comment }), comment.attachments && comment.attachments.length > 0 && (_jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: comment.attachments.map(renderAttachment) }))] }), _jsxs("div", { className: `mt-2 flex flex-wrap items-center gap-1 ${isOwnComment ? 'flex-row-reverse' : ''}`, children: [enableLike && (_jsxs(Button, { size: "sm", variant: "ghost", className: `h-7 px-2 ${isLiked ? 'text-red-600 hover:text-red-700' : 'text-muted-foreground'}`, onClick: () => onLike(comment.id), "data-testid": `comment-like-${comment.id}`, "data-tip": totalLikes > 0
                                        ? totalLikes === 1
                                            ? isLiked
                                                ? 'You liked. Click to unlike'
                                                : '1 person liked. Click to like'
                                            : totalLikes === 2 && isLiked
                                                ? 'You and 1 other liked. Click to unlike'
                                                : isLiked
                                                    ? `You and ${totalLikes - 1} others liked. Click to unlike`
                                                    : `${totalLikes} people liked. Click to like`
                                        : 'Click to like', children: [_jsx(Heart, { className: `mr-1 h-3 w-3 ${isLiked ? 'fill-current' : ''}` }), totalLikes > 0 && _jsx("span", { className: "text-xs", children: totalLikes })] })), enableEmojiReactions && (_jsx(CustomEmojiPicker, { onEmojiSelect: async (emoji) => {
                                        if (isReacting)
                                            return;
                                        setIsReacting(true);
                                        try {
                                            await onReactionAdd?.(comment.id, emoji);
                                        }
                                        finally {
                                            setIsReacting(false);
                                        }
                                    }, size: "sm" })), enableEmojiReactions && reactions && Object.keys(reactions).length > 0 && (_jsxs(_Fragment, { children: [_jsx("div", { className: "mx-1 h-4 w-px bg-border" }), isReacting && _jsx(Loader2, { className: "h-4 w-4 animate-spin" }), Object.entries(reactions)
                                            .sort((a, b) => a[0].localeCompare(b[0]))
                                            .map(([emoji, users]) => {
                                            const hasReacted = users.includes(currentUser);
                                            return (_jsxs(Button, { size: "sm", variant: hasReacted ? 'secondary' : 'ghost', className: `h-7 gap-1 px-2 text-xs ${hasReacted
                                                    ? 'border border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                                    : 'hover:bg-muted'}`, disabled: isReacting, onClick: async () => {
                                                    if (isReacting)
                                                        return;
                                                    setIsReacting(true);
                                                    try {
                                                        await onReactionToggle?.(comment.id, emoji);
                                                    }
                                                    finally {
                                                        setIsReacting(false);
                                                    }
                                                }, "data-tip": users.length === 1
                                                    ? users.includes(currentUser)
                                                        ? 'You reacted'
                                                        : '1 person reacted'
                                                    : users.length === 2 && users.includes(currentUser)
                                                        ? 'You and 1 other reacted'
                                                        : users.includes(currentUser)
                                                            ? `You and ${users.length - 1} others reacted`
                                                            : `${users.length} people reacted`, children: [_jsx("span", { className: "text-sm", children: emoji }), _jsx("span", { children: users.length })] }, emoji));
                                        })] })), _jsxs(Button, { size: "sm", variant: "ghost", className: "h-7 px-2 text-muted-foreground", onClick: () => onReply(comment), "data-testid": `comment-reply-${comment.id}`, children: [_jsx(Reply, { className: "mr-1 h-3 w-3" }), "Reply"] }), isOwnComment && onEdit && (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { size: "sm", variant: "ghost", className: "h-7 w-7 p-0 opacity-0 transition-opacity group-hover:opacity-100", "data-testid": `comment-menu-${comment.id}`, children: _jsx(MoreHorizontal, { className: "h-3 w-3" }) }) }), _jsx(DropdownMenuContent, { align: "end", children: _jsx(DropdownMenuItem, { onClick: () => onEdit(comment.id), "data-testid": `comment-edit-${comment.id}`, children: "Edit" }) })] }))] })] })] }) }));
}
//# sourceMappingURL=comment-item.js.map