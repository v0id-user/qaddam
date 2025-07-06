'use client';
import React from 'react';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { SideNavMain } from './sidebar-navs/mainNav';
import { SideNavFooter } from './sidebar-navs/footNav';
import { useLocale } from 'next-intl';

interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}

export function DashboardSidebar({ user, ...props }: DashboardSidebarProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <Sidebar 
      collapsible="offcanvas" 
      className={`text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`} 
      {...props}
    >
      {/* Main Menu */}
      <SidebarContent>
        <SideNavMain />
      </SidebarContent>

      {/* User Dropdown Menu */}
      <SideNavFooter user={user} />
    </Sidebar>
  );
}
