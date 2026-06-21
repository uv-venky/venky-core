'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '../../../components/ui/button';
import { ArrowUpRight, Reply, X } from 'lucide-react';
import UserAvatar from '../../../components/core/common/user-avatar';
export function MessageReference({ comment, onNavigateToMessage }) {
    const truncatedContent = comment.parentComment.length > 100 ? `${comment.parentComment.substring(0, 100)}...` : comment.parentComment;
    return (_jsx("div", { className: "", children: _jsx(Button, { variant: "ghost", size: "sm", className: "h-auto w-full justify-start rounded-b-none border border-l-2 border-l-blue-500 bg-muted/30 px-2 py-1 text-left hover:bg-muted/50", onClick: () => onNavigateToMessage?.(comment.parentId), children: _jsxs("div", { className: "flex w-full items-center gap-2", children: [_jsx(Reply, { className: "mt-1 h-3 w-3 flex-shrink-0 text-muted-foreground" }), _jsx(UserAvatar, { userName: comment.parentAuthor, showDisplayName: false, showEmail: false }), _jsx("span", { className: "line-clamp-2 flex-1 text-muted-foreground text-xs", children: truncatedContent }), _jsx(ArrowUpRight, { className: "h-3 w-3 flex-shrink-0 text-muted-foreground" })] }) }) }));
}
export function ReplyPreview({ comment, currentUser, onCancelReply }) {
    const isOwnMessage = comment.author === currentUser;
    const truncatedContent = comment.comment.length > 100 ? `${comment.comment.substring(0, 100)}...` : comment.comment;
    return (_jsxs("div", { className: "flex items-start gap-2 rounded-lg border-blue-500 border-l-2 bg-muted/50 p-3", children: [_jsx(Reply, { className: "mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "mb-1 flex items-center justify-between gap-2", children: [_jsxs("span", { className: "font-medium text-muted-foreground text-sm", children: ["Replying to ", isOwnMessage ? 'yourself' : comment.author] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: onCancelReply, children: _jsx(X, {}) })] }), _jsxs("p", { className: "text-muted-foreground text-sm italic", children: ["\"", truncatedContent, "\""] })] })] }));
}
//# sourceMappingURL=message-reference.js.map