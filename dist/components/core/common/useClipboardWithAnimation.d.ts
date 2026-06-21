export interface IconPaths {
    default: {
        color: string;
        d: string;
    };
    success: {
        color: string;
        d: string;
    };
}
export interface UseClipboardWithAnimationOptions {
    paths: IconPaths;
    onSuccess?: (text: string) => void;
    onError?: (error: Error) => void;
    successMessage?: string;
    errorMessage?: string;
    enableMobileShare?: boolean;
    shareTitle?: string;
    /** When true, skip success toasts; use for icon-only feedback (e.g. morph animation). */
    suppressSuccessToast?: boolean;
}
export declare function useClipboardWithAnimation(options: UseClipboardWithAnimationOptions): {
    isLoading: boolean;
    isAnimating: boolean;
    pathRef: import("react").RefObject<SVGPathElement | null>;
    currentPath: {
        color: string;
        d: string;
    };
    copyToClipboard: (text: string) => Promise<void>;
};
//# sourceMappingURL=useClipboardWithAnimation.d.ts.map