'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Smile } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Theme } from 'emoji-picker-react';
import useTheme from '../../../components/core/hooks/useTheme';
import { lazy } from 'react';
const EmojiPicker = lazy(() => import('emoji-picker-react'));
export function CustomEmojiPicker({ onEmojiSelect, trigger, size = 'default' }) {
    const [isOpen, setIsOpen] = useState(false);
    const { theme } = useTheme();
    const handleEmojiClick = (emojiData) => {
        onEmojiSelect(emojiData.emoji);
        setIsOpen(false);
    };
    const defaultTrigger = (_jsxs(Button, { size: size, variant: "ghost", className: `${size === 'sm' ? 'h-7 px-2' : 'h-7 px-2'} text-muted-foreground hover:text-foreground`, children: [_jsx(Smile, { className: "mr-1 h-3 w-3" }), size !== 'sm' && _jsx("span", { className: "text-xs", children: "React" })] }));
    return (_jsxs(Popover, { open: isOpen, onOpenChange: setIsOpen, children: [_jsx(PopoverTrigger, { asChild: true, children: trigger || defaultTrigger }), _jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: _jsx(EmojiPicker, { onEmojiClick: handleEmojiClick, autoFocusSearch: true, theme: theme === 'dark' ? Theme.DARK : Theme.LIGHT, height: 400, width: 350, previewConfig: {
                        showPreview: false,
                    }, skinTonesDisabled: true, searchDisabled: false }) })] }));
}
//# sourceMappingURL=emoji-picker.js.map