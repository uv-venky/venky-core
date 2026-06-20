'use client';

import useTheme from '@/components/core/hooks/useTheme';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          activityId="header-theme-toggle"
          variant="ghost"
          size="icon"
          data-testid="theme-toggle"
          className={cn('rounded-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground', className)}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={async (theme) => {
            await setTheme(theme as 'light' | 'dark' | 'system');
          }}
        >
          <DropdownMenuRadioItem
            data-testid="theme-toggle-light"
            className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
            value="light"
          >
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            data-testid="theme-toggle-dark"
            className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
            value="dark"
          >
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            data-testid="theme-toggle-system"
            className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
            value="system"
          >
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
