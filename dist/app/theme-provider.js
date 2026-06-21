'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import GlobalTooltip from '../components/core/common/GlobalTooltip';
import { ThemeProvider } from '../components/theme-provider';
import ToasterComponent from '../components/core/common/toaster';
import { useClientSession } from '../components/core/session-context';
import SetupHashListener from '../components/core/common/SetupHashListener';
import { cn } from '../lib/utils';
import { InitNextJSCoreHooksSetup } from '../components/core/InitNextJSCoreHooksSetup';
function useTheme() {
    const session = useClientSession();
    return session?.settings.theme ?? 'system';
}
export default function AppThemeProvider({ children, nonce, className, }) {
    const theme = useTheme();
    return (_jsx("html", { lang: "en", className: cn(theme, className), style: { colorScheme: theme }, suppressHydrationWarning: true, children: _jsxs("body", { className: `h-screen max-h-screen overflow-auto antialiased`, children: [_jsx(InitNextJSCoreHooksSetup, {}), _jsx(SetupHashListener, {}), _jsxs(ThemeProvider, { nonce: nonce, attribute: "class", defaultTheme: theme, enableSystem: true, disableTransitionOnChange: true, children: [children, _jsx(ToasterComponent, {}), _jsx("div", { id: "tooltip" }), _jsx(GlobalTooltip, {})] })] }) }));
}
//# sourceMappingURL=theme-provider.js.map