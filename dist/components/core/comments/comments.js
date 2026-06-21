'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Users } from 'lucide-react';
import { List } from 'react-window';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { CommentItem } from '../../../components/core/comments/comment-item';
import { CommentInput } from '../../../components/core/comments/comment-input';
import { useComments } from '../../../hooks/use-comments';
import { useClientSession } from '../../../components/core/session-context';
import { parseISO } from 'date-fns';
import { showError } from '../../../components/core/common/Notification';
import { z } from 'zod/v3';
import { isErrorResponse } from '../../../lib/core/common/error';
import clientLogger from '../../../lib/core/client/client-logger';
import { cn } from '../../../lib/utils';
import useAutoSizer from '../../../components/core/hooks/useAutoSizer';
export const createPresignedURLsSchema = z.array(z.object({
    fileName: z.string().min(3),
    fileType: z.string().min(3),
}));
export function Comments({ context, contextId, title = 'Comments', enableEmojiReactions = false, enableLike = false, enableAttachments = false, className, }) {
    const [replyingTo, setReplyingTo] = useState(null);
    const session = useClientSession();
    const { comments, loading, createComment, reactToComment, toggleReaction, fetchComments, lastViewedAt, setCommentView, hasMore, } = useComments(context, contextId);
    const listRef = useRef(null);
    const isInitialLoadRef = useRef(true);
    const previousCommentsLengthRef = useRef(0);
    const scrollStateBeforePrependRef = useRef(null);
    const itemHeightsRef = useRef(new Map());
    const resizeObserversRef = useRef(new Map());
    const estimatedItemHeight = 138; // Estimated height per comment in pixels
    // Use useAutoSizer for automatic container sizing
    const { height: containerHeight, Container: AutoSizerContainer } = useAutoSizer();
    // Fetch comments on mount or when context/contextId changes
    // biome-ignore lint/correctness/useExhaustiveDependencies: fetchComments is stable and we only want to fetch on context/contextId changes
    useEffect(() => {
        isInitialLoadRef.current = true;
        previousCommentsLengthRef.current = 0;
        scrollStateBeforePrependRef.current = null;
        itemHeightsRef.current.clear();
        fetchComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [context, contextId]);
    // Store scroll state right before comments change (when loading starts and we have existing comments)
    useEffect(() => {
        if (loading && listRef.current && previousCommentsLengthRef.current > 0) {
            // We're about to fetch more (pagination), store current scroll state
            const outerElement = listRef.current?._outerRef;
            if (outerElement) {
                scrollStateBeforePrependRef.current = {
                    scrollHeight: outerElement.scrollHeight,
                    scrollTop: outerElement.scrollTop,
                };
            }
        }
    }, [loading]);
    const { newComments, allCommentsForList } = useMemo(() => {
        // Ensure comments are sorted by id (ULIDs are lexicographically sortable and time-ordered, ascending = oldest first)
        const sortedComments = [...comments].sort((a, b) => a.id.localeCompare(b.id));
        const viewedAt = lastViewedAt ? parseISO(lastViewedAt) : new Date(0);
        const newComments = sortedComments.filter((comment) => parseISO(comment.createdAt) > viewedAt);
        const oldComments = sortedComments.filter((comment) => parseISO(comment.createdAt) <= viewedAt);
        // Create a flat list for virtual scrolling: old comments + divider + new comments
        // For bottom-to-top chat behavior: oldest at start (index 0), newest at end (scroll to bottom to see newest)
        const allCommentsForList = [];
        // Add old comments first (at start of array, appear at top when scrolled up)
        oldComments.forEach((comment, idx) => {
            allCommentsForList.push({ type: 'comment', comment, index: idx });
        });
        // Add divider if needed
        if (newComments.length > 0 && oldComments.length > 0) {
            allCommentsForList.push({ type: 'divider' });
        }
        // Add new comments last (at end of array, appear at bottom when scrolled to end)
        newComments.forEach((comment, idx) => {
            allCommentsForList.push({ type: 'comment', comment, index: oldComments.length + idx });
        });
        return { newComments, allCommentsForList };
    }, [comments, lastViewedAt]);
    // Calculate total estimated height for scrollbar
    const estimatedTotalHeight = comments.length * estimatedItemHeight;
    // Scroll to bottom on initial load to show newest comments
    // Preserve scroll position during pagination
    useEffect(() => {
        if (!loading && comments.length > 0 && listRef.current) {
            const previousLength = previousCommentsLengthRef.current;
            const isPagination = previousLength > 0 && comments.length > previousLength;
            if (isInitialLoadRef.current) {
                // Initial load: scroll to bottom (which shows newest comments)
                // Scroll to the last loaded item (newest comments)
                const lastItemIndex = allCommentsForList.length - 1;
                if (lastItemIndex >= 0 && containerHeight > 0) {
                    const scrollToBottom = () => {
                        if (!listRef.current)
                            return;
                        // Method 1: Use scrollToRow
                        try {
                            listRef.current.scrollToRow({ index: lastItemIndex, align: 'end' });
                        }
                        catch {
                            // Ignore errors
                        }
                        // Method 2: Direct scroll via outer element (more reliable)
                        requestAnimationFrame(() => {
                            const outerElement = listRef.current?._outerRef;
                            if (outerElement) {
                                // Force scroll to bottom
                                const maxScroll = Math.max(0, outerElement.scrollHeight - outerElement.clientHeight);
                                outerElement.scrollTop = maxScroll;
                            }
                        });
                    };
                    // Scroll immediately and then again after render
                    scrollToBottom();
                    setTimeout(scrollToBottom, 50);
                    setTimeout(scrollToBottom, 150);
                    setTimeout(() => {
                        // Scroll again after heights are calculated
                        if (listRef.current) {
                            setTimeout(scrollToBottom, 50);
                        }
                    }, 300);
                }
                isInitialLoadRef.current = false;
            }
            else if (isPagination && scrollStateBeforePrependRef.current !== null) {
                // Pagination: preserve scroll position
                // Calculate how many items were added (older comments prepended at top of list)
                const itemsAdded = comments.length - previousLength;
                requestAnimationFrame(() => {
                    if (!listRef.current || !scrollStateBeforePrependRef.current)
                        return;
                    const { scrollTop: oldScrollTop } = scrollStateBeforePrependRef.current;
                    // Estimate height added and adjust scroll offset
                    // Since older comments are prepended, scroll position needs to increase
                    const heightAdded = itemsAdded * estimatedItemHeight;
                    // Access the outer element to set scroll position
                    const outerElement = listRef.current?._outerRef;
                    if (outerElement) {
                        outerElement.scrollTop = oldScrollTop + heightAdded;
                    }
                    scrollStateBeforePrependRef.current = null;
                });
            }
            previousCommentsLengthRef.current = comments.length;
        }
    }, [loading, comments.length, allCommentsForList.length, estimatedItemHeight, estimatedTotalHeight, containerHeight]);
    useEffect(() => {
        return () => {
            setCommentView();
        };
    }, [setCommentView]);
    // Scroll handler is now handled by VariableSizeList's onScroll prop
    // Get item height for virtual list
    const getItemSize = useCallback((index) => {
        const item = allCommentsForList[index];
        if (!item)
            return estimatedItemHeight;
        if (item.type === 'divider') {
            return 64; // Divider height
        }
        return itemHeightsRef.current.get(index) || estimatedItemHeight;
    }, [allCommentsForList, estimatedItemHeight]);
    // Set item height after measurement
    // Using shouldForceUpdate=false for smoother scrollbar dragging
    const setItemSize = useCallback((index, height) => {
        const currentHeight = itemHeightsRef.current.get(index);
        if (currentHeight !== height) {
            itemHeightsRef.current.set(index, height);
            // In react-window 2.0, we don't have resetAfterIndex.
            // The component should re-render if its props change.
        }
    }, []);
    // Cleanup ResizeObservers when comments change
    useEffect(() => {
        const el = resizeObserversRef.current;
        return () => {
            el.forEach((observer) => {
                observer.disconnect();
            });
            el.clear();
        };
    }, [allCommentsForList.length]);
    const uniqueParticipants = useMemo(() => {
        const participants = new Set();
        comments.forEach((comment) => {
            participants.add(comment.author);
        });
        return participants.size;
    }, [comments]);
    const handleNavigateToMessage = (messageId) => {
        const messageElement = document.getElementById(`comment-${messageId}`);
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            messageElement.classList.add('bg-yellow-100', 'dark:bg-yellow-900/20');
            setTimeout(() => {
                messageElement.classList.remove('bg-yellow-100', 'dark:bg-yellow-900/20');
            }, 2000);
        }
    };
    const handleReply = (parentComment) => {
        setReplyingTo(parentComment);
    };
    const handleAddComment = async (comment, attachmentsWithFile) => {
        try {
            if (attachmentsWithFile.length > 0) {
                const input = attachmentsWithFile.map((attachment) => ({
                    fileName: attachment.key,
                    fileType: attachment.type,
                }));
                const res = await fetch('/api/s3-upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(input),
                });
                if (!res.ok) {
                    const errorText = await res.text();
                    console.error('S3 upload API failed:', res.status, errorText);
                    showError(`S3 upload API failed: ${res.status} ${errorText}`);
                    return;
                }
                const presignedPosts = (await res.json());
                if (isErrorResponse(presignedPosts)) {
                    showError(presignedPosts.message);
                    return;
                }
                const result = await Promise.all(presignedPosts.map(async (presignedPost, index) => {
                    const file = attachmentsWithFile[index].file;
                    const formData = new FormData();
                    Object.entries(presignedPost.fields).forEach(([k, v]) => {
                        formData.append(k, v);
                    });
                    formData.append('file', file);
                    const uploadRes = await fetch(presignedPost.url, {
                        method: 'POST',
                        body: formData,
                    });
                    if (!uploadRes.ok) {
                        const errorText = await uploadRes.text();
                        clientLogger.error({
                            message: `S3 upload failed: ${uploadRes.status}: ${errorText}`,
                        });
                        return { status: 'ERROR', message: errorText };
                    }
                    return { status: 'OK' };
                }));
                if (result.some((r) => r.status === 'ERROR')) {
                    showError('Failed to upload attachments!');
                    return;
                }
                comment.attachments = attachmentsWithFile.map(({ file, ...rest }) => rest);
            }
            await createComment(comment);
        }
        catch (error) {
            console.error('Failed to add comment:', error);
        }
    };
    const handleLikeComment = async (commentId) => {
        await toggleReaction(commentId, 'likes');
    };
    const handleReactionToggle = async (commentId, emoji) => {
        await toggleReaction(commentId, emoji);
    };
    const handleReactionAdd = async (commentId, emoji) => {
        await reactToComment(commentId, emoji);
    };
    // Only show full loading screen on initial load, not during pagination
    if (loading && isInitialLoadRef.current) {
        return (_jsx(Card, { className: cn('wv-card mx-auto w-full max-w-4xl', className), children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsx("div", { className: "mx-auto h-8 w-8 animate-spin rounded-full border-primary border-b-2" }), _jsx("p", { className: "mt-2 text-muted-foreground", children: "Loading comments..." })] }) }));
    }
    return (_jsxs(Card, { className: cn('wv-card mx-auto flex h-full w-full max-w-4xl flex-col overflow-hidden pb-0', className), children: [_jsx(CardHeader, { className: "shrink-0 gap-0 pb-0", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(MessageCircle, { className: "h-5 w-5" }), title, _jsx(Badge, { variant: "secondary", className: "ml-2", children: comments.length })] }), _jsxs("div", { className: "flex items-center gap-2 text-muted-foreground text-sm", children: [_jsx(Users, { className: "h-4 w-4" }), uniqueParticipants, " participant", uniqueParticipants !== 1 ? 's' : ''] })] }) }), _jsxs(CardContent, { className: "flex min-h-0 flex-1 flex-col border-t p-0", children: [_jsx(AutoSizerContainer, { className: "relative min-h-0 flex-1 overflow-hidden", children: comments.length === 0 ? (_jsx("div", { className: "flex h-full items-center justify-center p-8 text-center text-muted-foreground", children: _jsxs("div", { children: [_jsx(MessageCircle, { className: "mx-auto mb-4 h-12 w-12 opacity-50" }), _jsx("p", { children: "No comments yet. Start the discussion!" })] }) })) : (_jsxs(_Fragment, { children: [loading && !isInitialLoadRef.current && (_jsxs("div", { className: "absolute top-0 z-10 flex w-full items-center justify-center bg-background/80 py-4 backdrop-blur-sm", children: [_jsx("div", { className: "h-6 w-6 animate-spin rounded-full border-primary border-b-2" }), _jsx("span", { className: "ml-2 text-muted-foreground text-sm", children: "Loading older comments..." })] })), containerHeight > 0 && (_jsx(List, { listRef: listRef, rowCount: allCommentsForList.length, rowHeight: getItemSize, overscanCount: 5, onScroll: (event) => {
                                        const scrollOffset = event.currentTarget.scrollTop;
                                        // Load more when scrolled near the top (index 0 = oldest comments)
                                        // In bottom-to-top chat: scrolling up (low scrollOffset) loads older comments
                                        if (scrollOffset < 800 && hasMore && !loading) {
                                            scrollStateBeforePrependRef.current = {
                                                scrollHeight: estimatedTotalHeight,
                                                scrollTop: scrollOffset,
                                            };
                                            fetchComments();
                                        }
                                    }, style: { overflowX: 'hidden', height: containerHeight, width: '100%' }, rowProps: {
                                        allCommentsForList,
                                        newComments,
                                        lastViewedAt,
                                        session,
                                        resizeObserversRef,
                                        setItemSize,
                                        handleLikeComment,
                                        handleReply,
                                        handleReactionToggle,
                                        handleReactionAdd,
                                        handleNavigateToMessage,
                                        enableEmojiReactions,
                                        enableLike,
                                    }, rowComponent: ({ index, style, ...props }) => {
                                        const { allCommentsForList, newComments, lastViewedAt, session, resizeObserversRef, setItemSize, handleLikeComment, handleReply, handleReactionToggle, handleReactionAdd, handleNavigateToMessage, enableEmojiReactions, enableLike, } = props;
                                        const item = allCommentsForList[index];
                                        if (!item)
                                            return _jsx("div", {});
                                        if (item.type === 'divider') {
                                            return (_jsxs("div", { style: style, className: "relative px-4 py-4", children: [_jsx(Separator, {}), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsxs(Badge, { variant: "outline", className: "border-blue-200 bg-background px-3 text-blue-600", children: [newComments.length, " new message", newComments.length !== 1 ? 's' : ''] }) })] }));
                                        }
                                        const isNew = parseISO(item.comment.createdAt) > (lastViewedAt ? parseISO(lastViewedAt) : new Date(0));
                                        return (_jsx("div", { id: `comment-${item.comment.id}`, style: style, className: "px-4", ref: (el) => {
                                                if (!el) {
                                                    // Cleanup: disconnect observer when element is removed
                                                    const observer = resizeObserversRef.current.get(index);
                                                    if (observer) {
                                                        observer.disconnect();
                                                        resizeObserversRef.current.delete(index);
                                                    }
                                                    return;
                                                }
                                                // Cleanup existing observer for this index
                                                const existingObserver = resizeObserversRef.current.get(index);
                                                if (existingObserver) {
                                                    existingObserver.disconnect();
                                                }
                                                // Use ResizeObserver for more accurate and smoother height measurement
                                                // This provides better performance during scrollbar dragging
                                                const resizeObserver = new ResizeObserver((entries) => {
                                                    for (const entry of entries) {
                                                        const height = entry.contentRect.height;
                                                        if (height > 0) {
                                                            setItemSize(index, height);
                                                        }
                                                    }
                                                });
                                                resizeObserver.observe(el);
                                                resizeObserversRef.current.set(index, resizeObserver);
                                            }, children: _jsx(CommentItem, { comment: item.comment, currentUser: session.userName, isNew: isNew, onLike: handleLikeComment, onReply: handleReply, onReactionToggle: handleReactionToggle, onReactionAdd: handleReactionAdd, onNavigateToMessage: handleNavigateToMessage, enableEmojiReactions: enableEmojiReactions, enableLike: enableLike }) }));
                                    } }, `${context}-${contextId}-${isInitialLoadRef.current}`))] })) }), _jsx("div", { className: "shrink-0 border-t", children: _jsx(CommentInput, { context: context, contextId: contextId, currentUser: session.userName, onSubmit: handleAddComment, replyingTo: replyingTo, onCancelReply: () => setReplyingTo(null), enableAttachments: enableAttachments }) })] })] }));
}
//# sourceMappingURL=comments.js.map