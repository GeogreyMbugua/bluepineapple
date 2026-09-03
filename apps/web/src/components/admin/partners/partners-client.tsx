'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PartnersTableContent } from '@/components/admin/partners/partners-table-content';
import { CreatePartnerModal } from '@/components/admin/partners/create-partner-modal';
import { ImportPartnersModal } from '@/components/admin/partners/import-partners-modal';
import { PartnerBookingDrawer } from '@/components/admin/partners/partner-booking-drawer';
import { useToast } from '@/providers/toast-provider';
import { adminPartnersOptions } from '@/lib/queries/admin/partners';
import { Input } from '@/components/admin/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import type { PartnerRow } from '@/components/admin/types';

const STATUS_FILTERS = ['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED', 'TERMINATED'] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

interface SyncSummary {
  success: number;
  failed: number;
}

export function PartnersClient() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery);
  const [page, setPage] = useState(1);
  const [bookingPartner, setBookingPartner] = useState<PartnerRow | null>(null);

  const {
    data: partnerData = { partners: [], total: 0, page: 1, limit: 20, totalPages: 0, statusCounts: {} },
    isLoading,
    error,
  } = useQuery(adminPartnersOptions({
    status: activeFilter,
    search: debouncedSearch,
    page,
  }));
  const partners = partnerData.partners;

  const refreshPartners = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] });
  }, [queryClient]);

  const handleSyncToClerk = useCallback(async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/admin/partners/sync-clerk', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error((json.error?.message as string) ?? 'Sync failed');
      }
      const json = await res.json();
      const summary: SyncSummary = {
        success: json.data?.summary?.success ?? 0,
        failed: json.data?.summary?.failed ?? 0,
      };
      setSyncResult(summary);
      addToast(`Sync complete: ${summary.success} succeeded, ${summary.failed} failed`, 'success');
      refreshPartners();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      addToast(message, 'error');
    } finally {
      setIsSyncing(false);
    }
  }, [addToast, refreshPartners]);

  const stats = useMemo(() => ({
    total: partnerData.total,
    active: partnerData.statusCounts.ACTIVE ?? 0,
    pending: partnerData.statusCounts.PENDING ?? 0,
    suspended: partnerData.statusCounts.SUSPENDED ?? 0,
  }), [partnerData]);

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">Partners</h1>
          <p className="mt-1 text-dark-6">Manage partner accounts, profiles, and bookings</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton variant="secondary" onClick={() => setShowImportModal(true)}>
            Import Excel
          </ActionButton>
          <ActionButton variant="secondary" onClick={handleSyncToClerk} disabled={isSyncing}>
            {isSyncing ? 'Syncing…' : 'Sync to Clerk'}
          </ActionButton>
          <ActionButton onClick={() => setShowCreateModal(true)}>
            Create Partner
          </ActionButton>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Partners" value={stats.total} />
        <StatCard label="Active" value={stats.active} accent="green" />
        <StatCard label="Pending" value={stats.pending} accent="yellow" />
        <StatCard label="Suspended" value={stats.suspended} accent="red" />
      </div>

      {/* Sync Result Banner */}
      {syncResult && (
        <div className="border border-stroke bg-white p-4">
          <p className="text-sm font-medium text-dark">
            Clerk Sync Complete:&nbsp;
            {syncResult.success > 0 && <span className="text-green-700">{syncResult.success} succeeded</span>}
            {syncResult.success > 0 && syncResult.failed > 0 && ', '}
            {syncResult.failed > 0 && <span className="text-red-600">{syncResult.failed} failed</span>}
          </p>
        </div>
      )}

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => {
              setActiveFilter(status);
              setPage(1);
            }}
            disabled={isLoading}
            className={[
              'rounded border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60',
              activeFilter === status
                ? 'border-cyan-deep bg-primary text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-cyan hover:text-primary-deep',
            ].join(' ')}
          >
            {status === 'ALL' ? 'All' : status}
          </button>
        ))}
        {isLoading && <span className="self-center ml-2 text-sm text-dark-5">Loading…</span>}
      </div>

      <div className="max-w-sm">
        <Input
          type="search"
          label="Search partners"
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Name, company, code, or email"
        />
        {searchQuery !== debouncedSearch && (
          <p className="mt-1 text-xs text-dark-5">Searching…</p>
        )}
      </div>

      {/* Partners Table */}
      {error ? (
        <div className="border border-red bg-red-light-5 px-4 py-3 text-sm text-red">
          Failed to load partners. Please try again.
        </div>
      ) : (
        <>
          <PartnersTableContent
            partners={partners}
            onBookPartner={(partner) => setBookingPartner(partner)}
          />
          {partnerData.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-dark-5">
                Page {partnerData.page} of {partnerData.totalPages} ({partnerData.total} partners)
              </p>
              <div className="flex gap-2">
                <ActionButton
                  variant="secondary"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1 || isLoading}
                >
                  Previous
                </ActionButton>
                <ActionButton
                  variant="secondary"
                  onClick={() => setPage((current) => Math.min(partnerData.totalPages, current + 1))}
                  disabled={page >= partnerData.totalPages || isLoading}
                >
                  Next
                </ActionButton>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <CreatePartnerModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={refreshPartners}
      />
      <ImportPartnersModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={refreshPartners}
      />
      <PartnerBookingDrawer
        open={bookingPartner !== null}
        partner={
          bookingPartner
            ? {
                id: bookingPartner.id,
                partnerCode: bookingPartner.partnerCode,
                companyName: bookingPartner.companyName,
              }
            : null
        }
        onClose={() => setBookingPartner(null)}
        onSuccess={() => {
          addToast('Partner booking created successfully', 'success');
          queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
        }}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Local sub-components (co-located since they're page-specific)
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: 'green' | 'yellow' | 'red';
}) {
  const accentClass = {
    green: 'text-green-700',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    undefined: 'text-dark',
  }[String(accent)];

  return (
    <div className="border border-stroke bg-white p-4">
      <p className={`text-2xl font-bold ${accentClass ?? 'text-dark'}`}>{value}</p>
      <p className="text-sm text-dark-5">{label}</p>
    </div>
  );
}

function ActionButton({
  variant = 'primary',
  onClick,
  children,
  disabled,
}: {
  variant?: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'rounded px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary'
          ? 'bg-primary text-white hover:bg-primary-deep'
          : 'border border-stroke bg-white text-dark hover:bg-muted',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
