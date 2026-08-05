import { KPICard } from '@/components/admin/kpi-card';
import { CalendarIcon, HandshakeIcon, UserIcon, TrendingUpIcon } from '@/components/admin/icons';
import { FortJesusCalendar } from '@/components/admin/fort-jesus-calendar';
import { getServerSession } from '@/lib/auth';
import { headers } from 'next/headers';
import type { DashboardActivity, PartnerRow } from '@/components/admin/types';

export const dynamic = 'force-dynamic';

async function getBaseUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

async function getDashboardData(cookieHeader: string) {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/admin/dashboard`, {
    cache: 'no-store',
    headers: { Cookie: cookieHeader },
  });
  if (!res.ok) return { kpis: null, recentActivity: [] };
  const json = await res.json();
  return json.data;
}

async function getPartnerStats(cookieHeader: string): Promise<Array<PartnerRow & { yearlyBookings: number }>> {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/admin/partners/stats`, {
    cache: 'no-store',
    headers: { Cookie: cookieHeader },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

async function getTripCalendar(cookieHeader: string) {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/admin/trips/calendar?experienceSlug=fort-jesus`, {
    cache: 'no-store',
    headers: { Cookie: cookieHeader },
  });
  if (!res.ok) return { dailySummary: [], departures: [], blockedDates: [] };
  const json = await res.json();
  return json.data;
}

export default async function AdminDashboardPage() {
  const session = await getServerSession();
  if (!session.user) {
    return null;
  }

  const cookieHeader = (await headers()).get('cookie') || '';

  const [dashboardData, partnerStats, tripCalendar] = await Promise.all([
    getDashboardData(cookieHeader),
    getPartnerStats(cookieHeader),
    getTripCalendar(cookieHeader),
  ]);

  const kpis = dashboardData?.kpis ?? {
    totalUsers: 0,
    activePartners: 0,
    pendingPartners: 0,
    todayBookings: 0,
    activeDepartures: 0,
  };

  const recentActivity = dashboardData?.recentActivity ?? [];

  const activePartners = partnerStats.filter((p) => p.status === 'ACTIVE');
  const quietPartners = partnerStats.filter((p) => p.yearlyBookings === 0);
  const partnersWithStats = partnerStats as Array<PartnerRow & { yearlyBookings: number }>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark">Dashboard</h1>
        <p className="text-dark-6 mt-1">
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
              <h3 className="text-sm font-semibold text-dark mb-3">Top Partners by Bookings</h3>
              <div className="space-y-2">
                {partnersWithStats
                  .sort((a, b) => b.yearlyBookings - a.yearlyBookings)
                  .slice(0, 5)
                  .map((partner) => (
                    <div key={partner.id} className="flex items-center justify-between">
                      <span className="text-sm text-dark">{partner.companyName}</span>
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
            <h2 className="text-2xl font-bold text-dark">Fort Jesus Calendar</h2>
            <p className="text-sm text-dark-6 mt-1">Select a date to view departures and bookings</p>
          </div>
          <div className="p-4 sm:p-6">
            <FortJesusCalendar data={tripCalendar} />
          </div>
        </div>
    </div>
  );
}
