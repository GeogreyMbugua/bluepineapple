import type { AuthUser } from '@/features/auth/types';
import * as Icons from '@/components/admin/icons';

export type NavItem = {
  title: string;
  icon?: keyof typeof Icons;
  href?: string;
  permission?: string;
  roles?: string[];
  items?: NavItem[];
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export function getIconComponent(name: keyof typeof Icons | undefined) {
  if (!name) return null;
  const Icon = Icons[name];
  if (!Icon) return null;
  return <Icon className="size-6 shrink-0" aria-hidden="true" />;
}

export function buildNavData(user: AuthUser | null): NavSection[] {
  const hasPermission = (perm?: string) => {
    if (!perm || !user?.permissions) return true;
    return user.permissions.includes(perm as never);
  };

  const hasRole = (roles?: string[]) => {
    if (!roles || !user?.roles) return false;
    return roles.some((r) => user.roles.includes(r as never));
  };

  const isSuperAdmin = hasRole(['SUPER_ADMIN']);

  const mainMenu: NavSection = {
    label: 'MAIN MENU',
    items: [
      {
        title: 'Dashboard',
        icon: 'HomeIcon',
        href: '/admin',
        permission: 'user.read',
      } as NavItem,
      {
        title: 'Users',
        icon: 'UserIcon',
        href: '/admin/users',
        permission: 'user.read',
      } as NavItem,
      {
        title: 'Partners',
        icon: 'HandshakeIcon',
        href: '/admin/partners',
        permission: 'partner.read',
        items: [
          {
            title: 'All Partners',
            href: '/admin/partners',
            permission: 'partner.read',
          } as NavItem,
          {
            title: 'Payout Accounts',
            href: '/admin/partners/payouts',
            permission: 'partner.read',
          } as NavItem,
        ],
      } as NavItem,
      {
        title: 'Bookings',
        icon: 'CalendarIcon',
        href: '/admin/bookings',
        permission: 'booking.read',
      } as NavItem,
      {
        title: 'Experiences',
        icon: 'CompassIcon',
        href: '/admin/experiences',
        permission: 'experience.read',
      } as NavItem,
      {
        title: 'Fleet',
        icon: 'ShipIcon',
        href: '/admin/fleet',
        permission: 'fleet.read',
        items: [
          {
            title: 'All Vessels',
            href: '/admin/fleet',
            permission: 'fleet.read',
          } as NavItem,
          {
            title: 'Add Vessel',
            href: '/admin/fleet/create',
            permission: 'fleet.create',
          } as NavItem,
        ],
      } as NavItem,
      {
        title: 'Rewards',
        icon: 'GiftIcon',
        href: '/admin/rewards',
        permission: 'reward.read',
        items: [
          {
            title: 'Transactions',
            href: '/admin/rewards',
            permission: 'reward.read',
          } as NavItem,
          {
            title: 'Rules',
            href: '/admin/rewards/rules',
            permission: 'reward.manage',
          } as NavItem,
        ],
      } as NavItem,
      {
        title: 'Operations',
        icon: 'ClockIcon',
        href: '/admin/operations',
        permission: 'fleet.manage',
        items: [
          {
            title: 'Blocked Dates',
            href: '/admin/blocked-dates',
            permission: 'fleet.manage',
          } as NavItem,
        ],
      } as NavItem,
    ].filter((item) => hasPermission(item.permission)),
  };

  const othersMenu: NavSection = {
    label: 'OTHERS',
    items: [
      ...(isSuperAdmin
        ? [
            {
              title: 'Payments',
              icon: 'CreditCardIcon',
              href: '/admin/payments',
              permission: 'payment.read',
            } as NavItem,
            {
              title: 'Properties',
              icon: 'Building2Icon',
              href: '/admin/properties',
              permission: 'property.read',
            } as NavItem,
            {
              title: 'Investments',
              icon: 'TrendingUpIcon',
              href: '/admin/investments',
              permission: 'investment.read',
            } as NavItem,
          ]
        : []),
      {
        title: 'Audit Logs',
        icon: 'FileTextIcon',
        href: '/admin/audit-logs',
      } as NavItem,
      {
        title: 'Sessions',
        icon: 'ClockIcon',
        href: '/admin/sessions',
      } as NavItem,
    ].filter((item) => hasPermission(item.permission)),
  };

  return [mainMenu, othersMenu];
}
