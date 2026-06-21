import { useCallback, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
export function useScrollToBottom() {
    const containerRef = useRef(null);
    const endRef = useRef(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const { data: scrollBehavior = false, mutate: setScrollBehavior } = useSWR('messages:should-scroll', null, { fallbackData: false });
    const handleScroll = useCallback(() => {
        if (!containerRef.current) {
            return;
        }
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        // Check if we are within 100px of the bottom (like v0 does)
        setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 100);
    }, []);
    useEffect(() => {
        if (!containerRef.current) {
            return;
        }
        const container = containerRef.current;
        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(() => {
                handleScroll();
            });
        });
        const mutationObserver = new MutationObserver(() => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    handleScroll();
                });
            });
        });
        resizeObserver.observe(container);
        mutationObserver.observe(container, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class', 'data-state'],
        });
        handleScroll();
        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, [handleScroll]);
    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }
        container.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initial state
        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);
    useEffect(() => {
        if (scrollBehavior && containerRef.current) {
            const container = containerRef.current;
            const scrollOptions = {
                top: container.scrollHeight,
                behavior: scrollBehavior,
            };
            container.scrollTo(scrollOptions);
            setScrollBehavior(false);
        }
    }, [scrollBehavior, setScrollBehavior]);
    const scrollToBottom = useCallback((currentScrollBehavior = 'smooth') => {
        setScrollBehavior(currentScrollBehavior);
    }, [setScrollBehavior]);
    function onViewportEnter() {
        setIsAtBottom(true);
    }
    function onViewportLeave() {
        setIsAtBottom(false);
    }
    return {
        containerRef,
        endRef,
        isAtBottom,
        scrollToBottom,
        onViewportEnter,
        onViewportLeave,
    };
}
//# sourceMappingURL=use-scroll-to-bottom.js.map