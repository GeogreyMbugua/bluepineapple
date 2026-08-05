'use client';

import { useState, useEffect } from 'react';
import { PartnersTableContent } from '@/components/admin/partners/partners-table-content';
import { CreatePartnerModal } from '@/components/admin/partners/create-partner-modal';
import { ImportPartnersModal } from '@/components/admin/partners/import-partners-modal';
import type { PartnerRow } from '@/components/admin/types';

async function fetchPartners() {
  const res = await fetch('/api/admin/partners', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch partners');
  const json = await res.json();
  return json.data.partners as PartnerRow[];
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: number; failed: number } | null>(null);

  const loadPartners = async () => {
    try {
      const data = await fetchPartners();
      setPartners(data);
    } catch {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncToClerk = async () => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      const res = await fetch('/api/admin/partners/sync-clerk', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Sync failed');
      }

      const json = await res.json();
      setSyncResult({
        success: json.data.summary.success,
        failed: json.data.summary.failed,
      });
      loadPartners();
    } catch (err) {
      setSyncResult({
        success: 0,
        failed: -1,
      });
      alert(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPartners();
  }, []);

  const filtered = filter === 'ALL' ? partners : partners.filter((p) => p.status === filter);

  const stats = {
    total: partners.length,
    active: partners.filter((p) => p.status === 'ACTIVE').length,
    pending: partners.filter((p) => p.status === 'PENDING').length,
    suspended: partners.filter((p) => p.status === 'SUSPENDED').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark">Partners</h1>
          <p className="text-dark-6 mt-1">Manage partner accounts and profiles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowImportModal(true)}>
            Import Excel
          </Button>
          <Button variant="secondary" onClick={handleSyncToClerk} disabled={isSyncing}>
            {isSyncing ? 'Syncing...' : 'Sync to Clerk'}
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            Create Partner
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Partners" value={stats.total} />
        <StatCard label="Active" value={stats.active} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Suspended" value={stats.suspended} />
      </div>

      {syncResult && (
        <div className="border border-stroke bg-white p-4">
          <p className="text-sm font-medium text-dark">
            Clerk Sync Complete: {syncResult.success > 0 && `${syncResult.success} succeeded`}
            {syncResult.success > 0 && syncResult.failed > 0 && ', '}
            {syncResult.failed > 0 && `${syncResult.failed} failed`}
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED', 'TERMINATED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-sm font-medium border transition-colors ${
              filter === status
                ? 'bg-primary text-white border-cyan-deep'
                : 'bg-white text-gray-600 border-gray-200 hover:border-cyan hover:text-primary-deep'
            }`}
          >
            {status === 'ALL' ? 'All' : status}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <PartnersTableContent partners={filtered} />
      )}

      <CreatePartnerModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadPartners}
      />

      <ImportPartnersModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={loadPartners}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-stroke bg-white p-4">
      <p className="text-2xl font-bold text-dark">{value}</p>
      <p className="text-sm text-dark-5">{label}</p>
    </div>
  );
}

function Button({ variant = 'primary', onClick, children, disabled }: {
  variant?: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 text-sm font-medium transition-colors ${
        variant === 'primary'
          ? 'bg-primary text-white hover:bg-primary-deep'
          : 'border border-stroke bg-white text-dark hover:bg-muted'
      }`}
    >
      {children}
    </button>
  );
}
