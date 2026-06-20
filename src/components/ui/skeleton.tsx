import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      data-testid="skeleton"
      className={cn('animate-pulse rounded-md bg-primary/10 dark:bg-primary/50', className)}
      {...props}
    />
  );
}

export { Skeleton };
