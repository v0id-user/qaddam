import React from 'react';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { SideNavMain } from './sidebar-navs/mainNav';
import { SideNavFooter } from './sidebar-navs/footNav';

interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
  organizationName: string;
  user: {
    name: string;
    email: string;
    avatar: string;
    userId: string;
  };
}

export function DashboardSidebar({ organizationName, user, ...props }: DashboardSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" className="text-muted-foreground" {...props}>
      {/* Main Menu */}
      <SidebarContent>
        <SideNavMain />
      </SidebarContent>

      {/* User Dropdown Menu */}
      <SideNavFooter user={user} />
    </Sidebar>
  );
}
