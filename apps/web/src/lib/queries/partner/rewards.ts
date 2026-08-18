import { queryOptions } from '@tanstack/react-query';

export interface PartnerRewardSummary {
  partnerId: string;
  year: number;
  bookingCount: number;
  tier: string | null;
  discountPercentage: number;
  isRewarded: boolean;
  rewardStatus: string | null;
  voucherCode: string | null;
  bookingsToNextTier: number;
  nextTier: string | null;
}

export interface PartnerRewardsOptionsParams {
  year?: number;
}

export function partnerRewardsOptions(params: PartnerRewardsOptionsParams = {}) {
  return queryOptions({
    queryKey: ['partner', 'rewards', params.year ?? new Date().getFullYear()] as const,
    queryFn: async () => {
      const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
      const url = new URL('/api/partner/rewards', base);
      if (params.year) url.searchParams.set('year', String(params.year));

      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to fetch rewards');
      }
      const json = await res.json();
      return json.data as PartnerRewardSummary;
    },
    staleTime: 30_000,
  });
}
