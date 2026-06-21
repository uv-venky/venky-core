'use client';
import { useClientSession } from '../components/core/session-context';
import { useMutation } from '../lib/core/client/useQuery';
import { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import { useSSE } from '../lib/sse/client/use-sse';
export function useComments(context, contextId) {
    const currentUser = useClientSession().userName;
    const [comments, setComments] = useState([]);
    const [lastViewedAt, setLastViewedAt] = useState();
    const [hasMore, setHasMore] = useState(true);
    const [nextCursor, setNextCursor] = useState(null);
    const [loading, setLoading] = useState(true);
    const getCommentsMutation = useMutation('getComments');
    const createCommentMutation = useMutation('createComment');
    const reactToCommentMutation = useMutation('reactToComment');
    const setCommentViewMutation = useMutation('setCommentView');
    // Use refs to track pagination state so fetchComments doesn't need to be recreated
    const nextCursorRef = useRef(null);
    const hasMoreRef = useRef(true);
    // Keep refs in sync with state
    nextCursorRef.current = nextCursor;
    hasMoreRef.current = hasMore;
    // Reset pagination state when context or contextId changes
    useEffect(() => {
        setComments([]);
        setLastViewedAt(undefined);
        setHasMore(true);
        setNextCursor(null);
        nextCursorRef.current = null;
        hasMoreRef.current = true;
        setLoading(true);
    }, [context, contextId]);
    // Fetch comments
    const fetchComments = useCallback(async () => {
        const currentCursor = nextCursorRef.current;
        if (!hasMoreRef.current && currentCursor !== null)
            return;
        try {
            setLoading(true);
            const response = await getCommentsMutation(context, contextId, currentCursor);
            setLastViewedAt(response.lastViewedAt);
            // If initial load (no cursor), replace comments and ensure sorted (oldest first, newest at bottom)
            // If pagination (has cursor), merge and sort to maintain chronological order
            if (currentCursor === null) {
                // Ensure initial load is sorted by id (ULIDs are lexicographically sortable and time-ordered)
                setComments([...response.comments].sort((a, b) => a.id.localeCompare(b.id)));
            }
            else {
                // Merge older comments with existing, deduplicate by id, then sort by id
                setComments((prev) => {
                    // Create a map to deduplicate by id
                    const commentMap = new Map();
                    // Add all comments (new paginated batch and existing)
                    // This ensures we don't lose any comments
                    [...prev, ...response.comments].forEach((comment) => {
                        commentMap.set(comment.id, comment);
                    });
                    // Convert back to array and sort by id (ascending = oldest first, newest at bottom)
                    return Array.from(commentMap.values()).sort((a, b) => a.id.localeCompare(b.id));
                });
            }
            setHasMore(response.hasMore);
            setNextCursor(response.nextCursor);
        }
        finally {
            setLoading(false);
        }
    }, [context, contextId, getCommentsMutation]);
    // Create comment
    const createComment = async (comment) => {
        const _comment = await createCommentMutation(context, contextId, comment);
        // Don't add optimistically - SSE event will add it to avoid duplicates
        // The SSE event is published by the server and will update all clients including this one
        setLastViewedAt(new Date().toISOString());
        return _comment;
    };
    const reactToComment = async (commentId, emoji) => {
        await reactToCommentMutation(commentId, emoji, context, contextId);
        setComments((prev) => {
            let comment = prev.find((c) => c.id === commentId);
            if (!comment)
                return prev;
            if (emoji == null) {
                comment = { ...comment, reactions: { ...comment.reactions } };
                delete comment.reactions[currentUser];
            }
            else {
                comment = {
                    ...comment,
                    reactions: { ...comment.reactions, [currentUser]: emoji },
                };
            }
            return prev.map((c) => (c.id === commentId ? comment : c));
        });
    };
    const toggleReaction = async (commentId, emoji) => {
        const comment = comments.find((c) => c.id === commentId);
        if (!comment)
            return;
        const _emoji = comment.reactions[currentUser] === emoji ? null : emoji;
        await reactToComment(commentId, _emoji);
    };
    const setCommentView = useCallback(async () => {
        await setCommentViewMutation(context, contextId);
        setLastViewedAt(new Date().toISOString());
    }, [context, contextId, setCommentViewMutation]);
    // SSE subscription for real-time updates
    const commentChannel = useMemo(() => `comment:${context}:${contextId}`, [context, contextId]);
    // Handle SSE messages
    const handleSSEMessage = useCallback((_channel, data) => {
        if (data.type === 'comment_created') {
            // Add new comment if it doesn't already exist, maintaining sorted order
            setComments((prev) => {
                const exists = prev.some((c) => c.id === data.comment.id);
                if (exists)
                    return prev;
                // Insert in correct sorted position (by id, ascending = oldest first)
                // Use a Map to deduplicate, then sort
                const commentMap = new Map();
                prev.forEach((c) => {
                    commentMap.set(c.id, c);
                });
                commentMap.set(data.comment.id, data.comment);
                return Array.from(commentMap.values()).sort((a, b) => a.id.localeCompare(b.id));
            });
        }
        else if (data.type === 'reaction_updated') {
            // Update reactions for the specific comment
            setComments((prev) => {
                const comment = prev.find((c) => c.id === data.commentId);
                if (!comment)
                    return prev;
                return prev.map((c) => (c.id === data.commentId ? { ...c, reactions: data.reactions } : c));
            });
        }
        else if (data.type === 'view_updated' && data.viewer === currentUser) {
            // Update lastViewedAt if the viewer is the current user
            setLastViewedAt(data.viewedAt);
        }
    }, [currentUser]);
    // Subscribe to SSE channel
    useSSE({
        channels: [commentChannel],
        onMessage: handleSSEMessage,
        enabled: !!context && !!contextId,
    });
    return {
        comments,
        lastViewedAt,
        createComment,
        fetchComments,
        hasMore,
        loading,
        reactToComment,
        toggleReaction,
        setCommentView,
    };
}
//# sourceMappingURL=use-comments.js.map