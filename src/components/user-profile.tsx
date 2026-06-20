'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Moon, Sun, Info, Terminal } from 'lucide-react';
import { useClientSession } from '@/components/core/session-context';
import { Button } from './ui/button';
import useTheme from '@/components/core/hooks/useTheme';
import { useSidebarSafe } from './ui/sidebar';
import AboutDialog from './about-dialog';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { devtoolsStore, openDevtools } from '@/lib/core/client/devtools';
import { useMutation } from '@/lib/core/client/useQuery';
import { FeedbackWidgetMenuItem, FeedbackWidgetMenuItemPanel } from '@/lib/feedback/client/FeedbackWidget';

export function UserProfileDropdown({
  hideThemeToggle = false,
  trigger,
}: {
  hideThemeToggle?: boolean;
  trigger: React.ReactNode;
}) {
  const { setTheme, theme } = useTheme();
  const session = useClientSession();
  const isMobile = useSidebarSafe()?.isMobile ?? false;
  const [showAbout, setShowAbout] = useState(false);
  const devtoolsSnap = useSnapshot(devtoolsStore);
  const signOutMutation = useMutation('signOut');

  if (!session.id) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <FeedbackWidgetMenuItemPanel />
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg border-sidebar-border bg-sidebar text-sidebar-foreground"
        side={isMobile ? 'bottom' : 'right'}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
              <AvatarImage src={session.image ?? undefined} alt={session.name} />
              <AvatarFallback className="rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
                {session.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{session.name}</span>
              <span className="truncate text-xs">{session.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-sidebar-border" />
        <DropdownMenuGroup>
          {/* <DropdownMenuItem className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground">
            <User />
            <Link prefetch={false} prefetch={false} className="w-full" href="/user/profile">
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground">
            <Settings />
            <Link prefetch={false} prefetch={false} className="w-full" href="/user/settings">
              Settings
            </Link>
          </DropdownMenuItem> */}
          {!hideThemeToggle && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                className={`gap-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-sidebar-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0`}
                data-testid="user-menu-theme"
              >
                <Sun className="block dark:hidden" />
                <Moon className="hidden dark:block" />
                Dark mode
              </DropdownMenuSubTrigger>

              <DropdownMenuSubContent className="border-sidebar-border bg-sidebar text-sidebar-foreground">
                <DropdownMenuRadioGroup
                  value={theme}
                  onValueChange={async (theme) => {
                    await setTheme(theme as 'light' | 'dark' | 'system');
                  }}
                >
                  <DropdownMenuRadioItem
                    className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
                    value="light"
                    data-testid="user-menu-theme-light"
                  >
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
                    value="dark"
                    data-testid="user-menu-theme-dark"
                  >
                    Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
                    value="system"
                    data-testid="user-menu-theme-system"
                  >
                    System
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-sidebar-border" />
        {devtoolsSnap.enabled && (
          <DropdownMenuItem
            onClick={() => openDevtools()}
            className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
            data-testid="user-menu-devtools"
          >
            <Terminal />
            Debug Console
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => setShowAbout(true)}
          className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
          data-testid="user-menu-about"
        >
          <Info />
          About
        </DropdownMenuItem>
        <FeedbackWidgetMenuItem />
        <DropdownMenuItem
          onClick={async () => {
            const redirectTo = await signOutMutation();
            window.location.href = redirectTo ?? '/login';
          }}
          className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
          data-testid="user-menu-logout"
        >
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
      {showAbout && <AboutDialog open={showAbout} onOpenChange={setShowAbout} />}
    </DropdownMenu>
  );
}

export function UserProfile({ hideThemeToggle = false }: { hideThemeToggle?: boolean }) {
  const session = useClientSession();
  if (!session.id) {
    return null;
  }
  return (
    <UserProfileDropdown
      hideThemeToggle={hideThemeToggle}
      trigger={
        <Button
          size="icon"
          variant="ghost"
          className="feedback-mask shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          data-testid="header-user-menu"
        >
          <Avatar className="h-8 w-8 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
            <AvatarImage src={session.image ?? undefined} alt={session.name} />
            <AvatarFallback className="rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
              {session.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      }
    />
  );
}
