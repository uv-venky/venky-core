'use client';
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState, version as reactVersion } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose, DialogDescription, } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import useWindowSize from './core/hooks/useWindowSize';
import { useAppContext } from './sidebar/app-provider';
import { useClientSession } from '../components/core/session-context';
import { useQueryWithOptions } from '../lib/core/client/useQuery';
import { APP_VERSION } from '../lib/app-info';
function InfoRow({ label, value }) {
    return (_jsxs("p", { children: [_jsxs("span", { className: "font-semibold", children: [label, ":"] }), " ", value] }));
}
function SectionLabel({ children }) {
    return _jsx("p", { className: "pt-2 font-medium text-muted-foreground text-xs uppercase tracking-wide", children: children });
}
export default function AboutDialog({ open, onOpenChange }) {
    const [userAgent, setUserAgent] = useState('');
    const { width, height } = useWindowSize();
    const [resolution, setResolution] = useState(`${width} x ${height}`);
    const { APP_NAME, APP_DESCRIPTION } = useAppContext();
    const session = useClientSession();
    const envResult = useQueryWithOptions('getEnvironment', { enabled: open });
    const sysResult = useQueryWithOptions('getSystemInfo', { enabled: open });
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    useEffect(() => {
        if (open) {
            setUserAgent(navigator.userAgent);
        }
    }, [open]);
    useEffect(() => {
        if (open) {
            setResolution(`${width} x ${height}`);
        }
    }, [width, height, open]);
    const env = envResult.status === 'success' ? envResult.data : null;
    const sys = sysResult.status === 'success' ? sysResult.data : null;
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "w-[680px] sm:max-w-[90%]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: APP_NAME }), _jsx(DialogDescription, { children: APP_DESCRIPTION })] }), _jsxs("div", { className: "space-y-1 text-sm", children: [_jsx(SectionLabel, { children: "Application" }), _jsx(InfoRow, { label: "Version", value: APP_VERSION }), _jsx(InfoRow, { label: "Core", value: sys?.coreVersion ?? '...' }), env?.APP_ID && _jsx(InfoRow, { label: "Application ID", value: env.APP_ID }), _jsx(SectionLabel, { children: "User" }), _jsx(InfoRow, { label: "User", value: `${session.name} (${session.userName})` }), _jsx(InfoRow, { label: "Roles", value: session.roles.join(', ') }), _jsx(SectionLabel, { children: "Runtime" }), _jsx(InfoRow, { label: "React", value: reactVersion }), _jsx(InfoRow, { label: "Next.js", value: sys?.nextVersion ?? '...' }), _jsx(InfoRow, { label: "Node.js", value: sys?.nodeVersion ?? '...' }), _jsx(SectionLabel, { children: "Client" }), _jsx(InfoRow, { label: "Screen", value: resolution }), _jsx(InfoRow, { label: "Timezone", value: timezone }), _jsx(InfoRow, { label: "Local time", value: new Date().toString() }), _jsx(InfoRow, { label: "Agent", value: userAgent })] }), _jsx(DialogFooter, { children: _jsx(DialogClose, { asChild: true, children: _jsx(Button, { children: "Close" }) }) })] }) }));
}
//# sourceMappingURL=about-dialog.js.map