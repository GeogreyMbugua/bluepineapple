/**
 * Query key constants.
 *
 * Used to prepare future caching infrastructure (TanStack Query, SWR, etc.).
 * Each key is a dot-notated string that uniquely identifies a cacheable resource.
 * No query library is wired yet — these are constants only.
 */

export const queryKeys = {
  auth: {
    currentUser: 'auth.currentUser',
    session: 'auth.session',
  },
  experiences: {
    list: 'experiences.list',
    detail: (id: string) => `experiences.detail.${id}` as const,
    search: 'experiences.search',
  },
  departures: {
    list: 'departures.list',
    detail: (id: string) => `departures.detail.${id}` as const,
  },
  booking: {
    list: 'booking.list',
    detail: (id: string) => `booking.detail.${id}` as const,
    history: 'booking.history',
  },
  partner: {
    dashboard: 'partner.dashboard',
    fleet: 'partner.fleet',
    analytics: 'partner.analytics',
    bookings: 'partner.bookings',
  },
  customer: {
    profile: 'customer.profile',
    list: 'customer.list',
    detail: (id: string) => `customer.detail.${id}` as const,
  },
  operations: {
    voyages: 'operations.voyages',
    crew: 'operations.crew',
    manifest: (id: string) => `operations.manifest.${id}` as const,
  },
  commercial: {
    pricing: 'commercial.pricing',
    promotions: 'commercial.promotions',
    quotes: 'commercial.quotes',
  },
  admin: {
    users: 'admin.users',
    partners: 'admin.partners',
    audit: 'admin.audit',
  },
} as const;
