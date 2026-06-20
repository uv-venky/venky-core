'use client';

import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/chat/utils';

type SuggestionsProps = ComponentProps<typeof ScrollArea>;

export const Suggestions = ({ className, children, ...props }: SuggestionsProps) => (
  <ScrollArea className="w-full overflow-x-auto whitespace-nowrap" {...props}>
    <div className={cn('flex w-max flex-nowrap items-center gap-2', className)}>{children}</div>
    <ScrollBar className="hidden" orientation="horizontal" />
  </ScrollArea>
);

type SuggestionProps = Omit<ComponentProps<typeof Button>, 'onClick'> & {
  suggestion: string | { label: string; text: string };
  onClick?: (suggestion: string, label?: string) => void;
};

export const Suggestion = ({
  suggestion,
  onClick,
  className,
  variant = 'outline',
  size = 'sm',
  children,
  ...props
}: SuggestionProps) => {
  const handleClick = () => {
    onClick?.(
      typeof suggestion === 'string' ? suggestion : suggestion.text,
      typeof suggestion === 'string' ? undefined : suggestion.label,
    );
  };

  return (
    <Button
      className={cn('cursor-pointer rounded-full px-4', className)}
      onClick={handleClick}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {children || (typeof suggestion === 'string' ? suggestion : suggestion.label)}
    </Button>
  );
};
