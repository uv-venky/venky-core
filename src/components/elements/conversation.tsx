'use client';

import { ArrowDownIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { useCallback } from 'react';
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/chat/utils';

type ConversationProps = ComponentProps<typeof StickToBottom>;

export const Conversation = ({ className, ...props }: ConversationProps) => (
  <StickToBottom
    className={cn('relative flex-1 touch-pan-y overflow-y-auto will-change-scroll', className)}
    initial="smooth"
    resize="smooth"
    role="log"
    {...props}
  />
);

type ConversationContentProps = ComponentProps<typeof StickToBottom.Content>;

export const ConversationContent = ({ className, style, ...props }: ConversationContentProps) => (
  <StickToBottom.Content
    className={cn('[&>div:first-child]:!min-h-full [&>div:first-child]:!h-auto p-4', className)}
    style={style}
    {...props}
  />
);

type ConversationScrollButtonProps = ComponentProps<typeof Button>;

export const ConversationScrollButton = ({ className, ...props }: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    !isAtBottom && (
      <Button
        className={cn('absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full shadow-lg', className)}
        onClick={handleScrollToBottom}
        size="icon"
        type="button"
        variant="outline"
        {...props}
      >
        <ArrowDownIcon className="size-4" />
      </Button>
    )
  );
};
