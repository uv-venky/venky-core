/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { CommentsButton } from '@/components/comments-button';
import { ShareUrlButton } from '@/components/share-url-button';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserProfile } from '@/components/user-profile';

export function PageHeaderActions({
  enableShareUrl = false,
  enableComments = false,
  showThemeToggle = false,
  showUserProfile = false,
}: Readonly<{
  enableShareUrl?: boolean;
  enableComments?: boolean;
  showThemeToggle?: boolean;
  showUserProfile?: boolean;
}>) {
  return (
    <>
      {enableComments && <CommentsButton />}
      {enableShareUrl && <ShareUrlButton />}
      {showThemeToggle && <ThemeToggle />}
      {showUserProfile && <UserProfile hideThemeToggle={!showThemeToggle} />}
    </>
  );
}
