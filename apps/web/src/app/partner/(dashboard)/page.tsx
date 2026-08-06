import { getServerSession } from '@/lib/auth';
import { getPartnerDashboardData } from '@/lib/services/partner-dashboard.service';

export const dynamic = 'force-dynamic';

export default async function PartnerDashboardPage() {
  const session = await getServerSession();
  if (!session.user) {
    return null;
  }

  const data = await getPartnerDashboardData(session.user.id);
  if (!data) {
    return <div className="text-dark-6">No partner profile found</div>;
  }

  const { kpis, bookings, profile } = data;

  const displayName = (profile.companyName ?? `${(profile.firstName ?? '')} ${(profile.lastName ?? '')}`.trim()) || 'Partner';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark">Dashboard</h1>
        <p className="text-dark-6 mt-1">Welcome back, {displayName}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-stroke bg-white p-6 shadow-1">
          <p className="text-sm font-medium text-dark-6">Total Bookings</p>
          <p className="mt-2 text-3xl font-bold text-dark">{kpis.totalBookings}</p>
        </div>
        <div className="border border-stroke bg-white p-6 shadow-1">
          <p className="text-sm font-medium text-dark-6">Total Guests</p>
          <p className="mt-2 text-3xl font-bold text-dark">{kpis.totalGuests}</p>
        </div>
        <div className="border border-stroke bg-white p-6 shadow-1">
          <p className="text-sm font-medium text-dark-6">Revenue</p>
          <p className="mt-2 text-3xl font-bold text-dark">KES {kpis.revenue.toLocaleString()}</p>
        </div>
        <div className="border border-stroke bg-white p-6 shadow-1">
          <p className="text-sm font-medium text-dark-6">Commission</p>
          <p className="mt-2 text-3xl font-bold text-dark">
            KES {Math.round(kpis.commission).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="border border-stroke bg-white shadow-1">
        <div className="border-b border-stroke px-6 py-4">
          <h2 className="text-lg font-bold text-dark">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          {bookings.length === 0 ? (
            <div className="px-6 py-8 text-center text-dark-5">
              No bookings yet. Create your first booking to see it here.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stroke bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-6 uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-6 uppercase tracking-wider">Experience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-6 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-6 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-dark-6 uppercase tracking-wider">Guests</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-dark-6 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-dark-6 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-muted transition-colors">
                    <td className="px-6 py-4 font-medium text-dark">{booking.bookingReference}</td>
                    <td className="px-6 py-4 text-dark">{booking.experience}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 text-xs font-medium ${
                        booking.status === 'CONFIRMED' ? 'bg-green-light-6 text-green' :
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 text-xs font-medium ${
                        booking.paymentStatus === 'PAID' ? 'bg-green-light-6 text-green' :
                        booking.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-dark">{booking.totalGuests}</td>
                    <td className="px-6 py-4 text-right text-dark">KES {booking.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-dark-6">{new Date(booking.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
