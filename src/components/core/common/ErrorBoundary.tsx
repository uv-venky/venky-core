'use client';

import React, { Component, useState, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, AlertCircleIcon, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Popup } from '../page/popup';
import { getErrorMessage } from '@/lib/core/common/error';
import { showSuccess } from './Notification';

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
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log the error for debugging
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error state when props change if resetOnPropsChange is true
    if (this.props.resetOnPropsChange && prevProps.children !== this.props.children) {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback && this.state.error && this.state.errorInfo) {
        return this.props.fallback(this.state.error, this.state.errorInfo);
      }

      // Default error UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
  showDetails?: boolean;
}

function DefaultErrorFallback({ error, errorInfo, onReset, showDetails = false }: DefaultErrorFallbackProps) {
  const [open, setOpen] = useState(false);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleCopyError = async () => {
    if (!error) return;

    const errorDetails = [
      `Error: ${getErrorMessage(error)}`,
      error.stack ? `\nStack Trace:\n${error.stack}` : '',
      errorInfo?.componentStack ? `\nComponent Stack:\n${errorInfo.componentStack}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const errorText = `I encountered the following error in my React application. Can you help me debug it?

${errorDetails}`;

    try {
      await navigator.clipboard.writeText(errorText);
      showSuccess('Error message copied to clipboard');
    } catch (err) {
      console.error('Failed to copy error to clipboard:', err);
    }
  };

  return (
    <>
      <div className="flex p-4">
        <Alert variant="destructive" className="items-center">
          <AlertCircleIcon />
          <AlertTitle className="flex items-center justify-between gap-2">
            Something went wrong
            <Button
              variant="link"
              size="sm"
              onClick={() => setOpen(true)}
              className="ml-4 p-0 text-destructive text-sm"
            >
              Details
            </Button>
          </AlertTitle>
        </Alert>
      </div>
      {open && (
        <Popup
          onClose={() => setOpen(false)}
          title="Error Details"
          width={Math.min(800, window.innerWidth - 100)}
          height={Math.min(600, window.innerHeight - 100)}
        >
          <Card className="w-full border-none">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <CardDescription>
                An unexpected error occurred. Please try again or contact support if the problem persists.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Button onClick={onReset}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={handleRefresh} variant="outline">
                  Refresh Page
                </Button>
                <Button onClick={handleGoHome} variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
                <Button onClick={handleCopyError} variant="outline">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Error
                </Button>
              </div>

              {error && showDetails ? (
                <details className="mt-4 rounded-md border p-3 text-sm">
                  <summary className="cursor-pointer font-medium text-destructive">
                    Error: {getErrorMessage(error)}
                  </summary>
                  <div className="mt-2 space-y-2">
                    {error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="mt-1 max-h-32 overflow-auto rounded bg-muted p-2 text-xs">{error.stack}</pre>
                      </div>
                    )}
                    {errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 max-h-32 overflow-auto rounded bg-muted p-2 text-xs">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              ) : (
                <div className="mt-4 text-destructive text-sm">
                  <strong>Error:</strong> {getErrorMessage(error)}
                </div>
              )}
            </CardContent>
          </Card>
        </Popup>
      )}
    </>
  );
}

// Hook for functional components to handle errors
export function useErrorHandler() {
  const handleError = (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);

    // You can add additional error reporting logic here
    // For example, sending to an error reporting service

    // Optionally show a toast notification
    // toast.error('An error occurred. Please try again.');
  };

  return { handleError };
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
