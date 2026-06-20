'use client';

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import * as React from 'react';
import { proxy, useSnapshot } from 'valtio';
import { useMediaQuery } from './core/hooks/useMediaQuery';
import { useRouter } from './core/hooks/useRouter';
import { Fragment } from 'react';
import clientLogger from '@/lib/core/client/client-logger';

type BreadcrumbEntry = {
  title: string;
  href?: string;
};

export const breadcrumbsState = proxy<{
  breadcrumbs: BreadcrumbEntry[];
}>({
  breadcrumbs: [],
});

const ITEMS_TO_DISPLAY = 3;

export default function Breadcrumbs() {
  const { breadcrumbs } = useSnapshot(breadcrumbsState);
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const router = useRouter();

  if (breadcrumbs.length === 0) {
    return null;
  }

  const lastItems = breadcrumbs.slice(-ITEMS_TO_DISPLAY + 1);

  return (
    <Breadcrumb>
      <div className="flex items-center gap-2">
        <BreadcrumbList className="flex-nowrap">
          {lastItems.length < breadcrumbs.length && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink
                  className="cursor-pointer whitespace-nowrap hover:text-sidebar-foreground"
                  onClick={() => {
                    breadcrumbsState.breadcrumbs = [];
                    clientLogger.logActivity({
                      eventType: 'Breadcrumb Click',
                      eventId: breadcrumbs[0].title ?? 'unknown',
                      metadata: {
                        href: breadcrumbs[0].href ?? '',
                        size: breadcrumbs.length,
                        from: 'home',
                      },
                      pageUrl: window.location.pathname,
                    });
                    router.push(breadcrumbs[0].href ?? '');
                  }}
                >
                  {breadcrumbs[0].title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          {breadcrumbs.length > ITEMS_TO_DISPLAY ? (
            <>
              <BreadcrumbItem className="hover:text-sidebar-foreground">
                {isDesktop ? (
                  <DropdownMenu open={open} onOpenChange={setOpen}>
                    <DropdownMenuTrigger className="flex cursor-pointer items-center gap-1" aria-label="Toggle menu">
                      <BreadcrumbEllipsis className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {breadcrumbs.slice(1, -ITEMS_TO_DISPLAY + 1).map(({ href, title }) => (
                        <DropdownMenuItem
                          key={href}
                          onClick={() => {
                            if (!href) {
                              return;
                            }
                            const index = breadcrumbs.findIndex((item) => item.href === href && item.title === title);
                            breadcrumbsState.breadcrumbs = breadcrumbs.slice(0, index + 1);
                            clientLogger.logActivity({
                              eventType: 'breadcrumb_click',
                              eventId: title ?? 'unknown',
                              metadata: {
                                href,
                                size: breadcrumbs.length,
                                from: 'dropdown',
                              },
                              pageUrl: window.location.pathname,
                            });
                            router.push(href);
                          }}
                        >
                          {title}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Drawer open={open} onOpenChange={setOpen}>
                    <DrawerTrigger aria-label="Toggle Menu">
                      <BreadcrumbEllipsis className="h-4 w-4" />
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader className="text-left">
                        <DrawerTitle>Navigate to</DrawerTitle>
                        <DrawerDescription>Select a page to navigate to.</DrawerDescription>
                      </DrawerHeader>
                      <div className="grid gap-1 px-4">
                        {breadcrumbs.slice(1, -ITEMS_TO_DISPLAY + 1).map((item) => (
                          <button
                            type="button"
                            key={item.href ?? item.title}
                            onClick={() => {
                              if (!item.href) {
                                return;
                              }
                              clientLogger.logActivity({
                                eventType: 'Breadcrumb Click',
                                eventId: item.title ?? 'unknown',
                                metadata: {
                                  href: item.href,
                                  size: breadcrumbs.length,
                                  from: 'drawer',
                                },
                                pageUrl: window.location.pathname,
                              });
                              router.push(item.href);
                            }}
                          >
                            {item.title}
                          </button>
                        ))}
                      </div>
                      <DrawerFooter className="pt-4">
                        <DrawerClose asChild>
                          <Button variant="outline">Close</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                )}
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          ) : null}
          {lastItems.map(({ href, title }, index) => (
            <Fragment key={href}>
              <BreadcrumbItem>
                {href && href !== '#' && lastItems.length !== index + 1 ? (
                  <BreadcrumbLink
                    className="max-w-20 cursor-pointer truncate text-sidebar-foreground/50 hover:text-sidebar-foreground md:max-w-none"
                    onClick={() => {
                      const index = breadcrumbs.findIndex((item) => item.href === href && item.title === title);
                      breadcrumbsState.breadcrumbs = breadcrumbs.slice(0, index + 1);

                      clientLogger.logActivity({
                        eventType: 'Breadcrumb Click',
                        eventId: title ?? 'unknown',
                        metadata: {
                          href,
                          size: breadcrumbs.length,
                          from: 'last_item',
                        },
                        pageUrl: window.location.pathname,
                      });

                      router.push(href);
                    }}
                  >
                    {title}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="max-w-20 truncate text-sidebar-foreground md:max-w-none">
                    {title}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < lastItems.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </div>
    </Breadcrumb>
  );
}
