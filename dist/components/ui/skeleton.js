import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../../lib/utils';
function Skeleton({ className, ...props }) {
    return (_jsx("div", { "data-slot": "skeleton", "data-testid": "skeleton", className: cn('animate-pulse rounded-md bg-primary/10 dark:bg-primary/50', className), ...props }));
}
export { Skeleton };
//# sourceMappingURL=skeleton.js.map