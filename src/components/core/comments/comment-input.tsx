'use client';

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { AttachmentWithFile, Comment, NewComment } from '@/types/comments';
import { FileText, ImageIcon, Paperclip, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import UserAvatar from '@/components/core/common/user-avatar';
import { ReplyPreview } from '@/components/core/comments/message-reference';
import { customAlphabet } from 'nanoid';
import { isEmpty } from '@/lib/core/common/isEmpty';

const nanoid = customAlphabet('23456789abcdefghkmnpqrstuvwxyz', 10);

interface CommentInputProps {
  context: string;
  contextId: string;
  currentUser: string;
  onSubmit: (comment: NewComment, attachments: AttachmentWithFile[]) => Promise<void>;
  placeholder?: string;
  replyingTo?: Comment | null; // Change from string to Comment object
  onCancelReply?: () => void;
  enableAttachments: boolean;
}

export function CommentInput({
  context,
  contextId,
  currentUser,
  onSubmit,
  placeholder = 'Add a comment...',
  replyingTo,
  onCancelReply,
  enableAttachments,
}: CommentInputProps) {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<AttachmentWithFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (isEmpty(content)) return;

    setIsSubmitting(true);
    try {
      const comment: NewComment = {
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
      if (onCancelReply) onCancelReply();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const id = nanoid();
    const attachments: AttachmentWithFile[] = files.map((file) => ({
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

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getFileIcon = (file: AttachmentWithFile) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current && replyingTo) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      textareaRef.current?.focus();
    }
  }, [replyingTo]);

  return (
    <div className="border-t bg-background p-4" ref={ref}>
      {replyingTo && (
        <div className="mb-3">
          <ReplyPreview comment={replyingTo} currentUser={currentUser} onCancelReply={onCancelReply} />
        </div>
      )}

      <div className="flex gap-3">
        <UserAvatar userName={currentUser} showDisplayName={false} showEmail={false} />

        <div className="flex-1">
          {attachments.length > 0 && (
            <div className="mb-3 space-y-2">
              {attachments.map((file, index) => (
                <div key={file.id} className="flex items-center gap-2 rounded-lg bg-muted p-2">
                  {getFileIcon(file)}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sm">{file.name}</p>
                    <p className="text-muted-foreground text-xs">{formatFileSize(file.size)}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => removeAttachment(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-h-[80px] resize-none whitespace-pre-wrap break-all pr-20"
              disabled={isSubmitting}
              data-testid="comment-textarea"
            />

            <div className="absolute right-2 bottom-2 flex gap-1">
              {enableAttachments && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx"
                    data-testid="comment-file-input"
                  />

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                    data-testid="comment-attach-button"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </>
              )}

              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isSubmitting || (!content.trim() && attachments.length === 0)}
                data-testid="comment-send-button"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-2 text-muted-foreground text-xs">Press Cmd+Enter to send</div>
        </div>
      </div>
    </div>
  );
}
