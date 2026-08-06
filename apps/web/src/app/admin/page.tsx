import { KPICard } from '@/components/admin/kpi-card';
import { CalendarIcon, HandshakeIcon, UserIcon, TrendingUpIcon } from '@/components/admin/icons';
import { WaterTaxiSchedule } from '@/components/admin/water-taxi-schedule';
import { getServerSession } from '@/lib/auth';
import {
  getAdminDashboardData,
  getAdminPartnerStats,
  getAdminTripCalendar,
} from '@/lib/services/admin-dashboard.service';
import type { DashboardActivity } from '@/components/admin/types';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await getServerSession();
  if (!session.user) {
    return null;
  }

  const [dashboardData, partnerStats, tripCalendar] = await Promise.all([
    getAdminDashboardData(),
    getAdminPartnerStats(),
    getAdminTripCalendar('fort-jesus'),
  ]);

  const kpis = dashboardData.kpis;
  const recentActivity = dashboardData.recentActivity;

  const activePartners = partnerStats.filter((p) => p.status === 'ACTIVE');
  const quietPartners = partnerStats.filter((p) => p.yearlyBookings === 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark">Dashboard</h1>
        <p className="mt-1 text-dark-6">
          Welcome back, {session.user.firstName ?? session.user.email ?? 'Admin'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Users"
          value={kpis.totalUsers ?? 0}
          icon={<UserIcon className="size-6" />}
          href="/admin/users"
        />
        <KPICard
          title="Active Partners"
          value={kpis.activePartners ?? 0}
          icon={<HandshakeIcon className="size-6" />}
          href="/admin/partners"
        />
        <KPICard
          title="Today's Bookings"
          value={kpis.todayBookings ?? 0}
          icon={<CalendarIcon className="size-6" />}
          href="/admin/bookings"
        />
        <KPICard
          title="Active Departures"
          value={kpis.activeDepartures ?? 0}
          icon={<TrendingUpIcon className="size-6" />}
          href="/admin/operations"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border border-stroke bg-white shadow-1">
          <div className="border-b border-stroke border-l-[3px] border-l-primary px-6 py-5">
            <h2 className="text-2xl font-bold text-dark">Recent Bookings</h2>
          </div>
          <div className="divide-y divide-stroke">
            {recentActivity.length === 0 ? (
              <div className="px-6 py-8 text-center text-dark-6">No bookings yet</div>
            ) : (
              recentActivity.map((activity: DashboardActivity) => (
                <div key={activity.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-dark">{activity.action}</p>
                    <p className="text-sm text-dark-6">{activity.target}</p>
                  </div>
                  <span className="text-sm text-dark-6">{activity.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border border-stroke bg-white shadow-1">
          <div className="border-b border-stroke border-l-[3px] border-l-primary px-6 py-5">
            <h2 className="text-2xl font-bold text-dark">Partner Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-6">Active Partners</span>
                <span className="text-lg font-bold text-dark">{activePartners.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-6">Quiet Partners (0 bookings)</span>
                <span className="text-lg font-bold text-dark">{quietPartners.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-6">Total Partners</span>
                <span className="text-lg font-bold text-dark">{partnerStats.length}</span>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-dark">Top Partners by Bookings</h3>
              <div className="space-y-2">
                {[...partnerStats]
                  .sort((a, b) => b.yearlyBookings - a.yearlyBookings)
                  .slice(0, 5)
                  .map((partner) => (
                    <div key={partner.id} className="flex items-center justify-between">
                      <span className="text-sm text-dark">{partner.companyName ?? partner.partnerCode}</span>
                      <span className="text-sm font-medium text-dark">{partner.yearlyBookings} bookings</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-stroke bg-white shadow-1">
        <div className="border-b border-stroke border-l-[3px] border-l-primary px-6 py-5">
          <h2 className="text-2xl font-bold text-dark">Water Taxi Schedule</h2>
          <p className="mt-1 text-sm text-dark-6">Select a date to view active departures and bookings</p>
        </div>
        <div className="p-4 sm:p-6">
          <WaterTaxiSchedule data={tripCalendar} />
        </div>
      </div>
    </div>
  );
}
