'use client';

import { useState, useEffect } from 'react';

type BlockedDate = {
  id: string;
  date: string;
  reason: string;
  vesselId: string | null;
  vessel?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  isRecurring: boolean;
  createdAt: string;
};

type Vessel = {
  id: string;
  name: string;
  slug: string;
};

export default function AdminBlockedDatesPage() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    reason: '',
    vesselId: '',
    isRecurring: false,
  });

  useEffect(() => {
    void (async () => {
      try {
        const [datesRes, vesselsRes] = await Promise.all([
          fetch('/api/admin/blocked-dates', { cache: 'no-store' }),
          fetch('/api/admin/fleet', { cache: 'no-store' }),
        ]);

        if (datesRes.ok) {
          const json = await datesRes.json();
          setBlockedDates(json.data || []);
        }
        if (vesselsRes.ok) {
          const json = await vesselsRes.json();
          setVessels(json.data || []);
        }
      } catch {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/blocked-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          reason: formData.reason,
          vesselId: formData.vesselId || null,
          isRecurring: formData.isRecurring,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed to block date');
      }

      setSuccess('Date blocked successfully');
      setFormData({ date: '', reason: '', vesselId: '', isRecurring: false });

      const datesRes = await fetch('/api/admin/blocked-dates', { cache: 'no-store' });
      if (datesRes.ok) {
        const json = await datesRes.json();
        setBlockedDates(json.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to block date');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to unblock this date?')) return;

    try {
      const res = await fetch(`/api/admin/blocked-dates/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to unblock date');
      }

      setSuccess('Date unblocked successfully');
      setBlockedDates(blockedDates.filter((d) => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unblock date');
    }
  };

  if (isLoading) {
    return <div className="text-dark-6">Loading blocked dates...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark">Blocked Dates</h1>
        <p className="text-dark-6 mt-1">Manage dates when boats are unavailable</p>
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
        <div className="border-b border-stroke border-l-[3px] border-l-primary px-6 py-5">
          <h2 className="text-xl font-bold text-dark">Block New Date</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-dark">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full border border-stroke bg-white px-4 py-2 text-dark"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-dark">Vessel (Optional)</label>
              <select
                value={formData.vesselId}
                onChange={(e) => setFormData({ ...formData, vesselId: e.target.value })}
                className="w-full border border-stroke bg-white px-4 py-2 text-dark"
              >
                <option value="">All Vessels</option>
                {vessels.map((vessel) => (
                  <option key={vessel.id} value={vessel.id}>
                    {vessel.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-dark">Reason</label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="e.g., Maintenance, Private charter, Weather"
              className="w-full border border-stroke bg-white px-4 py-2 text-dark"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="h-4 w-4 rounded border-stroke"
            />
            <label htmlFor="isRecurring" className="text-sm text-dark">
              Recurring weekly (same day of week)
            </label>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-white text-sm font-medium hover:bg-primary-deep disabled:opacity-50"
          >
            {isSubmitting ? 'Blocking...' : 'Block Date'}
          </button>
        </form>
      </div>

      <div className="border border-stroke bg-white shadow-1">
        <div className="border-b border-stroke border-l-[3px] border-l-primary px-6 py-5">
          <h2 className="text-xl font-bold text-dark">Blocked Dates</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stroke">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-6 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-6 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-6 uppercase">Vessel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-6 uppercase">Recurring</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-6 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke">
              {blockedDates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-dark-6">
                    No blocked dates
                  </td>
                </tr>
              ) : (
                blockedDates.map((blockedDate) => (
                  <tr key={blockedDate.id}>
                    <td className="px-6 py-4 text-sm text-dark">
                      {new Date(blockedDate.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-dark">{blockedDate.reason}</td>
                    <td className="px-6 py-4 text-sm text-dark">
                      {blockedDate.vessel?.name || 'All Vessels'}
                    </td>
                    <td className="px-6 py-4 text-sm text-dark">
                      {blockedDate.isRecurring ? 'Yes' : 'No'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleDelete(blockedDate.id)}
                        className="text-red hover:text-red-dark"
                      >
                        Unblock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
