'use client';

import { useState, useEffect } from 'react';

type PartnerProfile = {
  id: string;
  partnerCode: string;
  companyName: string | null;
  commissionRate: string;
  status: string;
  payoutAccounts: Array<{
    id: string;
    accountName: string;
    accountNumber: string;
    bankName: string | null;
    mpesaNumber: string | null;
    isDefault: boolean;
  }>;
};

export default function PartnerSettingsPage() {
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [mpesaNumber, setMpesaNumber] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/partner/me', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          const data = json.data as PartnerProfile;
          setProfile(data);
          setCompanyName(data.companyName || '');
        }
      } catch {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/partner/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPayoutAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/partner/payout-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountName,
          accountNumber,
          bankName: bankName || null,
          mpesaNumber: mpesaNumber || null,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed to add payout account');
      }

      setSuccess('Payout account added');
      setBankName('');
      setAccountNumber('');
      setAccountName('');
      setMpesaNumber('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add payout account');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-dark-6">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-dark-6">Profile not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark">Settings</h1>
        <p className="text-dark-6 mt-1">Manage your partner profile and payout accounts</p>
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

      <div className="border border-stroke bg-white p-6 shadow-1">
        <h2 className="text-lg font-bold text-dark mb-4">Profile Information</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Partner Code</label>
            <input
              type="text"
              value={profile.partnerCode}
              disabled
              className="w-full border border-stroke bg-gray-50 px-3 py-2 text-sm text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full border border-stroke bg-white px-3 py-2 text-sm text-dark"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Commission Rate</label>
            <input
              type="text"
              value={`${profile.commissionRate}%`}
              disabled
              className="w-full border border-stroke bg-gray-50 px-3 py-2 text-sm text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Status</label>
            <span className={`inline-block px-2 py-1 text-xs font-medium ${
              profile.status === 'ACTIVE' ? 'bg-green-light-6 text-green' : 'bg-gray-100 text-gray-500'
            }`}>
              {profile.status}
            </span>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-primary text-white text-sm font-medium hover:bg-primary-deep disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>

      <div className="border border-stroke bg-white p-6 shadow-1">
        <h2 className="text-lg font-bold text-dark mb-4">Payout Accounts</h2>
        {(profile.payoutAccounts ?? []).length > 0 && (
          <div className="space-y-3 mb-6">
            {(profile.payoutAccounts ?? []).map((account) => (
              <div key={account.id} className="border border-stroke p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-dark">{account.accountName}</p>
                    <p className="text-sm text-dark-6">{account.accountNumber}</p>
                    {account.bankName && <p className="text-sm text-dark-6">{account.bankName}</p>}
                    {account.mpesaNumber && <p className="text-sm text-dark-6">M-Pesa: {account.mpesaNumber}</p>}
                  </div>
                  {account.isDefault && (
                    <span className="px-2 py-1 text-xs bg-cyan/10 text-primary-deep">Default</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddPayoutAccount} className="space-y-4">
          <h3 className="text-sm font-semibold text-dark">Add Payout Account</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Account Name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="border border-stroke bg-white px-3 py-2 text-sm text-dark"
              required
            />
            <input
              type="text"
              placeholder="Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="border border-stroke bg-white px-3 py-2 text-sm text-dark"
              required
            />
            <input
              type="text"
              placeholder="Bank Name (optional)"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="border border-stroke bg-white px-3 py-2 text-sm text-dark"
            />
            <input
              type="text"
              placeholder="M-Pesa Number (optional)"
              value={mpesaNumber}
              onChange={(e) => setMpesaNumber(e.target.value)}
              className="border border-stroke bg-white px-3 py-2 text-sm text-dark"
            />
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-primary text-white text-sm font-medium hover:bg-primary-deep disabled:opacity-50"
          >
            {isSaving ? 'Adding...' : 'Add Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
