export type SortingState = {
  key: string;
  direction: 'asc' | 'desc' | null;
};

export type PaginationState = {
  pageIndex: number;
  pageSize: number;
};

export type ColumnDef<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  cell?: (row: T) => React.ReactNode;
};

export interface UserRow {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  roles: string[];
  lastLoginAt?: string;
  createdAt: string;
}

export interface PartnerRow {
  id: string;
  partnerCode: string;
  companyName: string | null;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  status: string;
  commissionRate: number;
  joinedAt: string;
  userId: string;
  userStatus?: string | null;
  clerkLinked?: boolean;
  bookingCount?: number;
  rewardCount?: number;
}

export interface BookingRow {
  id: string;
  bookingReference: string;
  experience: string;
  partner: string;
  departureTime: string;
  status: string;
  paymentStatus: string;
  amount: string;
  date: string;
}

export interface DashboardData {
  kpis: DashboardKpis;
  recentActivity: DashboardActivity[];
}

export interface DashboardKpis {
  totalUsers: number;
  activePartners: number;
  pendingPartners: number;
  todayBookings: number;
  todayRevenue: number;
  activeSessions: number;
}

export interface DashboardActivity {
  id: string;
  action: string;
  target: string;
  time: string;
}

export interface VesselRow {
  id: string;
  name: string;
  slug: string;
  capacity: number;
  status: string;
  type: string | null;
  operatorName: string | null;
  ownerName: string | null;
  subtitle: string | null;
  hourlyRate: string | null;
  dailyRate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExperienceRow {
  id: string;
  name: string;
  slug: string;
  category: string;
  durationMinutes: number | null;
  defaultPrice: string | null;
  currency: string;
  isFeatured: boolean;
  isActive: boolean;
  maxGroupSize: number | null;
  minGroupSize: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerBooking {
  id: string;
  bookingReference: string;
  experience: string;
  status: string;
  paymentStatus: string;
  totalAmount: string;
  totalGuests: number;
  createdAt: string;
}

