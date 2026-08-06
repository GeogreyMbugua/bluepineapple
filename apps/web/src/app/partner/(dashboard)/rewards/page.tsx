import { getServerSession } from '@/lib/auth';
import { getPartnerRewardSummary } from '@/lib/services/partner-dashboard.service';
import { Skeleton } from '@/components/admin/ui/skeleton';

export const dynamic = 'force-dynamic';

const TIER_THRESHOLDS = [
  { tier: 'PLATINUM', minBookings: 50, discountPercentage: 20 },
  { tier: 'GOLD', minBookings: 30, discountPercentage: 15 },
  { tier: 'SILVER', minBookings: 15, discountPercentage: 10 },
  { tier: 'BRONZE', minBookings: 5, discountPercentage: 5 },
];

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  PLATINUM: { label: 'Platinum', color: 'bg-purple-100 text-purple-800' },
  GOLD: { label: 'Gold', color: 'bg-yellow-100 text-yellow-800' },
  SILVER: { label: 'Silver', color: 'bg-gray-100 text-gray-800' },
  BRONZE: { label: 'Bronze', color: 'bg-orange-100 text-orange-800' },
};

function getTierColor(tier: string): string {
  return TIER_LABELS[tier]?.color ?? 'bg-gray-100 text-gray-600';
}

function RewardsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-1 h-4 w-64" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border border-stroke bg-white p-6 shadow-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-8 w-20" />
          </div>
        ))}
      </div>

      <div className="border border-stroke bg-white p-6 shadow-1">
        <Skeleton className="h-5 w-48 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
      </div>

      <div className="border border-stroke bg-white p-6 shadow-1">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function PartnerRewardsPage() {
  const session = await getServerSession();
  if (!session.user) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  const summary = await getPartnerRewardSummary(session.user.id, currentYear);

  if (!summary) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-dark">Rewards</h1>
        <p className="text-dark-6 mt-1">No reward data available</p>
      </div>
    );
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

export { RewardsSkeleton };
