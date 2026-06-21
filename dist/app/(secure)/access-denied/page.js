'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from '../../../components/core/link';
import clientLogger from '../../../lib/core/client/client-logger';
import { useEffect } from 'react';
import { useSearchParams } from '../../../components/core/hooks/useSearchParams';
import { useManualReadySignal } from '../../../lib/core/client/loading-tracker';
export default function AccessDenied() {
    const searchParams = useSearchParams();
    const path = searchParams.get('path') ?? 'unknown-path';
    const signalReady = useManualReadySignal();
    useEffect(() => {
        async function runLogActivity() {
            await clientLogger.logActivity({
                eventType: 'Access Denied',
                eventId: path,
            });
        }
        runLogActivity();
    }, [path]);
    useEffect(() => {
        signalReady();
    }, [signalReady]);
    return (_jsx("div", { className: "flex min-h-screen flex-col items-center justify-center px-4 text-center", children: _jsxs("div", { className: "mx-auto max-w-md space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h1", { className: "font-bold text-3xl text-muted-foreground tracking-tighter", children: "Access Denied" }), _jsx("h2", { className: "font-bold text-muted-foreground text-xl tracking-tight", children: "You do not have access to this page!" }), _jsx("p", { className: "text-muted-foreground", children: `Please contact your administrator to get access to this page.` })] }), _jsx(Button, { activityId: "404-back-home", asChild: true, size: "lg", className: "gap-2", children: _jsxs(Link, { prefetch: false, href: "/", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Back to home"] }) })] }) }));
}
//# sourceMappingURL=page.js.map