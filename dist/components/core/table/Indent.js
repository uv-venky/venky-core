import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../../../lib/utils';
import { memo } from 'react';
const Indent = ({ level, isStart, isEnd }) => {
    if (level === 0) {
        return null;
    }
    const baseClassName = `tree-cell-indent`;
    const list = [];
    for (let i = 1; i <= level; i += 1) {
        list.push(_jsx("span", { className: cn(baseClassName, i === level && `${baseClassName}-edge`, {
                [`${baseClassName}-start`]: isStart[i],
                [`${baseClassName}-end`]: isEnd[i],
            }) }, i));
    }
    return (_jsx("span", { "aria-hidden": "true", className: `tree-cell-indent-wrapper`, children: list }));
};
export default memo(Indent);
//# sourceMappingURL=Indent.js.map