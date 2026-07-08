/**
 * Navigation definitions for each portal.
 *
 * These drive sidebar menus, top-level navbars, and mobile drawers.
 * Components import these rather than defining nav items inline.
 */

import type { NavGroup } from '@/types/navigation';
import { ROUTES } from './routes';

/** Marketing site top navigation */
export const MARKETING_NAV: readonly NavGroup[] = [
  {
    items: [
      { label: 'Home', href: ROUTES.marketing.home },
      { label: 'Experiences', href: ROUTES.marketing.experiences },
      { label: 'Pricing', href: ROUTES.marketing.pricing },
      { label: 'About', href: ROUTES.marketing.about },
      { label: 'Contact', href: ROUTES.marketing.contact },
    ],
  },
];

/** Dashboard sidebar navigation */
export const DASHBOARD_NAV: readonly NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: ROUTES.dashboard.home, icon: 'home' },
      { label: 'Bookings', href: ROUTES.dashboard.bookings, icon: 'calendar' },
      { label: 'Experiences', href: ROUTES.dashboard.experiences, icon: 'compass' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Profile', href: ROUTES.dashboard.profile, icon: 'user' },
      { label: 'Rewards', href: ROUTES.dashboard.rewards, icon: 'gift' },
      { label: 'Settings', href: ROUTES.dashboard.settings, icon: 'settings' },
    ],
  },
];

/** Partner portal sidebar navigation */
export const PARTNER_NAV: readonly NavGroup[] = [
  {
    title: 'Management',
    items: [
      { label: 'Overview', href: ROUTES.partner.overview, icon: 'bar-chart' },
      { label: 'Bookings', href: ROUTES.partner.bookings, icon: 'calendar' },
      { label: 'Fleet', href: ROUTES.partner.fleet, icon: 'truck' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { label: 'Analytics', href: ROUTES.partner.analytics, icon: 'trending-up' },
      { label: 'Settings', href: ROUTES.partner.settings, icon: 'settings' },
    ],
  },
];

/** Admin portal sidebar navigation */
export const ADMIN_NAV: readonly NavGroup[] = [
  {
    title: 'Platform',
    items: [
      { label: 'Dashboard', href: ROUTES.admin.home, icon: 'layout-dashboard' },
      { label: 'Users', href: ROUTES.admin.users, icon: 'users' },
      { label: 'Partners', href: ROUTES.admin.partners, icon: 'building' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Bookings', href: ROUTES.admin.bookings, icon: 'calendar' },
      { label: 'Operations', href: ROUTES.admin.operations, icon: 'activity' },
      { label: 'CRM', href: ROUTES.admin.crm, icon: 'contact' },
      { label: 'Commercial', href: ROUTES.admin.commercial, icon: 'briefcase' },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Audit Log', href: ROUTES.admin.audit, icon: 'shield' },
      { label: 'Settings', href: ROUTES.admin.settings, icon: 'settings' },
    ],
  },
];
