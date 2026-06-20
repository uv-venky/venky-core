'use client';

import * as React from 'react';
import { Tabs as TabsPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';
import clientLogger from '@/lib/core/client/client-logger';
import { useIsUserLoggedIn } from '@/components/core/session-context';

function Tabs({ className, onValueChange, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const isLoggedIn = useIsUserLoggedIn();
  const handleValueChange = React.useCallback(
    (value: string) => {
      isLoggedIn &&
        clientLogger.logActivity({
          eventType: 'Tab Change',
          eventId: value,
          pageUrl: window.location.pathname,
        });
      onValueChange?.(value);
    },
    [onValueChange, isLoggedIn],
  );

  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-2', className)}
      {...props}
      onValueChange={handleValueChange}
    />
  );
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        `inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md px-2 py-1 font-medium text-sm transition-[color,box-shadow] focus-visible:border-ring focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:dark:shadow-dark [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0`,
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn('flex-1 outline-none', className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
