'use client';

import { useState } from 'react';
import { Modal } from '@/components/admin/ui/modal';
import { Input } from '@/components/admin/ui/input';
import { Button } from '@/components/admin/ui/button';

interface CreatePartnerModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreatePartnerForm({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [step, setStep] = useState<'user' | 'partner'>('user');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundUser, setFoundUser] = useState<{ id: string; firstName: string | null; lastName: string | null; email: string | null } | null>(null);

  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [partnerForm, setPartnerForm] = useState({
    partnerCode: '',
    companyName: '',
    commissionRate: 10,
  });

  const searchUser = async () => {
    if (!userForm.email) return;
    setIsSearching(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/search?email=${encodeURIComponent(userForm.email)}`);
      if (res.ok) {
        const json = await res.json();
        setFoundUser(json.data);
      } else {
        setFoundUser(null);
      }
    } catch {
      setError('Failed to search user');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {
        partnerCode: partnerForm.partnerCode,
        companyName: partnerForm.companyName,
        commissionRate: partnerForm.commissionRate,
      };

      if (foundUser) {
        body.userId = foundUser.id;
      } else {
        body.email = userForm.email;
        body.firstName = userForm.firstName;
        body.lastName = userForm.lastName;
        body.phone = userForm.phone || null;
      }

      const res = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed to create partner');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-4 border border-red bg-red-light-5 px-4 py-3 text-sm text-red">
          {error}
        </div>
      )}

      {step === 'user' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              label="Email Address"
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              placeholder="partner@example.com"
            />
            <div className="flex items-end">
              <Button type="button" onClick={searchUser} disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>

          {foundUser ? (
            <div className="border border-stroke bg-muted px-4 py-3">
              <p className="text-sm font-medium text-dark">User Found</p>
              <p className="text-sm text-dark-5">
                {foundUser.firstName} {foundUser.lastName} ({foundUser.email})
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={userForm.firstName}
                  onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                  placeholder="John"
                />
                <Input
                  label="Last Name"
                  value={userForm.lastName}
                  onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
              <Input
                label="Phone Number"
                value={userForm.phone}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                placeholder="+254700000000"
              />
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => setStep('partner')}>
              Next: Partner Details
            </Button>
          </div>
        </div>
      )}

      {step === 'partner' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Partner Code"
              value={partnerForm.partnerCode}
              onChange={(e) => setPartnerForm({ ...partnerForm, partnerCode: e.target.value })}
              placeholder="e.g. 2610"
            />
            <Input
              label="Commission Rate (%)"
              type="number"
              min="0"
              max="100"
              value={partnerForm.commissionRate}
              onChange={(e) => setPartnerForm({ ...partnerForm, commissionRate: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <Input
            label="Company Name"
            value={partnerForm.companyName}
            onChange={(e) => setPartnerForm({ ...partnerForm, companyName: e.target.value })}
            placeholder="e.g. Mombasa Continental Hotel"
          />

          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => setStep('user')}>
              Back
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Partner'}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export function CreatePartnerModal({ open, onClose, onSuccess }: CreatePartnerModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Create Partner">
      <CreatePartnerForm key={open ? 'open' : 'closed'} onSuccess={onSuccess} onClose={onClose} />
    </Modal>
  );
}
