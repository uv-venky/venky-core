'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { FileText, ImageIcon, Paperclip, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import UserAvatar from '../../../components/core/common/user-avatar';
import { ReplyPreview } from '../../../components/core/comments/message-reference';
import { customAlphabet } from 'nanoid';
import { isEmpty } from '../../../lib/core/common/isEmpty';
const nanoid = customAlphabet('23456789abcdefghkmnpqrstuvwxyz', 10);
export function CommentInput({ context, contextId, currentUser, onSubmit, placeholder = 'Add a comment...', replyingTo, onCancelReply, enableAttachments, }) {
    const [content, setContent] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const handleSubmit = async () => {
        if (isEmpty(content))
            return;
        setIsSubmitting(true);
        try {
            const comment = {
                comment: content,
                parentComment: replyingTo?.comment,
                parentAuthor: replyingTo?.author,
                parentCreatedAt: replyingTo?.createdAt,
                parentUpdatedAt: replyingTo?.updatedAt,
                parentId: replyingTo?.id,
            };
            await onSubmit(comment, attachments);
            setContent('');
            setAttachments([]);
            if (onCancelReply)
                onCancelReply();
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSubmit();
        }
    };
    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0)
            return;
        const id = nanoid();
        const attachments = files.map((file) => ({
            id,
            name: file.name,
            type: file.type,
            size: file.size,
            key: `comment-attachments/${context}/${encodeURIComponent(contextId)}/${id}/${encodeURIComponent(file.name)}`,
            file,
        }));
        setAttachments((prev) => [...prev, ...attachments]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    const removeAttachment = (index) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };
    const formatFileSize = (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };
    const getFileIcon = (file) => {
        if (file.type.startsWith('image/')) {
            return _jsx(ImageIcon, { className: "h-4 w-4" });
        }
        return _jsx(FileText, { className: "h-4 w-4" });
    };
    const ref = useRef(null);
    useEffect(() => {
        if (ref.current && replyingTo) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
            textareaRef.current?.focus();
        }
    }, [replyingTo]);
    return (_jsxs("div", { className: "border-t bg-background p-4", ref: ref, children: [replyingTo && (_jsx("div", { className: "mb-3", children: _jsx(ReplyPreview, { comment: replyingTo, currentUser: currentUser, onCancelReply: onCancelReply }) })), _jsxs("div", { className: "flex gap-3", children: [_jsx(UserAvatar, { userName: currentUser, showDisplayName: false, showEmail: false }), _jsxs("div", { className: "flex-1", children: [attachments.length > 0 && (_jsx("div", { className: "mb-3 space-y-2", children: attachments.map((file, index) => (_jsxs("div", { className: "flex items-center gap-2 rounded-lg bg-muted p-2", children: [getFileIcon(file), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "truncate font-medium text-sm", children: file.name }), _jsx("p", { className: "text-muted-foreground text-xs", children: formatFileSize(file.size) })] }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => removeAttachment(index), children: _jsx(X, { className: "h-4 w-4" }) })] }, file.id))) })), _jsxs("div", { className: "relative", children: [_jsx(Textarea, { ref: textareaRef, value: content, onChange: (e) => setContent(e.target.value), onKeyDown: handleKeyDown, placeholder: placeholder, className: "min-h-[80px] resize-none whitespace-pre-wrap break-all pr-20", disabled: isSubmitting, "data-testid": "comment-textarea" }), _jsxs("div", { className: "absolute right-2 bottom-2 flex gap-1", children: [enableAttachments && (_jsxs(_Fragment, { children: [_jsx("input", { ref: fileInputRef, type: "file", multiple: true, className: "hidden", onChange: handleFileSelect, accept: "image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx", "data-testid": "comment-file-input" }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => fileInputRef.current?.click(), disabled: isSubmitting, "data-testid": "comment-attach-button", children: _jsx(Paperclip, { className: "h-4 w-4" }) })] })), _jsx(Button, { size: "sm", onClick: handleSubmit, disabled: isSubmitting || (!content.trim() && attachments.length === 0), "data-testid": "comment-send-button", children: _jsx(Send, { className: "h-4 w-4" }) })] })] }), _jsx("div", { className: "mt-2 text-muted-foreground text-xs", children: "Press Cmd+Enter to send" })] })] })] }));
}
//# sourceMappingURL=comment-input.js.map