import type * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, rows, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      rows={rows}
      className={cn(
        'flex w-full resize-none overflow-y-auto rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:ring-destructive/40',
        /* `field-sizing-content` ignores `rows`; use fixed sizing so `rows` controls height. */
        rows == null ? 'field-sizing-content h-24' : 'field-sizing-fixed',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
