'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/admin/ui/input';
import { PartnerBookingDrawer } from '@/components/admin/partners/partner-booking-drawer';
import { adminPartnerDetailOptions, type PartnerDetail } from '@/lib/queries/admin/partners';
import { useToast } from '@/providers/toast-provider';

interface PartnerDetailClientProps {
  partnerId: string;
}

export function PartnerDetailClient({ partnerId }: PartnerDetailClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [showBookingDrawer, setShowBookingDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'payouts' | 'history'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ companyName: '', commissionRate: 10 });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    mpesaNumber: '',
    isDefault: false,
  });

  const {
    data: partner,
    isLoading,
    error,
  } = useQuery(adminPartnerDetailOptions(partnerId));

  const invalidatePartner = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners', 'detail', partnerId] }),
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] }),
    ]);
  };

  const statusMutation = useMutation({
    mutationFn: async (payload: { action: 'activate' | 'suspend' | 'terminate'; reason?: string }) => {
      const res = await fetch(`/api/admin/partners/${partnerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to update partner status');
    },
    onSuccess: async () => {
      setFeedback({ type: 'success', message: 'Partner status updated successfully' });
      await invalidatePartner();
    },
    onError: (mutationError) => {
      setFeedback({
        type: 'error',
        message: mutationError instanceof Error ? mutationError.message : 'Failed to update partner status',
      });
    },
  });

  const profileMutation = useMutation({
    mutationFn: async (payload: { companyName: string; commissionRate: number }) => {
      const res = await fetch(`/api/admin/partners/${partnerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to update partner profile');
      return json.data as PartnerDetail;
    },
    onSuccess: async () => {
      setFeedback({ type: 'success', message: 'Partner profile updated successfully' });
      setIsEditingProfile(false);
      await invalidatePartner();
    },
    onError: (mutationError) => {
      setFeedback({
        type: 'error',
        message: mutationError instanceof Error ? mutationError.message : 'Failed to update partner profile',
      });
    },
  });

  const payoutMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (payload.action === 'remove') {
        const res = await fetch(
          `/api/admin/partners/${partnerId}/payouts?accountId=${payload.accountId}`,
          { method: 'DELETE' },
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to remove payout account');
        return;
      }

      const res = await fetch(`/api/admin/partners/${partnerId}/payouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to update payout account');
    },
    onSuccess: async (_, variables) => {
      const action = variables.action as string | undefined;
      setFeedback({
        type: 'success',
        message: action === 'remove'
          ? 'Payout account removed'
          : action === 'set-default'
            ? 'Default payout account updated'
            : 'Payout account added successfully',
      });
      if (!variables.action) {
        setPayoutForm({
          accountName: '',
          accountNumber: '',
          bankName: '',
          mpesaNumber: '',
          isDefault: false,
        });
        setShowPayoutForm(false);
      }
      await invalidatePartner();
    },
    onError: (mutationError) => {
      setFeedback({
        type: 'error',
        message: mutationError instanceof Error ? mutationError.message : 'Failed to update payout account',
      });
    },
  });

  const isSubmitting =
    statusMutation.isPending || profileMutation.isPending || payoutMutation.isPending;

  const beginProfileEdit = () => {
    if (!partner) return;
    setProfileForm({
      companyName: partner.companyName || '',
      commissionRate: partner.commissionRate,
    });
    setIsEditingProfile(true);
    setFeedback(null);
  };

  const handleAction = (action: 'activate' | 'suspend' | 'terminate', reason?: string) => {
    if (action !== 'activate' && !window.confirm(`Are you sure you want to ${action} this partner?`)) {
      return;
    }
    setFeedback(null);
    statusMutation.mutate({ action, reason });
  };

  const handleProfileSave = (event: React.FormEvent) => {
    event.preventDefault();
    profileMutation.mutate(profileForm);
  };

  const handleAddPayout = (event: React.FormEvent) => {
    event.preventDefault();
    payoutMutation.mutate(payoutForm);
  };

  const handlePayoutAction = (action: 'set-default' | 'remove', accountId: string) => {
    if (action === 'remove') {
      payoutMutation.mutate({ action: 'remove', accountId });
      return;
    }
    payoutMutation.mutate({ action, accountId });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-1/3 animate-pulse bg-gray-100" />
        <div className="h-64 animate-pulse bg-gray-100" />
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="border border-red bg-red-light-5 px-4 py-3 text-sm text-red">
        {error instanceof Error ? error.message : 'Partner not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-gray-500 hover:text-primary-deep">
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-dark">{partner.companyName || 'Partner'}</h1>
          </div>
          <p className="mt-1 text-dark-6">{partner.partnerCode}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {partner.status === 'ACTIVE' && (
            <button
              type="button"
              onClick={() => setShowBookingDrawer(true)}
              className="bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-deep"
            >
              Book water taxi
            </button>
          )}
          {partner.status === 'PENDING' && (
            <button
              onClick={() => handleAction('activate')}
              disabled={isSubmitting}
              className="bg-green px-4 py-2 text-sm font-medium text-white hover:bg-green-dark disabled:opacity-50"
            >
              {isSubmitting ? 'Updating…' : 'Approve'}
            </button>
          )}
          {partner.status === 'ACTIVE' && (
            <button
              onClick={() => handleAction('suspend', 'Suspended by admin')}
              disabled={isSubmitting}
              className="bg-red px-4 py-2 text-sm font-medium text-white hover:bg-red-dark disabled:opacity-50"
            >
              {isSubmitting ? 'Updating…' : 'Suspend'}
            </button>
          )}
          {(partner.status === 'ACTIVE' || partner.status === 'SUSPENDED') && (
            <button
              onClick={() => handleAction('terminate', 'Terminated by admin')}
              disabled={isSubmitting}
              className="border border-red px-4 py-2 text-sm font-medium text-red hover:bg-red-50 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating…' : 'Terminate'}
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border border-green bg-green-light-6 text-green'
              : 'border border-red bg-red-light-5 text-red'
          }`}
          role={feedback.type === 'success' ? 'status' : 'alert'}
        >
          {feedback.message}
        </div>
      )}

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
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
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

      {activeTab === 'profile' && (
        <div className="border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-dark">Partner Profile</h2>
            {!isEditingProfile ? (
              <button
                type="button"
                onClick={beginProfileEdit}
                className="text-sm font-medium text-primary-deep hover:underline"
              >
                Edit profile
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="text-sm font-medium text-dark-5 hover:underline"
              >
                Cancel
              </button>
            )}
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleProfileSave} className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Company name"
                value={profileForm.companyName}
                onChange={(event) => setProfileForm({ ...profileForm, companyName: event.target.value })}
              />
              <Input
                label="Commission rate (%)"
                type="number"
                min="0"
                max="100"
                value={profileForm.commissionRate}
                onChange={(event) =>
                  setProfileForm({
                    ...profileForm,
                    commissionRate: parseFloat(event.target.value) || 0,
                  })
                }
              />
              <div className="flex justify-end sm:col-span-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-deep disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          ) : (
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailItem label="Partner Code" value={partner.partnerCode} />
              <DetailItem label="Status" value={<StatusBadge status={partner.status} />} />
              <DetailItem label="Company Name" value={partner.companyName || '—'} />
              <DetailItem label="Commission Rate" value={`${partner.commissionRate}%`} />
              <DetailItem label="Joined" value={new Date(partner.joinedAt).toLocaleDateString()} />
              <DetailItem
                label="Contact"
                value={
                  <>
                    <span className="block font-medium text-dark">
                      {partner.user ? `${partner.user.firstName} ${partner.user.lastName}` : '—'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {partner.user?.email || partner.user?.phone || 'No contact details'}
                    </span>
                  </>
                }
              />
              <DetailItem
                label="Account"
                value={
                  <>
                    <span className="block font-medium text-dark">{partner.user?.status || '—'}</span>
                    <span className={partner.clerkLinked ? 'text-sm text-green' : 'text-sm text-yellow-dark'}>
                      {partner.clerkLinked ? 'Clerk linked' : 'Clerk link pending'}
                    </span>
                  </>
                }
              />
              <DetailItem label="Bookings" value={String(partner.bookingCount ?? 0)} />
              <DetailItem label="Rewards" value={String(partner.rewardCount ?? 0)} />
            </dl>
          )}
        </div>
      )}

      {activeTab === 'payouts' && (
        <div className="border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-bold text-dark">Payout Accounts</h2>
            <button
              type="button"
              onClick={() => setShowPayoutForm((current) => !current)}
              className="bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-deep"
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
                <button type="submit" disabled={isSubmitting} className="bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-deep disabled:opacity-50">
                  {isSubmitting ? 'Saving…' : 'Save account'}
                </button>
              </div>
            </form>
          )}
          <div className="divide-y divide-gray-200">
            {partner.payoutAccounts?.length === 0 ? (
              <p className="p-6 text-sm text-gray-500">No payout accounts configured.</p>
            ) : (
              partner.payoutAccounts?.map((account) => (
                <div key={account.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-dark">{account.accountName}</p>
                    <p className="text-sm text-gray-500">{account.accountNumber}</p>
                    {account.bankName && <p className="text-sm text-gray-500">{account.bankName}</p>}
                    {account.mpesaNumber && <p className="text-sm text-gray-500">{account.mpesaNumber}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {account.isDefault ? (
                      <span className="bg-cyan/10 px-2 py-1 text-xs font-medium text-primary-deep">Default</span>
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
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-bold text-dark">Status History</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {partner.statusHistory?.length === 0 ? (
              <p className="p-6 text-sm text-gray-500">No status changes recorded.</p>
            ) : (
              partner.statusHistory?.map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between px-6 py-4">
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
      <PartnerBookingDrawer
        open={showBookingDrawer}
        partner={{
          id: partner.id,
          partnerCode: partner.partnerCode,
          companyName: partner.companyName,
        }}
        onClose={() => setShowBookingDrawer(false)}
        onSuccess={() => {
          addToast('Partner booking created successfully', 'success');
          void invalidatePartner();
          queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
        }}
      />
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="mt-1 text-dark">{value}</dd>
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
