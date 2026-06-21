import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../lib/utils';
const DEFAULT_FILL = '#512eff';
/** Shared stylized V mark used by VenkyLogo and MiniLogo. */
export function VenkyLogoMark({ className, fill = DEFAULT_FILL, }) {
    return (_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 48 48", "aria-hidden": "true", className: cn('shrink-0', className), children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "venky-v-gradient", x1: "8", y1: "6", x2: "40", y2: "42", gradientUnits: "userSpaceOnUse", children: [_jsx("stop", { offset: "0%", stopColor: "#7c5cff" }), _jsx("stop", { offset: "100%", stopColor: fill })] }) }), _jsx("path", { d: "M8 6 L24 42 L40 6 L34 6 L24 30 L14 6 Z", fill: "url(#venky-v-gradient)" })] }));
}
//# sourceMappingURL=venky-logo-mark.js.map