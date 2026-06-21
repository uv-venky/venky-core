'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '../components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from '../components/core/hooks/usePathname';
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from '../components/ui/drawer';
import { Comments } from '../components/core/comments/comments';
export function CommentsButton() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    return (_jsxs(Drawer, { open: open, onOpenChange: setOpen, direction: "right", children: [_jsx(DrawerTrigger, { asChild: true, children: _jsxs(Button, { activityId: "header-comments", variant: "ghost", size: "icon", "data-tip": "Comments", className: "rounded-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", children: [_jsx(MessageCircle, { className: "h-[1.2rem] w-[1.2rem]" }), _jsx("span", { className: "sr-only", children: "Comments" })] }) }), _jsxs(DrawerContent, { className: "flex h-full w-2xl max-w-2xl flex-col", title: "Page Comments", children: [_jsx(DrawerTitle, { className: "sr-only", children: "Page Comments" }), _jsx(Comments, { context: "page", contextId: pathname, title: "Page Comments", className: "h-full border-0", enableEmojiReactions: true, enableLike: true })] })] }));
}
//# sourceMappingURL=comments-button.js.map