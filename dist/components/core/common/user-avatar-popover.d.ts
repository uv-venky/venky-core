import type { UserAvatar } from '../../../lib/common/ds/types/core/UserAvatar';
import type React from 'react';
export declare function getAvatarChars(value?: string | null): string;
interface UserProfilePopoverProps {
    user: UserAvatar;
    children: React.ReactNode;
}
export declare function UserProfilePopover({ user, children }: UserProfilePopoverProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=user-avatar-popover.d.ts.map