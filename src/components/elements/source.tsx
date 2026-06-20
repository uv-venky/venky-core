'use client';

import { BookOpenTextIcon, ChevronDownIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/chat/utils';

export type SourcesProps = ComponentProps<'div'>;

export const Sources = ({ className, ...props }: SourcesProps) => (
  <Collapsible className={cn('not-prose mb-4 text-primary text-xs', className)} {...props} />
);

export type SourcesTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  count: number;
};

export const SourcesTrigger = ({ className, count, children, ...props }: SourcesTriggerProps) => (
  <CollapsibleTrigger className="flex items-center gap-2" {...props}>
    {children ?? (
      <>
        <p className="font-medium">Used {count} sources</p>
        <ChevronDownIcon className="size-4" />
      </>
    )}
  </CollapsibleTrigger>
);

export type SourcesContentProps = ComponentProps<typeof CollapsibleContent>;

export const SourcesContent = ({ className, ...props }: SourcesContentProps) => (
  <CollapsibleContent
    className={cn(
      'mt-3 flex w-fit flex-col gap-2',
      'data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 outline-hidden data-[state=closed]:animate-out data-[state=open]:animate-in',
      className,
    )}
    {...props}
  />
);

export type SourceProps = ComponentProps<'a'> & {
  page?: string;
};

export const Source = ({ title, page }: SourceProps) => (
  <button
    className="inline-flex cursor-pointer items-center gap-2 border-0 text-muted-foreground text-sm hover:text-blue-500 hover:underline"
    onClick={(e) => {
      e.preventDefault();
    }}
    type="button"
  >
    <BookOpenTextIcon className="size-3" />
    <span className="block">{title}</span>
    {page && <span className="block">Page {page}</span>}
  </button>
);
