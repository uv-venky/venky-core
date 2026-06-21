import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../lib/utils';
import { VenkyLogoMark } from './venky-logo-mark';
/** Default Venky login header logo: stylized V mark + wordmark. */
export function VenkyLogo({ maxHeight = 58, className, fill = '#512eff' }) {
    return (_jsxs("div", { className: cn('flex items-center gap-3', className), style: { maxHeight }, "aria-label": "Venky", children: [_jsx(VenkyLogoMark, { className: "h-12 w-12", fill: fill }), _jsx("span", { className: "font-semibold text-3xl text-white tracking-tight", style: { fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }, children: "Venky" })] }));
}
/** @deprecated Use VenkyLogo. Kept for internal compatibility. */
export const Logo = VenkyLogo;
//# sourceMappingURL=logo.js.map