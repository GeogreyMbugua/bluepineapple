'use client';

import { useQuery } from '@tanstack/react-query';
import { KPICard } from '@/components/admin/kpi-card';
import { HandshakeIcon, UserIcon, DollarSignIcon, SeatIcon } from '@/components/admin/icons';
import { WaterTaxiSchedule } from '@/components/admin/water-taxi-schedule';
import type { DashboardActivity } from '@/components/admin/types';
import { adminDashboardOptions, adminPartnerStatsOptions, adminTripCalendarOptions } from '@/lib/queries/admin';

export function DashboardContent() {
  const { data: dashboardData } = useQuery(adminDashboardOptions());
  const { data: partnerStats = [] } = useQuery(adminPartnerStatsOptions());
  const { data: tripCalendar } = useQuery(adminTripCalendarOptions());

  const kpis = dashboardData?.kpis;
  const recentActivity = dashboardData?.recentActivity ?? [];

  const activePartners = partnerStats.filter((p) => p.status === 'ACTIVE');

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-dark-6">
          Welcome back, Admin
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <KPICard
          title="Total Users"
          value={kpis?.totalUsers ?? 0}
          icon={<UserIcon className="size-5 sm:size-6" />}
          href="/admin/users"
        />
        <KPICard
          title="Active Partners"
          value={kpis?.activePartners ?? 0}
          icon={<HandshakeIcon className="size-5 sm:size-6" />}
          href="/admin/partners"
        />
        <KPICard
          title="Today's Revenue"
          value={`KES ${(kpis?.todayRevenue ?? 0).toLocaleString()}`}
          icon={<DollarSignIcon className="size-5 sm:size-6" />}
        />
        <KPICard
          title="Today's Bookings"
          value={kpis?.todayBookings ?? 0}
          icon={<SeatIcon className="size-5 sm:size-6" />}
          href="/admin/operations"
        />
      </div>

      {tripCalendar && (
        <div className="p-3 sm:p-4 md:p-6">
          <WaterTaxiSchedule data={tripCalendar} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="flex flex-col border border-stroke bg-white shadow-1 rounded-lg overflow-hidden">
          <div className="border-b border-stroke px-4 py-3 sm:px-6 sm:py-4">
            <h2 className="text-base font-bold text-dark sm:text-lg">Recent Bookings</h2>
          </div>
          <div className="flex-1 overflow-y-auto max-h-80">
            {recentActivity.length === 0 ? (
              <div className="px-4 py-8 text-center text-dark-6 text-sm sm:px-6">No bookings yet</div>
            ) : (
              <div className="divide-y divide-stroke">
                {recentActivity.map((activity: DashboardActivity) => (
                  <div key={activity.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors sm:px-6 sm:py-3">
                    <div className="min-w-0 pr-3">
                      <p className="text-sm font-medium text-dark truncate">{activity.action}</p>
                      <p className="text-xs text-dark-5 truncate">{activity.target}</p>
                    </div>
                    <span className="text-xs text-dark-5 whitespace-nowrap tabular-nums">{activity.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col border border-stroke bg-white shadow-1 rounded-lg overflow-hidden">
          <div className="border-b border-stroke px-4 py-3 sm:px-6 sm:py-4">
            <h2 className="text-base font-bold text-dark sm:text-lg">Partner Activity</h2>
          </div>
          <div className="flex-1 overflow-y-auto max-h-80 p-4 sm:p-6">
            <div className="grid grid-cols-3 gap-2 mb-4 sm:gap-3 sm:mb-6">
              <div className="rounded-lg border border-stroke bg-gray-50 p-2 text-center sm:p-3">
                <div className="text-base font-bold text-dark sm:text-lg">{activePartners.length}</div>
                <div className="text-[10px] text-dark-5 uppercase tracking-wide mt-0.5 sm:text-xs">Active</div>
              </div>
              <div className="rounded-lg border border-stroke bg-gray-50 p-2 text-center sm:p-3">
                <div className="text-base font-bold text-dark sm:text-lg">{partnerStats.length}</div>
                <div className="text-[10px] text-dark-5 uppercase tracking-wide mt-0.5 sm:text-xs">Total</div>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-dark-5 uppercase tracking-wider mb-2 sm:mb-3">Partners</h3>
              <div className="space-y-1.5 sm:space-y-2">
                {partnerStats.slice(0, 5).map((partner) => (
                  <div key={partner.id} className="flex items-center justify-between">
                    <span className="text-sm text-dark truncate pr-2">{partner.companyName ?? partner.partnerCode}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-stroke bg-white shadow-1 rounded-lg overflow-hidden">
        <div className="border-b border-stroke border-l-[3px] border-l-primary px-4 py-4 sm:px-6 sm:py-5">
          <h2 className="text-xl font-bold text-dark sm:text-2xl">Coastal Experiences</h2>
          <p className="mt-1 text-xs text-dark-6 sm:text-sm">Departures, availability and daily operations</p>
        </div>
        <div className="p-3 sm:p-4 md:p-6">
          {tripCalendar ? (
            <WaterTaxiSchedule data={tripCalendar} />
          ) : (
            <p className="text-sm text-dark-5">Loading calendar...</p>
          )}
        </div>
      </div>
    </div>
  );
}