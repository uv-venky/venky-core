'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { WaveDots } from '../../../components/core/common/WaveDots';
import { useIsStoreLoading } from '../../../components/core/hooks/useStoreHooks';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { getColor } from '../../../lib/core/client/color';
import { putUserAvatar, useUserAvatar } from '../../../lib/core/client/state';
import { useStore } from '../../../lib/core/client/store';
import { useEffect } from 'react';
import tinyColor from 'tinycolor2';
import { getAvatarChars, UserProfilePopover } from '../../../components/core/common/user-avatar-popover';
import { PopoverAnchor } from '../../../components/ui/popover';
export function useUserAvatarStore() {
    return useStore({
        datasourceId: 'UserAvatar',
        page: 'user-avatar-page',
        alias: 'user-avatar-all',
        limit: 1,
        onInitialized: async (store) => {
            await store.executeQuery({
                query: { limit: 200 },
            });
            const rows = store.dbList();
            for (const row of rows) {
                if (row.userId != null) {
                    putUserAvatar(row.userId, row);
                }
                putUserAvatar(row.userName, row);
            }
        },
    });
}
export default function UserAvatar({ userId, userName, showDisplayName = true, showEmail = true, showImage = true, }) {
    const store = useUserAvatarStore();
    const loading = useIsStoreLoading(store);
    const userAvatar = useUserAvatar(userId ?? userName ?? '');
    useEffect(() => {
        if (loading)
            return;
        if ('isLoading' in userAvatar) {
            if (userId != null || userName != null) {
                store.executeQuery({
                    query: {
                        data: {
                            userId: userId ?? undefined,
                            userName: userName ?? undefined,
                        },
                    },
                    handleResponse: (rows) => {
                        if (rows.length > 0) {
                            putUserAvatar(userId ?? userName ?? '', rows[0]);
                        }
                        else {
                            putUserAvatar(userId ?? userName ?? '', {
                                userName: String(userId ?? userName ?? 'unknown'),
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
        }
    }, [userAvatar, loading, userId, userName, store]);
    if (loading || 'isLoading' in userAvatar) {
        return (_jsx(Avatar, { className: "border-2 border-white shadow-sm", children: _jsx(AvatarFallback, { children: _jsx(WaveDots, { active: true }) }) }));
    }
    const bgcolor = getColor(userAvatar.email);
    return (_jsx(UserProfilePopover, { user: userAvatar, children: _jsxs("div", { className: "pointer-events-auto flex items-center gap-2", children: [showImage && (_jsx(PopoverAnchor, { children: _jsxs(Avatar, { className: "size-5", children: [_jsx(AvatarImage, { src: userAvatar.picture ?? undefined }), _jsx(AvatarFallback, { className: "text-[9px]", style: {
                                    backgroundColor: bgcolor,
                                    color: tinyColor.mostReadable(bgcolor, ['#fff', '#000']).toHexString(),
                                }, children: getAvatarChars(userAvatar.email) })] }) })), (showDisplayName || showEmail) && (_jsxs("div", { className: "flex flex-col", children: [showDisplayName && _jsx("span", { className: "font-medium text-sm", children: userAvatar.displayName }), showEmail && _jsx("span", { className: "text-muted-foreground text-xs", children: userAvatar.email })] }))] }) }));
}
//# sourceMappingURL=user-avatar.js.map