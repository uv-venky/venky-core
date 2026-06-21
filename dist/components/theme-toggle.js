'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import useTheme from '../components/core/hooks/useTheme';
import { Button } from '../components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger, } from '../components/ui/dropdown-menu';
import { cn } from '../lib/utils';
import { Moon, Sun } from 'lucide-react';
export function ThemeToggle({ className }) {
    const { theme, setTheme } = useTheme();
    return (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { activityId: "header-theme-toggle", variant: "ghost", size: "icon", "data-testid": "theme-toggle", className: cn('rounded-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground', className), children: [_jsx(Sun, { className: "h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" }), _jsx(Moon, { className: "absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" }), _jsx("span", { className: "sr-only", children: "Toggle theme" })] }) }), _jsx(DropdownMenuContent, { align: "end", children: _jsxs(DropdownMenuRadioGroup, { value: theme, onValueChange: async (theme) => {
                        await setTheme(theme);
                    }, children: [_jsx(DropdownMenuRadioItem, { "data-testid": "theme-toggle-light", className: "focus:bg-sidebar-accent focus:text-sidebar-accent-foreground", value: "light", children: "Light" }), _jsx(DropdownMenuRadioItem, { "data-testid": "theme-toggle-dark", className: "focus:bg-sidebar-accent focus:text-sidebar-accent-foreground", value: "dark", children: "Dark" }), _jsx(DropdownMenuRadioItem, { "data-testid": "theme-toggle-system", className: "focus:bg-sidebar-accent focus:text-sidebar-accent-foreground", value: "system", children: "System" })] }) })] }));
}
//# sourceMappingURL=theme-toggle.js.map