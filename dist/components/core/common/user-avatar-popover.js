'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { getColor } from '../../../lib/core/client/color';
import { isEmpty } from '../../../lib/core/common/isEmpty';
import { format } from 'date-fns';
import { CalendarRange, Mail, MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import tinyColor from 'tinycolor2';
import { showError } from '../../../components/core/common/Notification';
import { getErrorMessage } from '../../../lib/core/common/error';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
export function getAvatarChars(value) {
    if (isEmpty(value))
        return '...';
    const len = value.length;
    let char = '';
    let avatar = '';
    let wordStart = true;
    for (let i = 0; i < len; i++) {
        char = value.charAt(i);
        switch (char) {
            case ' ':
            case '_':
            case '-':
            case '.':
            case '@':
                wordStart = true;
                break;
            default:
                if (wordStart) {
                    avatar += char.toUpperCase();
                    if (avatar.length === 2) {
                        return avatar;
                    }
                    wordStart = false;
                }
                break;
        }
    }
    return avatar;
}
export function UserProfilePopover({ user, children }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'MMM d, yyyy');
        }
        catch (e) {
            showError(getErrorMessage(e));
            return 'N/A';
        }
    };
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const bgcolor = getColor(user.email);
    return (_jsxs(Popover, { open: isOpen, onOpenChange: setIsOpen, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsx("div", { role: "button", className: "pointer-events-none", onMouseEnter: () => {
                        setIsOpen(true);
                    }, children: children }) }), _jsx(PopoverContent, { ref: containerRef, className: "w-80 border-0 bg-transparent p-0", align: "start", onMouseLeave: () => setIsOpen(false), onClick: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }, children: _jsxs(Card, { className: "w-80 overflow-hidden rounded-md border py-0 pb-6", children: [_jsx(CardHeader, { className: "bg-accent pt-6 pb-2", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Avatar, { className: "h-16 w-16 border-2 border-white shadow-sm", children: [_jsx(AvatarImage, { src: user.picture || undefined, alt: user.displayName }), _jsx(AvatarFallback, { style: {
                                                    backgroundColor: bgcolor,
                                                    color: tinyColor.mostReadable(bgcolor, ['#fff', '#000']).toHexString(),
                                                }, className: "text-lg", children: getAvatarChars(user.email) })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("h3", { className: "font-semibold text-lg", children: user.displayName }), _jsxs("span", { className: "text-muted-foreground text-sm", children: ["@", user.userName] }), user.userId && _jsxs("span", { className: "text-muted-foreground text-xs", children: ["ID: ", user.userId] })] })] }) }), _jsx(CardContent, { className: "p-4 pt-0", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Mail, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { className: "text-sm", children: user.email })] }), user.locationName && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { className: "text-sm", children: user.locationName })] })), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CalendarRange, { className: "h-4 w-4 text-muted-foreground" }), _jsxs("span", { className: "text-sm", children: [formatDate(user.startDate), user.endDate ? ` - ${formatDate(user.endDate)}` : ' - Present'] })] })] }) })] }) })] }));
}
//# sourceMappingURL=user-avatar-popover.js.map