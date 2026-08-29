'use client';

import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/providers/toast-provider';
import { calculatePricing, type Stop } from '@/lib/pricing';

type StopOption = { id: string; name: string; code: string };

type BookingFormData = {
  departureDate: string;
  departureTime: string;
  pickupStopId: string;
  totalGuests: number;
  adults: number;
  children: number;
  infants: number;
  specialRequests: string;
};

type BookingResult = {
  reference: string;
  date: string;
  guests: number;
  totalAmount: number;
};

interface PartnerBookingFormProps {
  onBookingCreated: () => void;
}

export function PartnerBookingForm({ onBookingCreated }: PartnerBookingFormProps) {
  const [stops, setStops] = useState<StopOption[]>([]);
  const [isLoadingStops, setIsLoadingStops] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<BookingResult | null>(null);
  const { addToast } = useToast();

  const [formData, setFormData] = useState<BookingFormData>({
    departureDate: new Date().toISOString().split('T')[0] ?? '',
    departureTime: '09:30',
    pickupStopId: '',
    totalGuests: 1,
    adults: 1,
    children: 0,
    infants: 0,
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
        adults: formData.adults,
        children: formData.children,
        infants: formData.infants,
        returnTicket: false,
        applyDiscounts: false,
      });
    } catch {
      return null;
    }
  }, [selectedStopName, stops, formData.adults, formData.children, formData.infants]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/partner/trips/calendar?startDate=' + new Date().toISOString().split('T')[0], {
          cache: 'no-store',
        });
        if (res.ok) {
          const json = await res.json();
          const firstDay = json.data?.dailySummary?.[0];
          if (firstDay?.departures?.[0]) {
            setStops(firstDay.departures[0].stops);
          }
        }
      } catch {
        // Handle error silently
      } finally {
        setIsLoadingStops(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.pickupStopId) {
      setError('Please select a pickup stop');
      setIsSubmitting(false);
      return;
    }

    try {
      const totalAmount = pricingSummary?.total ?? 0;

      const res = await fetch('/api/partner/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departureDate: formData.departureDate,
          departureTime: formData.departureTime,
          pickupStopId: formData.pickupStopId || null,
          totalGuests: formData.adults + formData.children + formData.infants,
          adults: formData.adults,
          children: formData.children,
          infants: formData.infants,
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
        guests: formData.adults + formData.children + formData.infants,
        totalAmount: bookingTotal,
      });

      addToast(`Booking created successfully! Reference: ${json.data?.bookingReference ?? ''}`, 'success');
      onBookingCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCreatedBooking(null);
    setError(null);
    setFormData({
      departureDate: new Date().toISOString().split('T')[0] ?? '',
      departureTime: '09:30',
      pickupStopId: '',
      totalGuests: 1,
      adults: 1,
      children: 0,
      infants: 0,
      specialRequests: '',
    });
  };

  return (
    <>
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
            onClick={resetForm}
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
              <label className="mb-2 block text-sm font-medium text-dark">Adults</label>
              <input
                type="number"
                min={1}
                max={20}
                value={formData.adults}
                onChange={(e) => setFormData({ ...formData, adults: Math.max(1, parseInt(e.target.value) || 1), totalGuests: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full border border-stroke bg-white px-4 py-2 text-dark"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-dark">Children (5–15)</label>
              <input
                type="number"
                min={0}
                max={20}
                value={formData.children}
                onChange={(e) => setFormData({ ...formData, children: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full border border-stroke bg-white px-4 py-2 text-dark"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-dark">Under 5</label>
              <input
                type="number"
                min={0}
                max={20}
                value={formData.infants}
                onChange={(e) => setFormData({ ...formData, infants: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full border border-stroke bg-white px-4 py-2 text-dark"
              />
              <p className="text-xs text-dark-5 mt-1">Free, but counts toward the vessel capacity.</p>
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
                  <p className="text-xs text-dark-6 uppercase tracking-wider">Fare per guest</p>
                  <p className="text-sm font-medium text-dark mt-1">KES {pricingSummary.baseFare.toLocaleString()}</p>
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
                  {formData.adults + formData.children + formData.infants} guest{formData.adults + formData.children + formData.infants > 1 ? 's' : ''} · partner reward pricing
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
    </>
  );
}
