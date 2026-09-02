'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { PartnerRow } from '@/components/admin/types';
import type { PartnerPayoutAccountData } from '@blue-pineapple/iam';
import { Input } from '@/components/admin/ui/input';

type PartnerDetail = PartnerRow & {
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
  statusHistory: { oldStatus?: string | null; newStatus: string; reason?: string | null; createdAt: string }[];
};

export default function AdminPartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [partner, setPartner] = useState<PartnerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'payouts' | 'history'>('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    mpesaNumber: '',
    isDefault: false,
  });

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`/api/admin/partners/${params.id}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load partner');
        const json = await res.json();
        if (!json.data) throw new Error(json.error?.message || 'Partner not found');
        setPartner(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load partner');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [params.id]);

  const handleAction = async (action: 'activate' | 'suspend' | 'terminate', reason?: string) => {
    if (action !== 'activate' && !window.confirm(`Are you sure you want to ${action} this partner?`)) {
      return;
    }
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/partners/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to update partner status');
      const refreshed = await fetch(`/api/admin/partners/${params.id}`, { cache: 'no-store' });
      const refreshedJson = await refreshed.json();
      if (!refreshed.ok) throw new Error(refreshedJson.error?.message || 'Failed to refresh partner');
      setPartner(refreshedJson.data);
      setSuccess('Partner status updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update partner status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPayout = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/partners/${params.id}/payouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payoutForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to add payout account');
      setPayoutForm({ accountName: '', accountNumber: '', bankName: '', mpesaNumber: '', isDefault: false });
      setShowPayoutForm(false);
      setSuccess('Payout account added successfully');
      const refreshed = await fetch(`/api/admin/partners/${params.id}`, { cache: 'no-store' });
      const refreshedJson = await refreshed.json();
      if (!refreshed.ok) throw new Error(refreshedJson.error?.message || 'Failed to refresh partner');
      setPartner(refreshedJson.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add payout account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayoutAction = async (action: 'set-default' | 'remove', accountId: string) => {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    try {
      const res = action === 'remove'
        ? await fetch(`/api/admin/partners/${params.id}/payouts?accountId=${accountId}`, { method: 'DELETE' })
        : await fetch(`/api/admin/partners/${params.id}/payouts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, accountId }),
          });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to update payout account');
      const refreshed = await fetch(`/api/admin/partners/${params.id}`, { cache: 'no-store' });
      const refreshedJson = await refreshed.json();
      if (!refreshed.ok) throw new Error(refreshedJson.error?.message || 'Failed to refresh partner');
      setPartner(refreshedJson.data);
      setSuccess(action === 'remove' ? 'Payout account removed' : 'Default payout account updated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payout account');
    } finally {
      setIsSubmitting(false);
    }
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
              disabled={isSubmitting}
              className="px-4 py-2 bg-green text-white text-sm font-medium hover:bg-green-dark"
            >
              {isSubmitting ? 'Updating...' : 'Approve'}
            </button>
          )}
          {partner.status === 'ACTIVE' && (
            <button
              onClick={() => handleAction('suspend', 'Suspended by admin')}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red text-white text-sm font-medium hover:bg-red-dark"
            >
              {isSubmitting ? 'Updating...' : 'Suspend'}
            </button>
          )}
          {(partner.status === 'ACTIVE' || partner.status === 'SUSPENDED') && (
            <button
              onClick={() => handleAction('terminate', 'Terminated by admin')}
              disabled={isSubmitting}
              className="px-4 py-2 border border-red text-red text-sm font-medium hover:bg-red-50"
            >
              {isSubmitting ? 'Updating...' : 'Terminate'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="border border-red bg-red-light-5 px-4 py-3 text-sm text-red" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="border border-green bg-green-light-6 px-4 py-3 text-sm text-green" role="status">
          {success}
        </div>
      )}

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
            <div>
              <dt className="text-sm text-gray-500">Contact</dt>
              <dd className="text-dark font-medium">{partner.user ? `${partner.user.firstName} ${partner.user.lastName}` : '—'}</dd>
              <dd className="text-sm text-gray-500">{partner.user?.email || partner.user?.phone || 'No contact details'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Account</dt>
              <dd className="text-dark font-medium">{partner.user?.status || '—'}</dd>
              <dd className={partner.clerkLinked ? 'text-sm text-green' : 'text-sm text-yellow-dark'}>
                {partner.clerkLinked ? 'Clerk linked' : 'Clerk link pending'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Bookings</dt>
              <dd className="text-dark font-medium">{partner.bookingCount ?? 0}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Rewards</dt>
              <dd className="text-dark font-medium">{partner.rewardCount ?? 0}</dd>
            </div>
          </dl>
        </div>
      )}

      {activeTab === 'payouts' && (
        <div className="border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-bold text-dark">Payout Accounts</h2>
            <button
              type="button"
              onClick={() => setShowPayoutForm((current) => !current)}
              className="px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-deep"
            >
              {showPayoutForm ? 'Close' : 'Add account'}
            </button>
          </div>
          {showPayoutForm && (
            <form onSubmit={handleAddPayout} className="grid grid-cols-1 gap-4 border-b border-gray-200 p-6 sm:grid-cols-2">
              <Input label="Account name" value={payoutForm.accountName} onChange={(event) => setPayoutForm({ ...payoutForm, accountName: event.target.value })} required />
              <Input label="Account number" value={payoutForm.accountNumber} onChange={(event) => setPayoutForm({ ...payoutForm, accountNumber: event.target.value })} required />
              <Input label="Bank name" value={payoutForm.bankName} onChange={(event) => setPayoutForm({ ...payoutForm, bankName: event.target.value })} />
              <Input label="M-Pesa number" value={payoutForm.mpesaNumber} onChange={(event) => setPayoutForm({ ...payoutForm, mpesaNumber: event.target.value })} />
              <label className="flex items-center gap-2 text-sm text-dark">
                <input type="checkbox" checked={payoutForm.isDefault} onChange={(event) => setPayoutForm({ ...payoutForm, isDefault: event.target.checked })} />
                Set as default
              </label>
              <div className="flex justify-end sm:col-span-2">
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-deep disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save account'}
                </button>
              </div>
            </form>
          )}
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
                  <div className="flex items-center gap-2">
                    {account.isDefault ? (
                      <span className="px-2 py-1 text-xs font-medium bg-cyan/10 text-primary-deep">Default</span>
                    ) : (
                      <button type="button" onClick={() => handlePayoutAction('set-default', account.id)} disabled={isSubmitting} className="text-xs text-primary-deep hover:underline disabled:opacity-50">
                        Make default
                      </button>
                    )}
                    <button type="button" onClick={() => handlePayoutAction('remove', account.id)} disabled={isSubmitting} className="text-xs text-red hover:underline disabled:opacity-50">
                      Remove
                    </button>
                  </div>
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
                      {entry.oldStatus ? `${entry.oldStatus} → ` : 'Created → '}
                      {entry.newStatus}
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
