'use client';

import { WaveDots } from '@/components/core/common/WaveDots';
import { useIsStoreLoading } from '@/components/core/hooks/useStoreHooks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserAvatar as UserAvatarType } from '@/lib/common/ds/types/core/UserAvatar';
import { getColor } from '@/lib/core/client/color';
import { putUserAvatar, useUserAvatar } from '@/lib/core/client/state';
import { useStore } from '@/lib/core/client/store';
import { useEffect } from 'react';
import tinyColor from 'tinycolor2';
import { getAvatarChars, UserProfilePopover } from '@/components/core/common/user-avatar-popover';
import { PopoverAnchor } from '@/components/ui/popover';

export function useUserAvatarStore() {
  return useStore<UserAvatarType>({
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

export default function UserAvatar({
  userId,
  userName,
  showDisplayName = true,
  showEmail = true,
  showImage = true,
}: {
  userId?: number | null;
  userName?: string | null;
  showDisplayName?: boolean;
  showImage?: boolean;
  showEmail?: boolean;
}) {
  const store = useUserAvatarStore();
  const loading = useIsStoreLoading(store);
  const userAvatar = useUserAvatar(userId ?? userName ?? '');

  useEffect(() => {
    if (loading) return;
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
            } else {
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
    return (
      <Avatar className="border-2 border-white shadow-sm">
        <AvatarFallback>
          <WaveDots active />
        </AvatarFallback>
      </Avatar>
    );
  }
  const bgcolor = getColor(userAvatar.email);

  return (
    <UserProfilePopover user={userAvatar}>
      <div className="pointer-events-auto flex items-center gap-2">
        {showImage && (
          <PopoverAnchor>
            <Avatar className="size-5">
              <AvatarImage src={userAvatar.picture ?? undefined} />
              <AvatarFallback
                className="text-[9px]"
                style={{
                  backgroundColor: bgcolor,
                  color: tinyColor.mostReadable(bgcolor, ['#fff', '#000']).toHexString(),
                }}
                // data-tip={userAvatar.email}
              >
                {getAvatarChars(userAvatar.email)}
              </AvatarFallback>
            </Avatar>
          </PopoverAnchor>
        )}
        {(showDisplayName || showEmail) && (
          <div className="flex flex-col">
            {showDisplayName && <span className="font-medium text-sm">{userAvatar.displayName}</span>}
            {showEmail && <span className="text-muted-foreground text-xs">{userAvatar.email}</span>}
          </div>
        )}
      </div>
    </UserProfilePopover>
  );
}
