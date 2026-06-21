'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { cn } from '../../lib/utils';
export const AnimatedBorder = ({ className }) => {
    return (_jsxs(_Fragment, { children: [_jsx("style", { jsx: true, children: `
        @property --angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        @keyframes border-rotate {
          from {
            --angle: 0deg;
          }
          to {
            --angle: 360deg;
          }
        }

        .animate-border-mask {
          animation: border-rotate 2s linear infinite;
          mask-image: conic-gradient(
            from var(--angle),
            transparent 70%,
            black 90%,
            transparent 100%
          );
        }
      ` }), _jsx("div", { className: cn('pointer-events-none absolute inset-0 animate-border-mask rounded-[inherit]', className), children: _jsxs("svg", { className: "h-full w-full overflow-visible", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "gradient-glow", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [_jsx("stop", { offset: "0%", stopColor: "#60a5fa" }), _jsx("stop", { offset: "50%", stopColor: "#3b82f6" }), _jsx("stop", { offset: "100%", stopColor: "#60a5fa" })] }) }), _jsx("rect", { x: "1", y: "1", width: "calc(100% - 2px)", height: "calc(100% - 2px)", rx: "6", fill: "none", stroke: "url(#gradient-glow)", strokeWidth: "2", style: {
                                filter: 'drop-shadow(0 0 4px #3b82f6)',
                            } })] }) }), _jsx("div", { className: cn('pointer-events-none absolute inset-0 rounded-[inherit] border-2 border-blue-500/10', className) })] }));
};
//# sourceMappingURL=animated-border.js.map