'use client';

import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/providers/toast-provider';
import { notifyNewBooking } from '@/hooks/use-booking-notifications';
import { calculatePricing, type Stop } from '@/lib/pricing';

type BookingFormData = {
  departureDate: string;
  departureTime: string;
  pickupStopId: string;
  totalGuests: number;
  specialRequests: string;
};

interface PartnerBookingFormProps {
  onBookingCreated: () => void;
  partnerName?: string;
}

export function PartnerBookingForm({ onBookingCreated, partnerName = 'Partner' }: PartnerBookingFormProps) {
  const [stops, setStops] = useState<{ id: string; name: string; code: string }[]>([]);
  const [isLoadingStops, setIsLoadingStops] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<{ reference: string; date: string; guests: number; totalAmount: number } | null>(null);
  const { addToast } = useToast();

  const [formData, setFormData] = useState<BookingFormData>({
    departureDate: new Date().toISOString().split('T')[0] ?? '',
    departureTime: '09:30',
    pickupStopId: '',
    totalGuests: 1,
    specialRequests: '',
  });

  const selectedStop = stops.find((s) => s.id === formData.pickupStopId);
  const selectedStopName = selectedStop?.name ?? '';

  const pricingSummary = useMemo(() => {
    if (!selectedStopName || stops.length === 0) return null;
    const origin = selectedStopName as Stop;
    const destination = 'Fort Jesus';
    try {
      return calculatePricing({
        origin,
        destination,
        adults: formData.totalGuests,
        children: 0,
        infants: 0,
        returnTicket: false,
      });
    } catch {
      return null;
    }
  }, [selectedStopName, stops, formData.totalGuests]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/partner/trips/calendar?startDate=' + new Date().toISOString().split('T')[0], { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          const firstDay = json.data?.dailySummary?.[0];
          if (firstDay?.departures?.[0]) {
            setStops(firstDay.departures[0].stops);
          }
        }
      } catch {
        // Handle error
      } finally {
        setIsLoadingStops(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const totalAmount = pricingSummary?.total ?? 0;

      const res = await fetch('/api/partner/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departureDate: formData.departureDate,
          departureTime: formData.departureTime,
          pickupStopId: formData.pickupStopId || null,
          totalGuests: formData.totalGuests,
          totalAmount,
          specialRequests: formData.specialRequests || null,
          source: 'PARTNER',
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to create booking');
      }

      const bookingTotal = Number(json.data?.totalAmount ?? totalAmount);
      setCreatedBooking({
        reference: json.data?.bookingReference ?? '',
        date: formData.departureDate,
        guests: formData.totalGuests,
        totalAmount: bookingTotal,
      });

      addToast(`Booking created successfully! Reference: ${json.data?.bookingReference ?? ''}`, 'success');

      notifyNewBooking({
        id: json.data?.id ?? '',
        bookingReference: json.data?.bookingReference ?? '',
        partnerName,
        totalGuests: formData.totalGuests,
        totalAmount: bookingTotal,
      });

      onBookingCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-stroke bg-white shadow-1">
      <div className="border-b border-stroke border-l-[3px] border-l-primary px-6 py-5">
        <h2 className="text-xl font-bold text-dark">New Booking</h2>
        <p className="text-xs text-dark-6 mt-1">Fort Jesus Hop-On Hop-Off • Daily 9:30 AM • Setting Sons</p>
      </div>

      {createdBooking ? (
        <div className="p-6">
          <div className="border border-green bg-green-light-6 px-4 py-3 text-sm text-green mb-4">
            Booking created successfully
          </div>
          <div className="space-y-3 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-dark-6 uppercase tracking-wider">Reference</p>
                <p className="text-sm font-medium text-dark mt-1">{createdBooking.reference}</p>
              </div>
              <div>
                <p className="text-xs text-dark-6 uppercase tracking-wider">Date</p>
                <p className="text-sm font-medium text-dark mt-1">{createdBooking.date}</p>
              </div>
              <div>
                <p className="text-xs text-dark-6 uppercase tracking-wider">Guests</p>
                <p className="text-sm font-medium text-dark mt-1">{createdBooking.guests}</p>
              </div>
              <div>
                <p className="text-xs text-dark-6 uppercase tracking-wider">Total Amount</p>
                <p className="text-sm font-medium text-dark mt-1">KES {createdBooking.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setCreatedBooking(null);
              setError(null);
            }}
            className="px-4 py-2 bg-primary text-white text-sm font-medium hover:bg-primary-deep"
          >
            Create Another Booking
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="border border-red bg-red-light-5 px-4 py-3 text-sm text-red">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-dark">Departure Date</label>
              <input
                type="date"
                value={formData.departureDate}
                onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                className="w-full border border-stroke bg-white px-4 py-2 text-dark"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-dark">Departure Time</label>
              <input
                type="text"
                value="9:30 AM (daily)"
                disabled
                className="w-full border border-stroke bg-gray-100 px-4 py-2 text-dark-6"
              />
              <p className="text-xs text-dark-5 mt-1">Fixed daily departure</p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-dark">Board at (Pickup Stop)</label>
            <select
              value={formData.pickupStopId}
              onChange={(e) => setFormData({ ...formData, pickupStopId: e.target.value })}
              className="w-full border border-stroke bg-white px-4 py-2 text-dark"
              required
              disabled={isLoadingStops}
            >
              <option value="">Select pickup stop...</option>
              {stops.map((stop) => (
                <option key={stop.id} value={stop.id}>
                  {stop.code} - {stop.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-dark-5 mt-1">Hop on at any stop along the route</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-dark">Total Guests</label>
            <input
              type="number"
              min={1}
              max={20}
              value={formData.totalGuests}
              onChange={(e) => setFormData({ ...formData, totalGuests: parseInt(e.target.value) || 1 })}
              className="w-full border border-stroke bg-white px-4 py-2 text-dark"
              required
            />
            <p className="text-xs text-dark-5 mt-1">Max 20 guests per online booking (15 seats reserved for walk-ins)</p>
          </div>

          {pricingSummary && (
            <div className="border border-stroke bg-muted p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-dark-6 uppercase tracking-wider">Route</p>
                  <p className="text-sm font-medium text-dark mt-1">
                    {selectedStopName} → Fort Jesus · {pricingSummary.stopCount} stop{pricingSummary.stopCount > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-dark-6 uppercase tracking-wider">Price per guest</p>
                  <p className="text-sm font-medium text-dark mt-1">KES {pricingSummary.oneWayAdultFare.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-stroke pt-3">
                <div>
                  <p className="text-xs text-dark-6 uppercase tracking-wider">Total</p>
                  <p className="text-lg font-bold text-primary-deep">
                    KES {pricingSummary.total.toLocaleString()}
                  </p>
                </div>
                <div className="text-right text-xs text-dark-6">
                  {formData.totalGuests} guest{formData.totalGuests > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-dark">Special Requests</label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              rows={3}
              className="w-full border border-stroke bg-white px-4 py-2 text-dark"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-white text-sm font-medium hover:bg-primary-deep disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Booking'}
          </button>
        </form>
      )}
    </div>
  );
}
