'use client';

import { useState } from 'react';
import { Modal } from '@/components/admin/ui/modal';
import { Input } from '@/components/admin/ui/input';
import { Button } from '@/components/admin/ui/button';

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateUserModal({ open, onClose, onSuccess }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    clerkUserId: '',
    role: 'USER',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      clerkUserId: '',
      role: 'USER',
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to create user');
      }

      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={() => { resetForm(); onClose(); }} title="Create User">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="border border-red bg-red-light-5 px-4 py-3 text-sm text-red">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-dark">First Name</label>
            <Input
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-dark">Last Name</label>
            <Input
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-dark">Email</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="user@example.com"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-dark">Phone</label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+254 700 000000"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-dark">Clerk User ID</label>
          <Input
            value={formData.clerkUserId}
            onChange={(e) => setFormData({ ...formData, clerkUserId: e.target.value })}
            placeholder="user_..."
          />
          <p className="text-xs text-dark-5 mt-1">
            If provided, the user will be linked to this Clerk identity
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-dark">Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full border border-stroke bg-white px-3 py-2 text-sm text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            <option value="PARTNER">PARTNER</option>
            <option value="FINANCE_MANAGER">FINANCE_MANAGER</option>
            <option value="INVESTOR">INVESTOR</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => { resetForm(); onClose(); }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
