'use client';
import { LayoutDashboard, Briefcase, UserCircle, Settings } from 'lucide-react';

import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export function SideNavMain() {
  const pathname = usePathname();
  const t = useTranslations('sidebar');

  const menuItems = {
    [t('menu')]: [
      { href: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
      { href: '/dashboard/jobs', icon: Briefcase, label: t('jobs') },
      { href: '/dashboard/profile', icon: UserCircle, label: t('profile') },
    ],
    [t('more')]: [{ href: '/dashboard/settings', icon: Settings, label: t('settings') }],
  };

  return (
    <>
      {Object.entries(menuItems).map(([groupLabel, items]) => (
        <SidebarGroup key={groupLabel}>
          <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
          <SidebarMenu>
            {items.map(({ href, icon: Icon, label }) => {
              const isActive =
                href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname === href || pathname.startsWith(`${href}/`);

              return (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(isActive && 'bg-accent text-accent-foreground font-medium')}
                  >
                    <Link href={href} prefetch={true}>
                      <Icon className={cn(isActive && 'text-primary')} />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
