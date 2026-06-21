import React, { Component, type ErrorInfo, type ReactNode } from 'react';
interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}
interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    resetOnPropsChange?: boolean;
    resetOnRouteChange?: boolean;
    showDetails?: boolean;
}
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps);
    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState>;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    componentDidUpdate(prevProps: ErrorBoundaryProps): void;
    handleReset: () => void;
    render(): string | number | bigint | boolean | import("react/jsx-runtime").JSX.Element | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined;
}
export declare function useErrorHandler(): {
    handleError: (error: Error, errorInfo?: ErrorInfo) => void;
};
export declare function withErrorBoundary<P extends object>(Component: React.ComponentType<P>, errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>): {
    (props: P): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export {};
//# sourceMappingURL=ErrorBoundary.d.ts.map