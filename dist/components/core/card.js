import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader } from '../../components/ui/card';
export function SimpleCard({ header, children }) {
    return (_jsxs(Card, { className: "flex-1 gap-0 overflow-hidden p-0 shadow-none", children: [_jsx(CardHeader, { className: "items-center gap-0 border-b px-2 py-4 font-semibold text-sm [.border-b]:py-4", children: header }), _jsx(CardContent, { className: "overflow-hidden p-0", children: children })] }));
}
//# sourceMappingURL=card.js.map