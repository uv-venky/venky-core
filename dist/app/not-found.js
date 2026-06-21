import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* Copyright (c) 2024-present Venky Corp. */
import { AlertCircle } from 'lucide-react';
import { Link } from '../components/core/link';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Button } from '../components/ui/button';
export default function NotFound() {
    return (_jsxs("div", { className: "flex h-screen w-full flex-col items-center justify-center gap-6 p-4", children: [_jsxs(Alert, { variant: "destructive", className: "max-w-md", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Page Not Found" }), _jsx(AlertDescription, { children: "The page you are looking for does not exist or has been moved." })] }), _jsx(Button, { asChild: true, variant: "outline", children: _jsx(Link, { href: "/", children: "Return Home" }) })] }));
}
//# sourceMappingURL=not-found.js.map