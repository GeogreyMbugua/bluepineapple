'use client';

import { useState, useEffect } from 'react';

type RewardSummary = {
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
};

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  PLATINUM: { label: 'Platinum', color: 'bg-purple-100 text-purple-800' },
  GOLD: { label: 'Gold', color: 'bg-yellow-100 text-yellow-800' },
  SILVER: { label: 'Silver', color: 'bg-gray-100 text-gray-800' },
  BRONZE: { label: 'Bronze', color: 'bg-orange-100 text-orange-800' },
};

function getTierColor(tier: string): string {
  return TIER_LABELS[tier]?.color ?? 'bg-gray-100 text-gray-600';
}

export default function PartnerRewardsPage() {
  const [summary, setSummary] = useState<RewardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`/api/partner/rewards?year=${currentYear}`);
        if (res.ok) {
          const json = await res.json();
          setSummary(json.data);
        }
      } catch {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    })();
  }, [currentYear]);

  if (isLoading) {
    return <div className="text-dark-6">Loading rewards...</div>;
  }

  if (!summary) {
    return <div className="text-dark-6">No reward data available</div>;
  }

  const tierInfo = summary.tier ? TIER_LABELS[summary.tier] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark">Rewards</h1>
        <p className="text-dark-6 mt-1">Your {currentYear} partner rewards</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-stroke bg-white p-6 shadow-1">
          <p className="text-sm font-medium text-dark-6">Total Bookings</p>
          <p className="mt-2 text-3xl font-bold text-dark">{summary.bookingCount}</p>
        </div>
        <div className="border border-stroke bg-white p-6 shadow-1">
          <p className="text-sm font-medium text-dark-6">Current Tier</p>
          <div className="mt-2">
            {tierInfo ? (
              <span className={`inline-block px-3 py-1 text-sm font-medium ${tierInfo.color}`}>
                {tierInfo.label}
              </span>
            ) : (
              <p className="text-lg text-dark-6">Unranked</p>
            )}
          </div>
        </div>
        <div className="border border-stroke bg-white p-6 shadow-1">
          <p className="text-sm font-medium text-dark-6">Discount Earned</p>
          <p className="mt-2 text-3xl font-bold text-dark">{summary.discountPercentage}%</p>
        </div>
        <div className="border border-stroke bg-white p-6 shadow-1">
          <p className="text-sm font-medium text-dark-6">Voucher Status</p>
          <p className="mt-2 text-lg font-medium text-dark">
            {summary.isRewarded ? `Issued (${summary.voucherCode})` : 'Not yet issued'}
          </p>
        </div>
      </div>

      {summary.tier && summary.bookingsToNextTier > 0 && (
        <div className="border border-stroke bg-white p-6 shadow-1">
          <h2 className="text-lg font-bold text-dark mb-2">Next Tier Progress</h2>
          <p className="text-sm text-dark-6">
            You need <span className="font-semibold text-dark">{summary.bookingsToNextTier}</span> more bookings to reach{' '}
            <span className="font-semibold text-dark">{summary.nextTier}</span> tier.
          </p>
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{
                width: `${Math.min(100, (summary.bookingCount / (summary.bookingCount + summary.bookingsToNextTier)) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="border border-stroke bg-white p-6 shadow-1">
        <h2 className="text-lg font-bold text-dark mb-4">Reward Tiers</h2>
        <div className="space-y-3">
          {TIER_THRESHOLDS.map((tier) => (
            <div
              key={tier.tier}
              className={`flex items-center justify-between rounded-lg border p-4 ${
                summary.tier === tier.tier ? 'border-cyan bg-cyan/5' : 'border-stroke'
              }`}
            >
              <div>
                <p className="font-medium text-dark">{tier.tier}</p>
                <p className="text-sm text-dark-6">{tier.minBookings}+ bookings</p>
              </div>
              <span className={`px-3 py-1 text-sm font-medium ${getTierColor(tier.tier)}`}>
                {tier.discountPercentage}% discount
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const TIER_THRESHOLDS = [
  { tier: 'PLATINUM' as const, minBookings: 50, discountPercentage: 20 },
  { tier: 'GOLD' as const, minBookings: 30, discountPercentage: 15 },
  { tier: 'SILVER' as const, minBookings: 15, discountPercentage: 10 },
  { tier: 'BRONZE' as const, minBookings: 5, discountPercentage: 5 },
];
