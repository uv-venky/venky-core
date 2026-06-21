import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../../../lib/utils';
import './wavedots.css';
export function WaveDots(props) {
    return (_jsxs("span", { className: cn('wave', props.className, {
            active: props.active,
            white: props.white,
            fill: props.fill,
        }), style: props.style, children: [_jsx("span", { className: "dot" }), _jsx("span", { className: "dot" }), _jsx("span", { className: "dot" }), _jsx("span", { className: "reason", children: props.reason })] }));
}
//# sourceMappingURL=WaveDots.js.map