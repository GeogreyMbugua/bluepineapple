import { queryOptions } from '@tanstack/react-query';
import type { PartnerRow } from '@/components/admin/types';
import type { PartnerPayoutAccountData } from '@blue-pineapple/iam';

export interface PartnerListResult {
  partners: PartnerRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusCounts: Record<string, number>;
}

export type PartnerDetail = PartnerRow & {
  user?: {
    id: string;
    email: string | null;
    phone: string | null;
    firstName: string;
    lastName: string;
    status: string;
    clerkUserId: string | null;
  };
  clerkLinked: boolean;
  payoutAccounts: PartnerPayoutAccountData[];
  statusHistory: {
    oldStatus?: string | null;
    newStatus: string;
    reason?: string | null;
    createdAt: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
};

export function adminPartnersQueryKey(params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  const { status, search, page = 1, limit = 20 } = params;
  return ['admin', 'partners', status ?? 'all', search ?? '', page, limit] as const;
}

export function adminPartnerDetailQueryKey(partnerId: string) {
  return ['admin', 'partners', 'detail', partnerId] as const;
}

export function adminPartnersOptions(params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  const { status, search, page = 1, limit = 20 } = params;
  return queryOptions({
    queryKey: adminPartnersQueryKey(params),
    queryFn: async () => {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (status && status !== 'ALL') query.set('status', status);
      if (search?.trim()) query.set('search', search.trim());

      const url = `/api/admin/partners?${query.toString()}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to fetch partners');
      }
      const json = await res.json();
      return (json.data ?? {
        partners: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        statusCounts: {},
      }) as PartnerListResult;
    },
    staleTime: 2 * 60_000,
  });
}

export function adminPartnerDetailOptions(partnerId: string) {
  return queryOptions({
    queryKey: adminPartnerDetailQueryKey(partnerId),
    queryFn: async () => {
      const res = await fetch(`/api/admin/partners/${partnerId}`, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to fetch partner');
      }
      const json = await res.json();
      if (!json.data) {
        throw new Error(json.error?.message || 'Partner not found');
      }
      return json.data as PartnerDetail;
    },
    staleTime: 60_000,
  });
}
