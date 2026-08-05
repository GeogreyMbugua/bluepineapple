'use client';

import { useState, useEffect } from 'react';

type Booking = {
  id: string;
  bookingReference: string;
  status: string;
  paymentStatus: string;
  totalAmount: string;
  totalGuests: number;
  createdAt: string;
};

type PartnerProfile = {
  partnerCode: string;
  companyName: string | null;
  commissionRate: string;
  status: string;
};

export default function PartnerOverviewPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const [bookingsRes, profileRes] = await Promise.all([
          fetch('/api/partner/bookings', { cache: 'no-store' }),
          fetch('/api/partner/me', { cache: 'no-store' }),
        ]);

        if (bookingsRes.ok) {
          const json = await bookingsRes.json();
          setBookings(json.data || []);
        }

        if (profileRes.ok) {
          const json = await profileRes.json();
          setProfile(json.data);
        }
      } catch {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const totalBookings = bookings.length;
  const totalGuests = bookings.reduce((sum, b) => sum + b.totalGuests, 0);
  const revenue = bookings.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
  const commissionRate = profile ? Number(profile.commissionRate) / 100 : 0;
  const commission = revenue * commissionRate;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-dark">Dashboard</h1>
          <p className="text-dark-6 mt-1">Welcome to your partner dashboard</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-stroke bg-white p-6 shadow-1">
              <div className="h-4 bg-gray-100 rounded animate-pulse mb-3" />
              <div className="h-8 bg-gray-100 rounded animate-pulse w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark">Dashboard</h1>
        <p className="text-dark-6 mt-1">Welcome to your partner dashboard</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-stroke bg-white p-6 shadow-1">
          <p className="text-sm font-medium text-dark-6">Total Bookings</p>
          <p className="mt-2 text-3xl font-bold text-dark">{totalBookings}</p>
        </div>
        <div className="border border-stroke bg-white p-6 shadow-1">
          <p className="text-sm font-medium text-dark-6">Total Guests</p>
          <p className="mt-2 text-3xl font-bold text-dark">{totalGuests}</p>
        </div>
        <div className="border border-stroke bg-white p-6 shadow-1">
          <p className="text-sm font-medium text-dark-6">Revenue</p>
          <p className="mt-2 text-3xl font-bold text-dark">KES {revenue.toLocaleString()}</p>
        </div>
        <div className="border border-stroke bg-white p-6 shadow-1">
          <p className="text-sm font-medium text-dark-6">Commission</p>
          <p className="mt-2 text-3xl font-bold text-dark">KES {Math.round(commission).toLocaleString()}</p>
        </div>
      </div>

      <div className="border border-stroke bg-white shadow-1">
        <div className="border-b border-stroke px-6 py-4">
          <h2 className="text-lg font-bold text-dark">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stroke bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-6 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-6 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-6 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-6 uppercase tracking-wider">Guests</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-6 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-6 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-dark-5">
                    No bookings yet. Create your first booking to see it here.
                  </td>
                </tr>
              ) : (
                bookings.slice(0, 10).map((booking) => (
                  <tr key={booking.id} className="hover:bg-muted transition-colors">
                    <td className="px-6 py-4 font-medium text-dark">{booking.bookingReference}</td>
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
                    <td className="px-6 py-4 text-dark">{booking.totalGuests}</td>
                    <td className="px-6 py-4 text-dark">KES {Number(booking.totalAmount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-dark-6">{new Date(booking.createdAt).toLocaleDateString()}</td>
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
