import { getServerSession } from '@/lib/auth';
import { getAdminTripCalendar } from '@/lib/services/admin-dashboard.service';
import { prisma } from '@blue-pineapple/database';
import Link from 'next/link';
import { CalendarIcon, ShipIcon, UserIcon, ClockIcon } from '@/components/admin/icons';

export const dynamic = 'force-dynamic';

type TodayDeparture = {
  id: string;
  time: string;
  vessel: string;
  totalCapacity: number;
  bookedSeats: number;
  status: string;
  bookingCount: number;
};

export default async function AdminOperationsPage() {
  const session = await getServerSession();
  if (!session.user) {
    return null;
  }

  const today = new Date().toISOString().split('T')[0] ?? '';
  const calendar = await getAdminTripCalendar('fort-jesus', today, today);
  const todaySummary = calendar.dailySummary[0];

  const todayDepartures: TodayDeparture[] = (todaySummary?.departures ?? []).map((dep) => ({
    id: dep.id,
    time: dep.time,
    vessel: dep.vessel,
    totalCapacity: dep.totalCapacity,
    bookedSeats: dep.bookedSeats,
    status: dep.status,
    bookingCount: dep.bookingCount,
  }));

  const todayBookings = todayDepartures.reduce((sum, d) => sum + d.bookedSeats, 0);
  const activeDepartures = todayDepartures.filter((d) => d.status === 'SCHEDULED').length;
  const totalCapacity = todayDepartures.reduce((sum, d) => sum + d.totalCapacity, 0);

  const recentBlockedDates = await prisma.blockedDate.findMany({
    where: { date: { gte: new Date(today + 'T00:00:00Z') } },
    orderBy: { date: 'asc' },
    take: 5,
    select: { date: true, reason: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark">Operations</h1>
        <p className="mt-1 text-dark-6">Water Taxi — Setting Sons • Fort Jesus daily departures</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPIValue title="Today's Bookings" value={todayBookings} icon={<UserIcon className="size-6" />} />
        <KPIValue title="Active Departures" value={activeDepartures} icon={<ShipIcon className="size-6" />} />
        <KPIValue title="Total Capacity" value={totalCapacity} icon={<CalendarIcon className="size-6" />} />
        <KPIValue title="Upcoming Blocks" value={recentBlockedDates.length} icon={<ClockIcon className="size-6" />} />
      </div>

      <div className="border border-stroke bg-white shadow-1">
        <div className="border-b border-stroke border-l-[3px] border-l-primary px-6 py-5">
          <h2 className="text-xl font-bold text-dark">Today&apos;s Departures</h2>
        </div>
        <div className="p-6">
          {todayDepartures.length === 0 ? (
            <p className="text-sm text-dark-5">No departures scheduled for today.</p>
          ) : (
            <div className="space-y-4">
              {todayDepartures.map((dep) => {
                const occupancy = Math.round((dep.bookedSeats / Math.max(1, dep.totalCapacity)) * 100);
                return (
                  <div key={dep.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-dark">{dep.time} — {dep.vessel}</p>
                      <p className="text-sm text-dark-6">{dep.bookedSeats}/{dep.totalCapacity} seats ({occupancy}%)</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      dep.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                      dep.status === 'BOARDING' ? 'bg-yellow-100 text-yellow-700' :
                      dep.status === 'DEPARTED' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {dep.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {recentBlockedDates.length > 0 && (
        <div className="border border-stroke bg-white shadow-1">
          <div className="border-b border-stroke border-l-[3px] border-l-red px-6 py-5">
            <h2 className="text-xl font-bold text-dark">Upcoming Blocked Dates</h2>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              {recentBlockedDates.map((dateBlock, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-dark">{new Date(dateBlock.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span className="text-dark-6">{dateBlock.reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="border border-stroke bg-white shadow-1">
        <div className="border-b border-stroke border-l-[3px] border-l-primary px-6 py-5">
          <h2 className="text-xl font-bold text-dark">Operations</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href="/admin/blocked-dates"
              className="block p-4 border border-stroke rounded-lg hover:bg-muted transition-colors"
            >
              <span className="font-medium text-dark">Blocked Dates</span>
              <p className="text-sm text-dark-6 mt-1">Manage dates when boats are unavailable</p>
            </Link>
            <Link
              href="/admin/bookings"
              className="block p-4 border border-stroke rounded-lg hover:bg-muted transition-colors"
            >
              <span className="font-medium text-dark">Bookings</span>
              <p className="text-sm text-dark-6 mt-1">View and manage all bookings</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPIValue({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="border border-stroke bg-white shadow-1">
      <div className="border-l-[3px] border-l-primary p-6">
        <div className="flex items-center gap-3 text-primary mb-4">{icon}</div>
        <dt className="text-heading-6 font-bold text-dark">{value}</dt>
        <dd className="text-sm font-medium text-dark-6">{title}</dd>
      </div>
    </div>
  );
}
