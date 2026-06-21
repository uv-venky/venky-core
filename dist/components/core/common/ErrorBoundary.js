'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'react/jsx-runtime';
import React, { Component, useState } from 'react';
import { AlertTriangle, RefreshCw, Home, AlertCircleIcon, Copy } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Alert, AlertTitle } from '../../../components/ui/alert';
import { Popup } from '../page/popup';
import { getErrorMessage } from '../../../lib/core/common/error';
import { showSuccess } from './Notification';
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    // Log the error for debugging
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }
  componentDidUpdate(prevProps) {
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
      return _jsx(DefaultErrorFallback, {
        error: this.state.error,
        errorInfo: this.state.errorInfo,
        onReset: this.handleReset,
        showDetails: this.props.showDetails,
      });
    }
    return this.props.children;
  }
}
function DefaultErrorFallback({ error, errorInfo, onReset, showDetails = false }) {
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
  return _jsxs(_Fragment, {
    children: [
      _jsx('div', {
        className: 'flex p-4',
        children: _jsxs(Alert, {
          variant: 'destructive',
          className: 'items-center',
          children: [
            _jsx(AlertCircleIcon, {}),
            _jsxs(AlertTitle, {
              className: 'flex items-center justify-between gap-2',
              children: [
                'Something went wrong',
                _jsx(Button, {
                  variant: 'link',
                  size: 'sm',
                  onClick: () => setOpen(true),
                  className: 'ml-4 p-0 text-destructive text-sm',
                  children: 'Details',
                }),
              ],
            }),
          ],
        }),
      }),
      open &&
        _jsx(Popup, {
          onClose: () => setOpen(false),
          title: 'Error Details',
          width: Math.min(800, window.innerWidth - 100),
          height: Math.min(600, window.innerHeight - 100),
          children: _jsxs(Card, {
            className: 'w-full border-none',
            children: [
              _jsxs(CardHeader, {
                className: 'text-center',
                children: [
                  _jsx('div', {
                    className: 'mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10',
                    children: _jsx(AlertTriangle, { className: 'h-6 w-6 text-destructive' }),
                  }),
                  _jsx(CardTitle, { className: 'text-xl', children: 'Something went wrong' }),
                  _jsx(CardDescription, {
                    children:
                      'An unexpected error occurred. Please try again or contact support if the problem persists.',
                  }),
                ],
              }),
              _jsxs(CardContent, {
                className: 'space-y-4',
                children: [
                  _jsxs('div', {
                    className: 'flex items-center justify-center gap-2',
                    children: [
                      _jsxs(Button, {
                        onClick: onReset,
                        children: [_jsx(RefreshCw, { className: 'mr-2 h-4 w-4' }), 'Try Again'],
                      }),
                      _jsx(Button, { onClick: handleRefresh, variant: 'outline', children: 'Refresh Page' }),
                      _jsxs(Button, {
                        onClick: handleGoHome,
                        variant: 'outline',
                        children: [_jsx(Home, { className: 'mr-2 h-4 w-4' }), 'Go Home'],
                      }),
                      _jsxs(Button, {
                        onClick: handleCopyError,
                        variant: 'outline',
                        children: [_jsx(Copy, { className: 'mr-2 h-4 w-4' }), 'Copy Error'],
                      }),
                    ],
                  }),
                  error && showDetails
                    ? _jsxs('details', {
                        className: 'mt-4 rounded-md border p-3 text-sm',
                        children: [
                          _jsxs('summary', {
                            className: 'cursor-pointer font-medium text-destructive',
                            children: ['Error: ', getErrorMessage(error)],
                          }),
                          _jsxs('div', {
                            className: 'mt-2 space-y-2',
                            children: [
                              error.stack &&
                                _jsxs('div', {
                                  children: [
                                    _jsx('strong', { children: 'Stack:' }),
                                    _jsx('pre', {
                                      className: 'mt-1 max-h-32 overflow-auto rounded bg-muted p-2 text-xs',
                                      children: error.stack,
                                    }),
                                  ],
                                }),
                              errorInfo &&
                                _jsxs('div', {
                                  children: [
                                    _jsx('strong', { children: 'Component Stack:' }),
                                    _jsx('pre', {
                                      className: 'mt-1 max-h-32 overflow-auto rounded bg-muted p-2 text-xs',
                                      children: errorInfo.componentStack,
                                    }),
                                  ],
                                }),
                            ],
                          }),
                        ],
                      })
                    : _jsxs('div', {
                        className: 'mt-4 text-destructive text-sm',
                        children: [_jsx('strong', { children: 'Error:' }), ' ', getErrorMessage(error)],
                      }),
                ],
              }),
            ],
          }),
        }),
    ],
  });
}
// Hook for functional components to handle errors
export function useErrorHandler() {
  const handleError = (error, errorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    // You can add additional error reporting logic here
    // For example, sending to an error reporting service
    // Optionally show a toast notification
    // toast.error('An error occurred. Please try again.');
  };
  return { handleError };
}
// Higher-order component for wrapping components with error boundary
export function withErrorBoundary(Component, errorBoundaryProps) {
  const WrappedComponent = (props) =>
    _jsx(ErrorBoundary, { ...errorBoundaryProps, children: _jsx(Component, { ...props }) });
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}
//# sourceMappingURL=ErrorBoundary.js.map
