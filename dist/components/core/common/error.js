'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
export default function ErrorCard({ children }) {
    return (_jsx("div", { className: "flex h-full w-full items-center justify-center gap-4 p-4", children: _jsxs(Alert, { variant: "destructive", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Error" }), _jsx(AlertDescription, { children: children })] }) }));
}
//# sourceMappingURL=error.js.map