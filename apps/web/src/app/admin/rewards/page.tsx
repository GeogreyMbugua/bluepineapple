'use client';

import { useState, useEffect } from 'react';

type RewardSummary = {
  partnerId: string;
  companyName: string;
  year: number;
  bookingCount: number;
  tier: string | null;
  discountPercentage: number;
  isRewarded: boolean;
  rewardStatus: string | null;
  voucherCode: string | null;
};

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<RewardSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`/api/admin/rewards?year=${selectedYear}`);
        if (res.ok) {
          const json = await res.json();
          setRewards(json.data || []);
        }
      } catch {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    })();
  }, [selectedYear]);

  const handleGenerateVoucher = async (partnerId: string) => {
    setIsGenerating(partnerId);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId, year: selectedYear }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed to generate voucher');
      }

      setSuccess('Voucher generated successfully');
      const json = await res.json();
      alert(`Voucher generated: ${json.data.voucherCode}`);

      const listRes = await fetch(`/api/admin/rewards?year=${selectedYear}`);
      if (listRes.ok) {
        const listJson = await listRes.json();
        setRewards(listJson.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate voucher');
    } finally {
      setIsGenerating(null);
    }
  };

  if (isLoading) {
    return <div className="text-dark-6">Loading rewards...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark">Partner Rewards</h1>
          <p className="text-dark-6 mt-1">Manage year-end reward vouchers</p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
          className="border border-stroke bg-white px-3 py-2 text-sm text-dark"
        >
          {[2024, 2025, 2026].map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="border border-red bg-red-light-5 px-4 py-3 text-sm text-red">
          {error}
        </div>
      )}
      {success && (
        <div className="border border-green bg-green-light-6 px-4 py-3 text-sm text-green">
          {success}
        </div>
      )}

      <div className="border border-stroke bg-white shadow-1">
        <table className="min-w-full divide-y divide-stroke">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-6 uppercase">Partner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-6 uppercase">Bookings</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-6 uppercase">Tier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-6 uppercase">Discount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-6 uppercase">Voucher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-6 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stroke">
            {rewards.map((reward) => (
              <tr key={reward.partnerId}>
                <td className="px-6 py-4 text-sm text-dark">{reward.companyName || 'Unknown'}</td>
                <td className="px-6 py-4 text-sm text-dark">{reward.bookingCount}</td>
                <td className="px-6 py-4 text-sm">
                  {reward.tier ? (
                    <span className={`inline-block px-2 py-1 text-xs font-medium ${
                      reward.tier === 'PLATINUM' ? 'bg-purple-100 text-purple-800' :
                      reward.tier === 'GOLD' ? 'bg-yellow-100 text-yellow-800' :
                      reward.tier === 'SILVER' ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {reward.tier}
                    </span>
                  ) : (
                    <span className="text-dark-6">Unranked</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-dark">{reward.discountPercentage}%</td>
                <td className="px-6 py-4 text-sm">
                  {reward.isRewarded ? (
                    <span className="font-mono text-green">{reward.voucherCode}</span>
                  ) : (
                    <span className="text-dark-6">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  {!reward.isRewarded && reward.tier && (
                    <button
                      onClick={() => handleGenerateVoucher(reward.partnerId)}
                      disabled={isGenerating === reward.partnerId}
                      className="px-3 py-1 bg-primary text-white text-xs font-medium hover:bg-primary-deep disabled:opacity-50"
                    >
                      {isGenerating === reward.partnerId ? 'Generating...' : 'Generate Voucher'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
