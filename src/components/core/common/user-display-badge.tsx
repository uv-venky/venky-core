'use client';

import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import type { badgeVariants } from '@/components/ui/badge';
import { useUserAvatarStore } from '@/components/core/common/user-avatar';
import { useUserAvatar, putUserAvatar } from '@/lib/core/client/state';
import { useIsStoreLoading } from '@/components/core/hooks/useStoreHooks';
import type { VariantProps } from 'class-variance-authority';
import { getAvatarChars } from '@/components/core/common/user-avatar-popover';
import { cn } from '@/lib/utils';

interface UserDisplayBadgeProps {
  username: string;
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
  className?: string;
  variant?: VariantProps<typeof badgeVariants>['variant'];
}

export default function UserDisplayBadge({
  username,
  onClick,
  className,
  variant = 'secondary',
}: UserDisplayBadgeProps) {
  const store = useUserAvatarStore();
  const loading = useIsStoreLoading(store);
  const userAvatar = useUserAvatar(username);

  useEffect(() => {
    if (loading) return;
    if ('isLoading' in userAvatar) {
      store.executeQuery({
        query: { data: { userName: username }, limit: 1 },
        handleResponse: (rows) => {
          const row = rows[0];
          if (row) {
            putUserAvatar(username, row);
          } else {
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
    return (
      <Badge variant={variant} className={className}>
        ...
      </Badge>
    );
  }

  return (
    <Badge
      data-tip={userAvatar.displayName}
      role="button"
      onClick={onClick}
      variant={variant}
      className={cn(className, onClick && 'cursor-pointer')}
    >
      {getAvatarChars(userAvatar.displayName)}
    </Badge>
  );
}
