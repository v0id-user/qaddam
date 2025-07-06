'use client';
import { LayoutDashboard, Briefcase, UserCircle, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export interface MenuItemConfig {
  href: string;
  icon: LucideIcon;
  label?: string;
  translationKey?: string;
}

export interface MenuGroupConfig {
  groupLabel?: string;
  groupTranslationKey?: string;
  items: MenuItemConfig[];
}

interface SideNavMainProps {
  customMenuItems?: MenuGroupConfig[];
  showDefaultMenu?: boolean;
}

export function SideNavMain({ customMenuItems, showDefaultMenu = true }: SideNavMainProps) {
  const pathname = usePathname();
  const t = useTranslations('sidebar');

  const defaultMenuItems: MenuGroupConfig[] = [
    {
      groupTranslationKey: 'menu',
      items: [
        { href: '/dashboard', icon: LayoutDashboard, translationKey: 'dashboard' },
        { href: '/dashboard/jobs', icon: Briefcase, translationKey: 'jobs' },
        { href: '/dashboard/profile', icon: UserCircle, translationKey: 'profile' },
      ],
    },
    {
      groupTranslationKey: 'more',
      items: [
        { href: '/dashboard/settings', icon: Settings, translationKey: 'settings' }
      ],
    },
  ];

  const menuItems = showDefaultMenu ? defaultMenuItems : [];
  const allMenuItems = [...menuItems, ...(customMenuItems || [])];

  return (
    <>
      {allMenuItems.map((group, groupIndex) => {
        const groupLabel = group.groupLabel || (group.groupTranslationKey ? t(group.groupTranslationKey) : '');
        
        return (
          <SidebarGroup key={groupIndex}>
            {groupLabel && <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item, itemIndex) => {
                  const label = item.label || (item.translationKey ? t(item.translationKey) : '');
                  const isActive =
                    item.href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <SidebarMenuItem key={`${groupIndex}-${itemIndex}`}>
                      <SidebarMenuButton
                        asChild
                        className={cn(isActive && 'bg-accent text-accent-foreground font-medium')}
                      >
                        <Link href={item.href} prefetch={true}>
                          <item.icon className={cn(isActive && 'text-primary')} />
                          <span>{label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        );
      })}
    </>
  );
}
