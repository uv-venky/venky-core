'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { ChevronsUpDown } from 'lucide-react';
import { useClientSession } from '@/components/core/session-context';
import { UserProfileDropdown } from '../user-profile';
export function NavUser() {
  const session = useClientSession();

  if (!session.id) {
    return null;
  }

  return (
    <SidebarMenu className="bg-sidebar text-sidebar-foreground">
      <SidebarMenuItem>
        <UserProfileDropdown
          trigger={
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              data-testid="sidebar-user-menu"
            >
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
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          }
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
