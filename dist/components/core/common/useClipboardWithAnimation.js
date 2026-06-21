import { useState, useRef, useEffect, useMemo } from 'react';
import { animate } from 'motion';
import { useIsMobile } from '../../../hooks/use-mobile';
import { showError, showSuccess } from '../../../components/core/common/Notification';
import clientLogger from '../../../lib/core/client/client-logger';
let _interpolate = null;
const transition = { duration: 0.5 };
export function useClipboardWithAnimation(options) {
    const { paths, onSuccess, onError, successMessage = 'Copied to clipboard', errorMessage = 'Failed to copy to clipboard', enableMobileShare = false, shareTitle, suppressSuccessToast = false, } = options;
    const isMobile = useIsMobile();
    const [isLoading, setIsLoading] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const pathRef = useRef(null);
    const currentPathRef = useRef(paths.default);
    const timerRef = useRef(null);
    const mixPathsRef = useRef(null);
    // Eagerly load flubber on first render (cached after first import)
    useMemo(() => {
        if (_interpolate) {
            mixPathsRef.current = _interpolate(paths.default.d, paths.success.d, {
                maxSegmentLength: 1,
            });
        }
        else {
            import('flubber').then((mod) => {
                _interpolate = mod.interpolate;
                mixPathsRef.current = _interpolate(paths.default.d, paths.success.d, {
                    maxSegmentLength: 1,
                });
            });
        }
    }, [paths.default.d, paths.success.d]);
    const togglePath = () => {
        const el = pathRef.current;
        if (!el || !mixPathsRef.current)
            return;
        currentPathRef.current = currentPathRef.current === paths.default ? paths.success : paths.default;
        animate(el, { fill: currentPathRef.current.color }, transition);
        const mixPaths = mixPathsRef.current;
        animate(0, 1, {
            onUpdate: (progress) => {
                el.setAttribute('d', mixPaths(progress));
            },
            duration: 0.5,
        });
        timerRef.current = setTimeout(() => {
            currentPathRef.current = paths.default;
            animate(el, { fill: paths.default.color }, transition);
            el.setAttribute('d', paths.default.d);
            setIsAnimating(false);
        }, 3000);
    };
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);
    const copyToClipboard = async (text) => {
        if (isAnimating)
            return;
        setIsLoading(true);
        try {
            // Handle mobile sharing if enabled
            if (enableMobileShare && isMobile && navigator.share) {
                try {
                    await navigator.share({
                        title: shareTitle || document.title,
                        text: text,
                    });
                    if (!suppressSuccessToast) {
                        showSuccess('Shared successfully', {
                            description: 'Content shared successfully',
                        });
                    }
                    setIsLoading(false);
                    setIsAnimating(true);
                    togglePath();
                    onSuccess?.(text);
                    return;
                }
                catch (_shareError) {
                    // User cancelled or share failed, fall back to clipboard
                }
            }
            // Copy to clipboard
            await navigator.clipboard.writeText(text);
            if (!suppressSuccessToast) {
                showSuccess('Success', {
                    description: successMessage,
                });
            }
            setIsLoading(false);
            setIsAnimating(true);
            togglePath();
            onSuccess?.(text);
        }
        catch (error) {
            clientLogger.error({
                message: 'Clipboard error',
                error,
            });
            showError('Error', {
                description: errorMessage,
            });
            onError?.(error);
        }
        finally {
            setIsLoading(false);
        }
    };
    return {
        isLoading,
        isAnimating,
        pathRef,
        currentPath: currentPathRef.current,
        copyToClipboard,
    };
}
//# sourceMappingURL=useClipboardWithAnimation.js.map