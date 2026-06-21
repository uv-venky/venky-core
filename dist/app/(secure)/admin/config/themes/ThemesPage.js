'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import PageShell from '../../../../../components/core/page/page-shell';
import { Label } from '../../../../../components/ui/label';
import { Switch } from '../../../../../components/ui/switch';
import { proxy, useSnapshot } from 'valtio';
import { useManualReadySignal } from '../../../../../lib/core/client/loading-tracker';
import { useEffect } from 'react';
const showThemeCustomizationState = proxy({
    show: false,
});
export function useShowThemeCustomization() {
    const snapshot = useSnapshot(showThemeCustomizationState);
    return snapshot.show;
}
export function ThemesPage() {
    const signalReady = useManualReadySignal();
    useEffect(() => {
        signalReady();
    }, [signalReady]);
    const show = useShowThemeCustomization();
    return (_jsx(PageShell, { title: "Themes", noPadding: true, mustBeTabletOrDesktop: false, children: _jsxs("div", { className: "use flex h-full items-center justify-center gap-4", children: [_jsx(Switch, { className: "cursor-pointer", checked: show, onCheckedChange: () => {
                        showThemeCustomizationState.show = !show;
                    } }), _jsx(Label, { htmlFor: "ts", className: "cursor-pointer", children: "Show Theme Customization" })] }) }));
}
//# sourceMappingURL=ThemesPage.js.map