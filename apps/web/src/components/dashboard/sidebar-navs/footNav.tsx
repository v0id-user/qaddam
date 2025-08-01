'use client';

import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreVerticalIcon, CreditCardIcon, LogOutIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuthActions } from '@convex-dev/auth/react';
import { useTranslations, useLocale } from 'next-intl';
import posthog from 'posthog-js';
import { useLogger } from '@/lib/axiom/client';
import { CustomerPortalLink } from '@convex-dev/polar/react';
import { api } from '@qaddam/backend/convex/_generated/api';
import { useRouter } from 'next/navigation';

export interface UserMenuItemConfig {
  icon: LucideIcon;
  label?: string;
  translationKey?: string;
  onClick: () => void | Promise<void>;
}

export interface UserMenuGroupConfig {
  groupLabel?: string;
  groupTranslationKey?: string;
  items: UserMenuItemConfig[];
}

interface SideNavFooterProps {
  user: {
    name: string;
    email: string;
    avatar: string;
    isPro?: boolean;
  };
  customMenuItems?: UserMenuGroupConfig[];
  showDefaultMenu?: boolean;
}

const ProBadge = () => (
  <span
    className="ml-1 inline-flex items-center rounded bg-gradient-to-r from-blue-500 to-green-400 px-2 py-0.5 text-xs font-semibold text-white shadow"
    style={{ verticalAlign: 'middle' }}
    title="Pro user"
    aria-label="Pro user"
  >
    ★
  </span>
);

const UpgradeBadge = ({ message, onClick }: { message: string; onClick?: () => void }) => (
  <span
    className="ml-1 inline-flex cursor-pointer items-center rounded bg-gradient-to-r from-orange-500 to-red-400 px-2 py-0.5 text-xs font-semibold text-white shadow transition-colors hover:from-orange-600 hover:to-red-500"
    style={{ verticalAlign: 'middle' }}
    title={message}
    aria-label={message}
    onClick={onClick}
  >
    ↗
  </span>
);

const UserDropDown = ({ user, customMenuItems, showDefaultMenu = true }: SideNavFooterProps) => {
  const logger = useLogger();
  const { signOut } = useAuthActions();
  const t = useTranslations('sidebar.user_menu');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const router = useRouter();
  const defaultMenuItems: UserMenuGroupConfig[] = [
    {
      groupTranslationKey: 'account_section',
      items: [
        {
          icon: CreditCardIcon,
          translationKey: 'billing',
          onClick: () => logger.info('Navigate to billing user: ' + user.email),
        },
      ],
    },
    {
      groupTranslationKey: 'actions_section',
      items: [
        {
          icon: LogOutIcon,
          translationKey: 'sign_out',
          onClick: async () => {
            posthog.reset(true);
            logger.info('Handle logout user: ' + user.email);
            await signOut();
            window.location.href = '/sign';
          },
        },
      ],
    },
  ];

  const menuItems = showDefaultMenu ? defaultMenuItems : [];
  const allMenuItems = [...menuItems, ...(customMenuItems || [])];

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
        >
          <Avatar className="h-8 w-8 rounded-lg grayscale">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-lg">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div
            className={`grid flex-1 ${isRTL ? 'text-right' : 'text-left'} text-sm leading-tight`}
          >
            <span className="flex items-center truncate font-medium">
              {user.name}
              {user.isPro ? (
                <ProBadge />
              ) : (
                <UpgradeBadge
                  message={t('upgrade_to_pro')}
                  onClick={() => router.push('/dashboard/upgrade')}
                />
              )}
            </span>
            <span className="text-muted-foreground truncate text-xs">{user.email}</span>
          </div>
          <MoreVerticalIcon className="mr-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side={isRTL ? 'left' : 'right'}
        align="end"
        sideOffset={4}
        collisionPadding={8}
        avoidCollisions
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div
            className={`flex items-center gap-2 px-1 py-1.5 ${isRTL ? 'text-right' : 'text-left'} text-sm`}
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div
              className={`grid flex-1 ${isRTL ? 'text-right' : 'text-left'} text-sm leading-tight`}
            >
              <span className="flex items-center truncate font-medium">
                {user.name}
                {user.isPro ? (
                  <ProBadge />
                ) : (
                  <UpgradeBadge
                    message={t('upgrade_to_pro')}
                    onClick={() => logger.info('Navigate to upgrade page for user: ' + user.email)}
                  />
                )}
              </span>
              <span className="text-muted-foreground truncate text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {allMenuItems.map((group, groupIndex) => (
          <div key={groupIndex}>
            <DropdownMenuGroup>
              {group.items.map((item, itemIndex) => {
                const label = item.label || (item.translationKey ? t(item.translationKey) : '');

                const dropdownMenuItem = (
                  <DropdownMenuItem
                    key={`${groupIndex}-${itemIndex}`}
                    className={`cursor-pointer ${isRTL ? 'text-right' : 'text-left'}`}
                    onClick={item.onClick}
                  >
                    <item.icon />
                    {label}
                  </DropdownMenuItem>
                );

                if (item.translationKey === 'billing') {
                  return (
                    <CustomerPortalLink
                      key={`${groupIndex}-${itemIndex}`}
                      polarApi={{
                        generateCustomerPortalUrl: api.polar.generateCustomerPortalUrl,
                      }}
                    >
                      {dropdownMenuItem}
                    </CustomerPortalLink>
                  );
                }

                return dropdownMenuItem;
              })}
            </DropdownMenuGroup>
            {groupIndex < allMenuItems.length - 1 && <DropdownMenuSeparator />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function SideNavFooter({
  user,
  customMenuItems,
  showDefaultMenu = true,
}: SideNavFooterProps) {
  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <UserDropDown
            user={user}
            customMenuItems={customMenuItems}
            showDefaultMenu={showDefaultMenu}
          />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
