'use client';

import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { SideNavMain } from '@/components/dashboard/sidebar-navs/mainNav';
import { SideNavFooter } from '@/components/dashboard/sidebar-navs/footNav';
import type { MenuGroupConfig } from '@/components/dashboard/sidebar-navs/mainNav';
import type { UserMenuGroupConfig } from '@/components/dashboard/sidebar-navs/footNav';
import { FileText, Calendar, Star, HelpCircle } from 'lucide-react';

interface ClientDashboardProps {
  user: {
    name: string;
    email: string;
    avatar: string;
    userId: string;
  };
  organizationName: string;
  customMainMenuItems?: MenuGroupConfig[];
  customUserMenuItems?: UserMenuGroupConfig[];
}

export function ClientDashboard({ 
  user, 
  organizationName, 
  customMainMenuItems, 
  customUserMenuItems 
}: ClientDashboardProps) {
  // Example custom menu items that can be injected from client
  const exampleCustomMainMenu: MenuGroupConfig[] = [
    {
      groupLabel: 'Custom Tools',
      items: [
        { href: '/dashboard/reports', icon: FileText, label: 'Reports' },
        { href: '/dashboard/calendar', icon: Calendar, label: 'Calendar' },
        { href: '/dashboard/favorites', icon: Star, label: 'Favorites' },
      ],
    },
  ];

  const exampleCustomUserMenu: UserMenuGroupConfig[] = [
    {
      groupLabel: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help Center',
          onClick: () => {
            window.open('https://help.example.com', '_blank');
          },
        },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar
        organizationName={organizationName}
        user={user}
        className="border-r"
      />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
          
          <div className="grid gap-6">
            <div className="p-6 border rounded-lg">
              <h2 className="text-lg font-medium mb-4">Navigation Components Usage</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Main Navigation with Custom Items</h3>
                  <div className="p-4 bg-muted rounded-lg">
                    <SideNavMain 
                      customMenuItems={customMainMenuItems || exampleCustomMainMenu}
                      showDefaultMenu={true}
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">User Menu with Custom Items</h3>
                  <div className="p-4 bg-muted rounded-lg">
                    <SideNavFooter 
                      user={user}
                      customMenuItems={customUserMenuItems || exampleCustomUserMenu}
                      showDefaultMenu={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
