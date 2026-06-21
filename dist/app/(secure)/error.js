/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
export default function ErrorBoundary({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Route Error:', error);
    }, [error]);
    return (_jsxs("div", { className: "flex h-full w-full flex-col items-center justify-center gap-6 p-4", children: [_jsxs(Alert, { variant: "destructive", className: "max-w-md", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Something went wrong" }), _jsx(AlertDescription, { children: error.message || 'An unexpected error occurred. Please try again.' })] }), _jsxs(Button, { onClick: reset, variant: "outline", children: [_jsx(RefreshCw, { className: "mr-2 h-4 w-4" }), "Try Again"] })] }));
}
//# sourceMappingURL=error.js.map