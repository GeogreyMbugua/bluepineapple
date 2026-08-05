'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { PartnerRow } from '@/components/admin/types';
import type { PartnerPayoutAccountData } from '@blue-pineapple/iam';

type PartnerDetail = PartnerRow & {
  payoutAccounts: PartnerPayoutAccountData[];
  statusHistory: { oldStatus: string; newStatus: string; reason?: string; createdAt: string }[];
};

export default function AdminPartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [partner, setPartner] = useState<PartnerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'payouts' | 'history'>('profile');

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`/api/admin/partners/${params.id}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        setPartner(json.data);
      } catch {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    })();
  }, [params.id]);

  const handleAction = async (action: 'activate' | 'suspend' | 'terminate', reason?: string) => {
    await fetch(`/api/admin/partners/${params.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    });
    const res = await fetch(`/api/admin/partners/${params.id}`, { cache: 'no-store' });
    const json = await res.json();
    setPartner(json.data);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-100 animate-pulse w-1/3" />
        <div className="h-64 bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (!partner) {
    return <div className="text-gray-500">Partner not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-gray-500 hover:text-primary-deep">
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-dark">{partner.companyName || 'Partner'}</h1>
          </div>
          <p className="text-dark-6 mt-1">{partner.partnerCode}</p>
        </div>
        <div className="flex gap-2">
          {partner.status === 'PENDING' && (
            <button
              onClick={() => handleAction('activate')}
              className="px-4 py-2 bg-green text-white text-sm font-medium hover:bg-green-dark"
            >
              Approve
            </button>
          )}
          {partner.status === 'ACTIVE' && (
            <button
              onClick={() => handleAction('suspend', 'Suspended by admin')}
              className="px-4 py-2 bg-red text-white text-sm font-medium hover:bg-red-dark"
            >
              Suspend
            </button>
          )}
          {(partner.status === 'ACTIVE' || partner.status === 'SUSPENDED') && (
            <button
              onClick={() => handleAction('terminate', 'Terminated by admin')}
              className="px-4 py-2 border border-red text-red text-sm font-medium hover:bg-red-50"
            >
              Terminate
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {[
            { key: 'profile', label: 'Profile' },
            { key: 'payouts', label: 'Payout Accounts' },
            { key: 'history', label: 'Status History' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-cyan text-primary-deep'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-dark mb-4">Partner Profile</h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-gray-500">Partner Code</dt>
              <dd className="text-dark font-medium">{partner.partnerCode}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Status</dt>
              <dd className="mt-1">
                <StatusBadge status={partner.status} />
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Company Name</dt>
              <dd className="text-dark font-medium">{partner.companyName || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Commission Rate</dt>
              <dd className="text-dark font-medium">{partner.commissionRate}%</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Joined</dt>
              <dd className="text-dark font-medium">{new Date(partner.joinedAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>
      )}

      {activeTab === 'payouts' && (
        <div className="border border-gray-200 bg-white">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-dark">Payout Accounts</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {partner.payoutAccounts?.length === 0 ? (
              <p className="p-6 text-sm text-gray-500">No payout accounts configured.</p>
            ) : (
              partner.payoutAccounts?.map((account) => (
                <div key={account.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-dark">{account.accountName}</p>
                    <p className="text-sm text-gray-500">{account.accountNumber}</p>
                    {account.bankName && <p className="text-sm text-gray-500">{account.bankName}</p>}
                    {account.mpesaNumber && <p className="text-sm text-gray-500">{account.mpesaNumber}</p>}
                  </div>
                  {account.isDefault && (
                    <span className="px-2 py-1 text-xs font-medium bg-cyan/10 text-primary-deep">
                      Default
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="border border-gray-200 bg-white">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-dark">Status History</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {partner.statusHistory?.length === 0 ? (
              <p className="p-6 text-sm text-gray-500">No status changes recorded.</p>
            ) : (
              partner.statusHistory?.map((entry, idx) => (
                <div key={idx} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-dark">
                      {entry.oldStatus} → {entry.newStatus}
                    </p>
                    {entry.reason && <p className="text-sm text-gray-500">{entry.reason}</p>}
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-light-6 text-green',
    PENDING: 'bg-yellow-light-4 text-yellow-dark',
    SUSPENDED: 'bg-red-light-5 text-red',
    TERMINATED: 'bg-gray-100 text-gray-500',
  };

  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}
