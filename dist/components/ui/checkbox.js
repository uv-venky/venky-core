'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { CheckIcon } from 'lucide-react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { cn } from '../../lib/utils';
function Checkbox({ className, ...props }) {
    return (_jsx(CheckboxPrimitive.Root, { "data-slot": "checkbox", className: cn('peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs outline-none transition-shadow focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:data-[state=checked]:bg-primary dark:aria-invalid:ring-destructive/40', className), ...props, children: _jsx(CheckboxPrimitive.Indicator, { "data-slot": "checkbox-indicator", className: "grid place-content-center text-current transition-none", children: _jsx(CheckIcon, { className: "size-3.5 text-current" }) }) }));
}
export { Checkbox };
//# sourceMappingURL=checkbox.js.map