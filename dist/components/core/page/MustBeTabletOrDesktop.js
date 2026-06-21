'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import useWindowSize from '../../../components/core/hooks/useWindowSize';
import { InfoIcon } from 'lucide-react';
import { useManualReadySignal } from '../../../lib/core/client/loading-tracker';
import { useEffect } from 'react';
const MIN_WIDTH = 1024;
const MIN_HEIGHT = 600;
export function useIsTabletOrDesktop() {
    const { width, height } = useWindowSize();
    if (width < MIN_WIDTH || height < MIN_HEIGHT) {
        return false;
    }
    return true;
}
function MustBeTabletOrDesktopContent() {
    const { width, height } = useWindowSize();
    const manualReadySignal = useManualReadySignal();
    useEffect(() => {
        manualReadySignal();
    }, [manualReadySignal]);
    return (_jsxs("div", { className: "flex h-screen w-full flex-col items-center justify-center gap-4", children: [_jsx("div", { className: "text-wrap text-center font-bold text-2xl", children: "Please use a desktop or tablet to access this application." }), _jsxs("div", { className: "text-center text-2xl text-muted-foreground", children: ["Required resolution: ", MIN_WIDTH, " x ", MIN_HEIGHT, _jsx("br", {}), "Current resolution: ", width, " x ", height, _jsx("br", {}), "(", Math.round((width < MIN_WIDTH ? width / MIN_WIDTH : height / MIN_HEIGHT) * 100), "% of required resolution)"] }), height >= MIN_WIDTH && width >= MIN_HEIGHT && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(InfoIcon, { className: "h-4 w-4" }), " You may need to rotate your device."] }))] }));
}
export default function MustBeTabletOrDesktop({ children, }) {
    const isTabletOrDesktop = useIsTabletOrDesktop();
    if (!isTabletOrDesktop) {
        return _jsx(MustBeTabletOrDesktopContent, {});
    }
    return children;
}
//# sourceMappingURL=MustBeTabletOrDesktop.js.map