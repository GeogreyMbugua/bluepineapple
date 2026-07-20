/**
 * Centralized route definitions.
 *
 * Every navigation, redirect, or link in the application should reference
 * these constants rather than using string literals.
 */

export const ROUTES = {
  /** Public marketing pages */
  marketing: {
    home: '/',
    about: '/about',
    contact: '/contact',
    pricing: '/pricing',
      experiences: '/coastal-experiences',
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    verifyEmail: '/verify-email',
  },

  /** Authenticated user dashboard */
  dashboard: {
    home: '/dashboard',
    bookings: '/dashboard/bookings',
    experiences: '/dashboard/experiences',
    profile: '/dashboard/profile',
    settings: '/dashboard/settings',
    rewards: '/dashboard/rewards',
  },

  /** Partner portal */
  partner: {
    home: '/partner',
    overview: '/partner/overview',
    bookings: '/partner/bookings',
    fleet: '/partner/fleet',
    analytics: '/partner/analytics',
    settings: '/partner/settings',
  },

  /** Admin portal */
  admin: {
    home: '/admin',
    users: '/admin/users',
    partners: '/admin/partners',
    bookings: '/admin/bookings',
    operations: '/admin/operations',
    crm: '/admin/crm',
    commercial: '/admin/commercial',
    settings: '/admin/settings',
    audit: '/admin/audit',
  },
} as const;

/** Type-safe route path */
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES][keyof (typeof ROUTES)[keyof typeof ROUTES]];
