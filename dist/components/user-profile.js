'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
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
} from '../components/ui/dropdown-menu';
import { LogOut, Moon, Sun, Info, Terminal } from 'lucide-react';
import { useClientSession } from '../components/core/session-context';
import { Button } from './ui/button';
import useTheme from '../components/core/hooks/useTheme';
import { useSidebarSafe } from './ui/sidebar';
import AboutDialog from './about-dialog';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { devtoolsStore, openDevtools } from '../lib/core/client/devtools';
import { useMutation } from '../lib/core/client/useQuery';
export function UserProfileDropdown({ hideThemeToggle = false, trigger }) {
  const { setTheme, theme } = useTheme();
  const session = useClientSession();
  const isMobile = useSidebarSafe()?.isMobile ?? false;
  const [showAbout, setShowAbout] = useState(false);
  const devtoolsSnap = useSnapshot(devtoolsStore);
  const signOutMutation = useMutation('signOut');
  if (!session.id) {
    return null;
  }
  return _jsxs(DropdownMenu, {
    children: [
      _jsx(DropdownMenuTrigger, { asChild: true, children: trigger }),
      _jsxs(DropdownMenuContent, {
        className:
          'w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg border-sidebar-border bg-sidebar text-sidebar-foreground',
        side: isMobile ? 'bottom' : 'right',
        align: 'end',
        sideOffset: 4,
        children: [
          _jsx(DropdownMenuLabel, {
            className: 'p-0 font-normal',
            children: _jsxs('div', {
              className: 'flex items-center gap-2 px-1 py-1.5 text-left text-sm',
              children: [
                _jsxs(Avatar, {
                  className: 'h-8 w-8 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground',
                  children: [
                    _jsx(AvatarImage, { src: session.image ?? undefined, alt: session.name }),
                    _jsx(AvatarFallback, {
                      className: 'rounded-lg bg-sidebar-accent text-sidebar-accent-foreground',
                      children: session.name.charAt(0).toUpperCase(),
                    }),
                  ],
                }),
                _jsxs('div', {
                  className: 'grid flex-1 text-left text-sm leading-tight',
                  children: [
                    _jsx('span', { className: 'truncate font-medium', children: session.name }),
                    _jsx('span', { className: 'truncate text-xs', children: session.email }),
                  ],
                }),
              ],
            }),
          }),
          _jsx(DropdownMenuSeparator, { className: 'bg-sidebar-border' }),
          _jsx(DropdownMenuGroup, {
            children:
              !hideThemeToggle &&
              _jsxs(DropdownMenuSub, {
                children: [
                  _jsxs(DropdownMenuSubTrigger, {
                    className: `gap-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-sidebar-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0`,
                    'data-testid': 'user-menu-theme',
                    children: [
                      _jsx(Sun, { className: 'block dark:hidden' }),
                      _jsx(Moon, { className: 'hidden dark:block' }),
                      'Dark mode',
                    ],
                  }),
                  _jsx(DropdownMenuSubContent, {
                    className: 'border-sidebar-border bg-sidebar text-sidebar-foreground',
                    children: _jsxs(DropdownMenuRadioGroup, {
                      value: theme,
                      onValueChange: async (theme) => {
                        await setTheme(theme);
                      },
                      children: [
                        _jsx(DropdownMenuRadioItem, {
                          className: 'focus:bg-sidebar-accent focus:text-sidebar-accent-foreground',
                          value: 'light',
                          'data-testid': 'user-menu-theme-light',
                          children: 'Light',
                        }),
                        _jsx(DropdownMenuRadioItem, {
                          className: 'focus:bg-sidebar-accent focus:text-sidebar-accent-foreground',
                          value: 'dark',
                          'data-testid': 'user-menu-theme-dark',
                          children: 'Dark',
                        }),
                        _jsx(DropdownMenuRadioItem, {
                          className: 'focus:bg-sidebar-accent focus:text-sidebar-accent-foreground',
                          value: 'system',
                          'data-testid': 'user-menu-theme-system',
                          children: 'System',
                        }),
                      ],
                    }),
                  }),
                ],
              }),
          }),
          _jsx(DropdownMenuSeparator, { className: 'bg-sidebar-border' }),
          devtoolsSnap.enabled &&
            _jsxs(DropdownMenuItem, {
              onClick: () => openDevtools(),
              className: 'focus:bg-sidebar-accent focus:text-sidebar-accent-foreground',
              'data-testid': 'user-menu-devtools',
              children: [_jsx(Terminal, {}), 'Debug Console'],
            }),
          _jsxs(DropdownMenuItem, {
            onClick: () => setShowAbout(true),
            className: 'focus:bg-sidebar-accent focus:text-sidebar-accent-foreground',
            'data-testid': 'user-menu-about',
            children: [_jsx(Info, {}), 'About'],
          }),
          _jsxs(DropdownMenuItem, {
            onClick: async () => {
              const redirectTo = await signOutMutation();
              window.location.href = redirectTo ?? '/login';
            },
            className: 'focus:bg-sidebar-accent focus:text-sidebar-accent-foreground',
            'data-testid': 'user-menu-logout',
            children: [_jsx(LogOut, {}), 'Log out'],
          }),
        ],
      }),
      showAbout && _jsx(AboutDialog, { open: showAbout, onOpenChange: setShowAbout }),
    ],
  });
}
export function UserProfile({ hideThemeToggle = false }) {
  const session = useClientSession();
  if (!session.id) {
    return null;
  }
  return _jsx(UserProfileDropdown, {
    hideThemeToggle: hideThemeToggle,
    trigger: _jsx(Button, {
      size: 'icon',
      variant: 'ghost',
      className:
        'shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground',
      'data-testid': 'header-user-menu',
      children: _jsxs(Avatar, {
        className: 'h-8 w-8 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground',
        children: [
          _jsx(AvatarImage, { src: session.image ?? undefined, alt: session.name }),
          _jsx(AvatarFallback, {
            className: 'rounded-lg bg-sidebar-accent text-sidebar-accent-foreground',
            children: session.name.charAt(0).toUpperCase(),
          }),
        ],
      }),
    }),
  });
}
//# sourceMappingURL=user-profile.js.map
