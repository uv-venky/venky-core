'use client';

import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from '@/components/core/hooks/usePathname';
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Comments } from '@/components/core/comments/comments';

export function CommentsButton() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerTrigger asChild>
        <Button
          activityId="header-comments"
          variant="ghost"
          size="icon"
          data-tip="Comments"
          className="rounded-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <MessageCircle className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Comments</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="flex h-full w-2xl max-w-2xl flex-col" title="Page Comments">
        <DrawerTitle className="sr-only">Page Comments</DrawerTitle>
        <Comments
          context="page"
          contextId={pathname}
          title="Page Comments"
          className="h-full border-0"
          enableEmojiReactions
          enableLike
        />
      </DrawerContent>
    </Drawer>
  );
}
