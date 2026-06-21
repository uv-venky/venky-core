'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Badge } from '../../../components/ui/badge';
import { useUserAvatarStore } from '../../../components/core/common/user-avatar';
import { useUserAvatar, putUserAvatar } from '../../../lib/core/client/state';
import { useIsStoreLoading } from '../../../components/core/hooks/useStoreHooks';
import { getAvatarChars } from '../../../components/core/common/user-avatar-popover';
import { cn } from '../../../lib/utils';
export default function UserDisplayBadge({ username, onClick, className, variant = 'secondary', }) {
    const store = useUserAvatarStore();
    const loading = useIsStoreLoading(store);
    const userAvatar = useUserAvatar(username);
    useEffect(() => {
        if (loading)
            return;
        if ('isLoading' in userAvatar) {
            store.executeQuery({
                query: { data: { userName: username }, limit: 1 },
                handleResponse: (rows) => {
                    const row = rows[0];
                    if (row) {
                        putUserAvatar(username, row);
                    }
                    else {
                        putUserAvatar(username, {
                            userName: String(username),
                            displayName: 'Unknown',
                            email: 'unknown',
                            picture: undefined,
                            startDate: new Date().toISOString(),
                            endDate: undefined,
                        });
                    }
                },
            });
        }
    }, [userAvatar, loading, username, store]);
    if (loading || 'isLoading' in userAvatar) {
        return (_jsx(Badge, { variant: variant, className: className, children: "..." }));
    }
    return (_jsx(Badge, { "data-tip": userAvatar.displayName, role: "button", onClick: onClick, variant: variant, className: cn(className, onClick && 'cursor-pointer'), children: getAvatarChars(userAvatar.displayName) }));
}
//# sourceMappingURL=user-display-badge.js.map