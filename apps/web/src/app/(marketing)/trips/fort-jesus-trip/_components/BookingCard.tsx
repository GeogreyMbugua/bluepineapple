'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Check,
  Info,
  Loader2,
  Mail,
  MapPin,
  Minus,
  Plus,
  Users,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  stops,
  calculateBooking,
  getTodayDate,
  trip,
  type Stop,
} from '../_data/trip';

type BookingStatus = 'idle' | 'loading' | 'success' | 'error';

type FormData = {
  fullName: string;
  phoneNumber: string;
  email: string;
};

type RouteStop = {
  id: string;
  name: string;
  code: string;
  sequence?: number;
  estimatedArrivalMinutes?: number | null;
};

type DepartureData = {
  id: string;
  departureDateTime: string;
  availableCapacity: number;
  onlineAvailableCapacity?: number;
  onlineCapacity?: number;
  route?: { stops: RouteStop[] };
};

type PassengerCount = number | '';
type MobileBookingStep = 1 | 2 | 3 | 4;

interface BookingCardProps {
  readonly mobileSheetOpen?: boolean;
  readonly onMobileSheetOpenChange?: (open: boolean) => void;
  readonly hideMobileTrigger?: boolean;
}

function clampPassengerCount(value: string, minimum: number): PassengerCount {
  if (value.trim() === '') return '';
  const count = Number(value);
  if (!Number.isFinite(count)) return minimum;
  return Math.min(20, Math.max(minimum, count));
}

function formatDepartureTime(dateTime: string) {
  return new Date(dateTime).toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Nairobi',
  });
}

function formatPickupTime(dateTime: string, estimatedArrivalMinutes = 0) {
  const pickupTime = new Date(
    new Date(dateTime).getTime() + estimatedArrivalMinutes * 60_000,
  );
  return formatDepartureTime(pickupTime.toISOString());
}

export function BookingCard({
  mobileSheetOpen: controlledMobileSheetOpen,
  onMobileSheetOpenChange,
  hideMobileTrigger = false,
}: BookingCardProps = {}) {
  const [origin, setOrigin] = useState<Stop | ''>('');
  const [destination, setDestination] = useState<Stop | ''>('');
  const [date, setDate] = useState('');
  const [adults, setAdults] = useState<PassengerCount>('');
  const [children, setChildren] = useState<PassengerCount>('');
  const [infants, setInfants] = useState<PassengerCount>('');
  const [returnTicket, setReturnTicket] = useState(false);
  const [internalMobileSheetOpen, setInternalMobileSheetOpen] = useState(false);
  const [mobileStep, setMobileStep] = useState<MobileBookingStep>(1);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [status, setStatus] = useState<BookingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [bookingReference, setBookingReference] = useState<string | null>(null);
  const [guest, setGuest] = useState<FormData>({
    fullName: '',
    phoneNumber: '',
    email: '',
  });

  const adultCount = typeof adults === 'number' ? adults : 0;
  const childCount = typeof children === 'number' ? children : 0;
  const infantCount = typeof infants === 'number' ? infants : 0;
  const canCalculatePrice = Boolean(origin && destination && adultCount > 0);
  const summary = useMemo(() => {
    if (!canCalculatePrice) return null;
    return calculateBooking(
      origin as Stop,
      destination as Stop,
      adultCount,
      childCount,
      infantCount,
      returnTicket,
    );
  }, [
    origin,
    destination,
    adultCount,
    childCount,
    infantCount,
    returnTicket,
    canCalculatePrice,
  ]);

  const [departures, setDepartures] = useState<DepartureData[]>([]);
  const [selectedDeparture, setSelectedDeparture] = useState<string>('');
  const [departureLoading, setDepartureLoading] = useState(false);
  const [departureError, setDepartureError] = useState<string | null>(null);
  const [availabilityRequest, setAvailabilityRequest] = useState(0);

  const mobileSheetOpen =
    controlledMobileSheetOpen ?? internalMobileSheetOpen;
  const resetBookingState = () => {
    setOrigin('');
    setDestination('');
    setDate('');
    setAdults('');
    setChildren('');
    setInfants('');
    setReturnTicket(false);
    setMobileStep(1);
    setContactModalOpen(false);
    setStatus('idle');
    setError(null);
    setBookingReference(null);
    setGuest({
      fullName: '',
      phoneNumber: '',
      email: '',
    });
    setDepartures([]);
    setSelectedDeparture('');
    setDepartureLoading(false);
    setDepartureError(null);
    setAvailabilityRequest(0);
  };
  const setMobileSheetOpen = (open: boolean) => {
    if (!open && status === 'loading') return;
    if (!open) resetBookingState();
    if (controlledMobileSheetOpen === undefined) {
      setInternalMobileSheetOpen(open);
    }
    onMobileSheetOpenChange?.(open);
  };

  useEffect(() => {
    if (!mobileSheetOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileSheetOpen]);

  useEffect(() => {
    if (window.location.hash !== '#plan-your-trip') return;
    setMobileSheetOpen(true);
    setAdults((value) => (value === '' ? 1 : value));
  }, []);

  useEffect(() => {
    if (!date) return;

    const controller = new AbortController();

    fetch(
      `/api/bookings?experienceSlug=fort-jesus&date=${encodeURIComponent(date)}`,
      {
        signal: controller.signal,
        cache: 'no-store',
      },
    )
      .then((res) => {
        if (!res.ok) throw new Error('We could not check availability.');
        return res.json();
      })
      .then((json) => {
        const list = Array.isArray(json.data) ? json.data : [];
        const filtered = list.filter(
          (departure: DepartureData) =>
            (departure.onlineAvailableCapacity ?? departure.availableCapacity) >
            0,
        );
        setDepartures(filtered);
        if (filtered.length > 0) setSelectedDeparture(filtered[0].id);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setDepartures([]);
        setDepartureError(
          err instanceof Error
            ? err.message
            : 'We could not check availability.',
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setDepartureLoading(false);
      });

    return () => controller.abort();
  }, [date, availabilityRequest]);

  const selectedDepartureData = departures.find(
    (departure) => departure.id === selectedDeparture,
  );
  const selectedOriginStop = selectedDepartureData?.route?.stops?.find(
    (stop) => stop.name === origin,
  );

  const apiStops = selectedDepartureData?.route?.stops
    ?.slice()
    .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
    .map((stop) => stop.name)
    .filter((name): name is Stop => stops.includes(name as Stop));

  // The route is useful even when availability is unavailable. API route data
  // is used when complete; the pricing route remains the safe fallback.
  const routeStops: Stop[] =
    apiStops?.length === stops.length ? apiStops : [...stops];

  const destinationOptions = origin
    ? routeStops.slice(routeStops.indexOf(origin) + 1)
    : [];

  const handleOriginChange = (value: Stop) => {
    setOrigin(value);
    const originIndex = routeStops.indexOf(value);
    if (destination) {
      const destinationIndex = routeStops.indexOf(destination);
      if (destinationIndex <= originIndex) {
        setDestination('');
      }
    }
  };

  const openMobileSheet = () => {
    setAdults((value) => (value === '' ? 1 : value));
    setMobileStep(1);
    setMobileSheetOpen(true);
  };

  const changePassengerCount = (
    current: PassengerCount,
    change: number,
    minimum: number,
    setter: (value: PassengerCount) => void,
  ) => {
    const next = Math.min(
      20,
      Math.max(minimum, (typeof current === 'number' ? current : minimum) + change),
    );
    setter(next);
  };

  const passengerCount = adultCount + childCount + infantCount;
  const availableCapacity =
    selectedDepartureData?.onlineAvailableCapacity ??
    selectedDepartureData?.availableCapacity ??
    0;

  const journeyIsValid =
    Boolean(origin && destination && date) &&
    selectedDeparture !== '' &&
    adultCount > 0 &&
    passengerCount <= availableCapacity &&
    !departureLoading &&
    !departureError;
  const isFormValid =
    journeyIsValid &&
    guest.fullName.trim().length > 0 &&
    guest.phoneNumber.trim().length > 0 &&
    guest.email.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactModalOpen) {
      if (journeyIsValid) {
        setError(null);
        setContactModalOpen(true);
      }
      return;
    }
    if (!isFormValid || !selectedDeparture) return;

    setStatus('loading');
    setError(null);

    try {
      const nameParts = guest.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || firstName;

      const pickupStopId =
        selectedDepartureData?.route?.stops?.find((s) => s.name === origin)
          ?.id || null;
      const destinationStopId =
        selectedDepartureData?.route?.stops?.find((s) => s.name === destination)
          ?.id || null;

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departureId: selectedDeparture,
          guest: {
            firstName,
            lastName,
            email: guest.email || null,
            phone: guest.phoneNumber || null,
          },
          totalGuests: passengerCount,
          totalAmount: summary?.total ?? 0,
          pickupStopId,
          originStopId: pickupStopId,
          destinationStopId,
          adults: adultCount,
          children: childCount,
          infants: infantCount,
          returnTicket,
          specialRequests: '',
          bookingGuests: [
            {
              fullName: guest.fullName,
              phoneNumber: guest.phoneNumber || null,
              isPrimary: true,
            },
          ],
          source: 'DIRECT',
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Booking failed');
      }

      const json = await res.json();
      setBookingReference(json.data.bookingReference);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4 md:static md:z-auto md:block md:bg-transparent md:p-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-success-title"
      >
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl sm:p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <p
            id="booking-success-title"
            className="text-lg font-semibold text-slate-950"
          >
            Booking request received
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Your request has been sent to our team. We’ll be in touch shortly
            to confirm your trip.
          </p>
          {bookingReference && (
            <p className="mt-4 text-sm text-slate-600">
              Reference:{' '}
              <span className="font-semibold text-slate-950">
                {bookingReference}
              </span>
            </p>
          )}
          <p className="mt-1 text-sm text-slate-600">
            {origin} → {destination}
            {' · '}
            {selectedDepartureData && selectedOriginStop
              ? `${formatPickupTime(
                  selectedDepartureData.departureDateTime,
                  selectedOriginStop.estimatedArrivalMinutes ?? 0,
                )} EAT`
              : 'pickup time'}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Total: <span className="font-semibold">{summary?.totalLabel}</span>
          </p>
          <p className="mt-4 text-xs text-slate-500">
            Please arrive 15 minutes before departure. Life jackets will be
            provided.
          </p>
          <button
            type="button"
            onClick={() => {
              setStatus('idle');
              setBookingReference(null);
              setError(null);
              setContactModalOpen(false);
              setMobileSheetOpen(false);
            }}
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#0d3b66] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b335a] focus:outline-none focus:ring-2 focus:ring-[#0d3b66] focus:ring-offset-2"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="md:hidden">
        {!hideMobileTrigger && (
          <button
            id="plan-your-trip"
            type="button"
            onClick={openMobileSheet}
            className="flex min-h-[54px] w-full items-center justify-between rounded-xl bg-[#d6ad69] px-5 text-sm font-bold tracking-[0.08em] text-slate-950 shadow-lg shadow-[#b58845]/15 transition hover:bg-[#e2bd7d] focus:outline-none focus:ring-2 focus:ring-[#d6ad69] focus:ring-offset-2"
          >
            <span>PLAN YOUR TRIP</span>
            <ArrowRight size={19} aria-hidden="true" />
          </button>
        )}

        <AnimatePresence>
          {mobileSheetOpen && (
            <motion.div
              id="mobile-booking-dialog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-0 z-[60] flex items-end bg-slate-950/55"
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-booking-title"
            >
              <button
                type="button"
                aria-label="Close trip planner"
                onClick={() => setMobileSheetOpen(false)}
                className="absolute inset-0 cursor-default"
              />
              <motion.section
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 360, damping: 34 }}
                className="relative max-h-[calc(100dvh-1rem)] w-full overflow-y-auto rounded-t-[1.75rem] bg-[#f7f3eb] px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5 shadow-2xl sm:px-6"
              >
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-slate-300" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b58845]">
                    Plan your trip
                  </p>
                  <h2 id="mobile-booking-title" className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                    {mobileStep === 1 && 'Choose your route'}
                    {mobileStep === 2 && 'Choose your date'}
                    {mobileStep === 3 && 'Who is travelling?'}
                    {mobileStep === 4 && 'Review your fare'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSheetOpen(false)}
                  aria-label="Close trip planner"
                  className="grid min-h-11 min-w-11 place-items-center rounded-full bg-white text-slate-500 transition hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-[#0d3b66]"
                >
                  <X size={20} />
                </button>
              </div>

              <ol className="mt-5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                {(['Route', 'Date', 'Passengers', 'Fare'] as const).map((label, index) => {
                  const step = (index + 1) as MobileBookingStep;
                  return (
                    <li key={label} className="flex items-center gap-1.5">
                      <span
                        aria-current={mobileStep === step ? 'step' : undefined}
                        className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${
                          mobileStep >= step
                            ? 'bg-[#0d3b66] text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className={mobileStep === step ? 'text-slate-950' : undefined}>{label}</span>
                      {index < 3 && <span className="text-slate-300">—</span>}
                    </li>
                  );
                })}
              </ol>

              {mobileStep === 1 && (
                <div className="mt-7 space-y-4">
                  <p className="text-sm leading-6 text-slate-600">Where are you starting, and where are you going?</p>
                  <label className="block text-sm font-medium text-slate-900">
                    Pickup point
                    <div className="relative mt-2">
                      <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b58845]" />
                      <select
                        value={origin}
                        onChange={(event) => handleOriginChange(event.target.value as Stop)}
                        className="min-h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-10 py-3 text-base text-slate-900 outline-none transition focus:border-[#0d3b66] focus:ring-2 focus:ring-[#0d3b66]/15"
                      >
                        <option value="" disabled>Select pickup point</option>
                        {routeStops.slice(0, routeStops.length - 1).map((stop) => (
                          <option key={stop} value={stop}>{stop}</option>
                        ))}
                      </select>
                    </div>
                  </label>
                  <label className="block text-sm font-medium text-slate-900">
                    Destination
                    <div className="relative mt-2">
                      <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b58845]" />
                      <select
                        value={destination}
                        disabled={!origin}
                        onChange={(event) => setDestination(event.target.value as Stop)}
                        className="min-h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-10 py-3 text-base text-slate-900 outline-none transition focus:border-[#0d3b66] focus:ring-2 focus:ring-[#0d3b66]/15 disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        <option value="" disabled>{origin ? 'Select destination' : 'Choose pickup first'}</option>
                        {destinationOptions.map((stop) => (
                          <option key={stop} value={stop}>{stop}</option>
                        ))}
                      </select>
                    </div>
                  </label>
                  <button
                    type="button"
                    disabled={!origin || !destination}
                    onClick={() => setMobileStep(2)}
                    className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0d3b66] px-5 text-sm font-semibold text-white transition hover:bg-[#0b335a] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Continue <ArrowRight size={17} />
                  </button>
                </div>
              )}

              {mobileStep === 2 && (
                <div className="mt-7 space-y-4">
                  <p className="text-sm leading-6 text-slate-600">Choose a travel date and an available departure.</p>
                  <label className="block text-sm font-medium text-slate-900">
                    Travel date
                    <div className="relative mt-2">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b58845]" />
                      <input
                        type="date"
                        value={date}
                        min={getTodayDate()}
                        onChange={(event) => {
                          const nextDate = event.target.value;
                          setDate(nextDate);
                          setDepartureLoading(Boolean(nextDate));
                          setDepartureError(null);
                          setSelectedDeparture('');
                          if (!nextDate) setDepartures([]);
                        }}
                        className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-base text-slate-900 outline-none transition focus:border-[#0d3b66] focus:ring-2 focus:ring-[#0d3b66]/15"
                      />
                    </div>
                  </label>
                  <label className="block text-sm font-medium text-slate-900">
                    Departure
                    <select
                      value={selectedDeparture}
                      onChange={(event) => setSelectedDeparture(event.target.value)}
                      disabled={!date || departureLoading || departures.length === 0}
                      className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-900 outline-none transition focus:border-[#0d3b66] focus:ring-2 focus:ring-[#0d3b66]/15 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">
                        {departureLoading ? 'Checking availability…' : departures.length ? 'Select departure' : 'No departure selected'}
                      </option>
                      {departures.map((departure) => (
                        <option key={departure.id} value={departure.id}>
                          {formatDepartureTime(departure.departureDateTime)} · {departure.onlineAvailableCapacity ?? departure.availableCapacity} seats left
                        </option>
                      ))}
                    </select>
                  </label>
                  {date && !departureLoading && departureError && (
                    <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{departureError}</p>
                  )}
                  {date && !departureLoading && !departureError && departures.length === 0 && (
                    <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-600">No scheduled departure is available for this date.</p>
                  )}
                  <div className="flex gap-3 pt-3">
                    <button type="button" onClick={() => setMobileStep(1)} className="min-h-12 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400">
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!date || departureLoading || Boolean(departureError) || !selectedDeparture}
                      onClick={() => setMobileStep(3)}
                      className="inline-flex min-h-12 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-[#0d3b66] px-4 text-sm font-semibold text-white transition hover:bg-[#0b335a] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Continue <ArrowRight size={17} />
                    </button>
                  </div>
                </div>
              )}

              {mobileStep === 3 && (
                <div className="mt-7">
                  <p className="text-sm leading-6 text-slate-600">How many people are travelling with you?</p>
                  <div className="mt-5 divide-y divide-slate-200 rounded-xl bg-white px-4">
                    {[
                      { label: 'Adults', hint: '18+', value: adults, setter: setAdults, minimum: 1 },
                      { label: 'Children', hint: '5–15', value: children, setter: setChildren, minimum: 0 },
                      { label: 'Under 5', hint: 'Free', value: infants, setter: setInfants, minimum: 0 },
                    ].map((passenger) => (
                      <div key={passenger.label} className="flex min-h-[68px] items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{passenger.label}</p>
                          <p className="text-xs text-slate-500">{passenger.hint}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            aria-label={`Remove ${passenger.label}`}
                            disabled={typeof passenger.value !== 'number' || passenger.value <= passenger.minimum}
                            onClick={() => changePassengerCount(passenger.value, -1, passenger.minimum, passenger.setter)}
                            className="grid h-10 w-10 place-items-center rounded-full border border-slate-300 text-slate-600 transition hover:border-[#0d3b66] hover:text-[#0d3b66] disabled:opacity-30"
                          >
                            <Minus size={15} />
                          </button>
                          <span className="w-5 text-center text-base font-semibold text-slate-950">{passenger.value === '' ? 0 : passenger.value}</span>
                          <button
                            type="button"
                            aria-label={`Add ${passenger.label}`}
                            onClick={() => changePassengerCount(passenger.value, 1, passenger.minimum, passenger.setter)}
                            className="grid h-10 w-10 place-items-center rounded-full border border-slate-300 text-slate-600 transition hover:border-[#0d3b66] hover:text-[#0d3b66]"
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <label className="mt-4 flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={returnTicket}
                      onChange={(event) => setReturnTicket(event.target.checked)}
                      className="h-5 w-5 rounded border-slate-300 text-[#0d3b66] focus:ring-[#0d3b66]"
                    />
                    Return fare
                  </label>
                  <div className="flex gap-3 pt-5">
                    <button type="button" onClick={() => setMobileStep(2)} className="min-h-12 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400">
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={adultCount < 1 || passengerCount > availableCapacity}
                      onClick={() => setMobileStep(4)}
                      className="inline-flex min-h-12 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-[#0d3b66] px-4 text-sm font-semibold text-white transition hover:bg-[#0b335a] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Continue <ArrowRight size={17} />
                    </button>
                  </div>
                  {passengerCount > availableCapacity && (
                    <p className="mt-3 text-sm text-red-600">There are only {availableCapacity} seats left on this departure.</p>
                  )}
                </div>
              )}

              {mobileStep === 4 && (
                <div className="mt-7">
                  <div className="divide-y divide-slate-200 rounded-xl bg-white px-4">
                    <div className="flex items-start justify-between gap-4 py-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Route</p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">{origin} <span className="px-1 text-[#b58845]">→</span> {destination}</p>
                      </div>
                      <MapPin className="mt-1 h-4 w-4 text-[#b58845]" />
                    </div>
                    <div className="flex items-start justify-between gap-4 py-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Date & departure</p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">{date} · {selectedDepartureData ? formatDepartureTime(selectedDepartureData.departureDateTime) : '—'}</p>
                      </div>
                      <CalendarDays className="mt-1 h-4 w-4 text-[#b58845]" />
                    </div>
                    <div className="flex items-start justify-between gap-4 py-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Passengers</p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">{adultCount} adult{adultCount === 1 ? '' : 's'} · {childCount} child{childCount === 1 ? '' : 'ren'} · {infantCount} under 5</p>
                      </div>
                      <Users className="mt-1 h-4 w-4 text-[#b58845]" />
                    </div>
                    <div className="flex items-end justify-between gap-4 py-5">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{summary?.fareType ?? 'Fare'}</p>
                        <p className="mt-1 text-xs text-slate-500">{summary?.discountLabel}</p>
                      </div>
                      <p className="text-2xl font-semibold tracking-tight text-slate-950">{summary?.totalLabel ?? '—'}</p>
                    </div>
                  </div>
                  {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
                  <div className="flex gap-3 pt-5">
                    <button type="button" onClick={() => setMobileStep(3)} className="min-h-12 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400">
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!journeyIsValid}
                      onClick={() => setContactModalOpen(true)}
                      className="inline-flex min-h-12 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-[#0d3b66] px-4 text-sm font-semibold text-white transition hover:bg-[#0b335a] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      CHECK FARE <ArrowRight size={17} />
                    </button>
                  </div>
                </div>
              )}
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form
      onSubmit={handleSubmit}
      className="hidden rounded-none border-y border-white/20 bg-white/95 p-4 shadow-2xl backdrop-blur-sm sm:p-6 md:block md:w-full md:max-w-sm md:rounded-2xl md:border md:border-slate-200 md:bg-white"
      >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b58845]">
          Fort Jesus Water Taxi
        </p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
          Hop On Hop Off
        </h3>
      </div>

      <div className="mt-5 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-400">
              From
            </label>
            <select
              value={origin}
              onChange={(e) => handleOriginChange(e.target.value as Stop)}
              className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-base text-slate-900 outline-none transition focus:border-[#0d3b66] focus:bg-white sm:text-sm"
            >
              <option value="" disabled>
                Select pickup point
              </option>
              {routeStops.slice(0, routeStops.length - 1).map((stop) => (
                <option key={stop} value={stop}>
                  {stop}
                </option>
              ))}
            </select>
            {selectedOriginStop && selectedDepartureData && (
              <p className="mt-1 text-[11px] text-slate-500">
                Boat arrives around{' '}
                {formatPickupTime(
                  selectedDepartureData.departureDateTime,
                  selectedOriginStop.estimatedArrivalMinutes ?? 0,
                )}{' '}
                EAT
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-400">
              To
            </label>
            <select
              value={destination}
              disabled={!origin}
              onChange={(e) => {
                const originIndex = origin ? routeStops.indexOf(origin) : -1;
                const destinationIndex = routeStops.indexOf(
                  e.target.value as Stop,
                );
                if (destinationIndex > originIndex) {
                  setDestination(e.target.value as Stop);
                }
              }}
              className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-base text-slate-900 outline-none transition focus:border-[#0d3b66] focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 sm:text-sm"
            >
              <option value="" disabled>
                {origin ? 'Select destination' : 'Choose pickup first'}
              </option>
              {destinationOptions.map((stop) => (
                <option key={stop} value={stop}>
                  {stop}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Date
          </label>
          <input
            type="date"
            value={date}
            min={getTodayDate()}
            onChange={(e) => {
              const nextDate = e.target.value;
              setDate(nextDate);
              setDepartureLoading(Boolean(nextDate));
              setDepartureError(null);
              setSelectedDeparture('');
              if (!nextDate) setDepartures([]);
            }}
            className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-base text-slate-900 outline-none transition focus:border-[#0d3b66] focus:bg-white sm:text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Passengers
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <span className="text-[10px] text-slate-400">Adults</span>
              <input
                type="number"
                min={1}
                max={20}
                value={adults}
                onChange={(e) =>
                  setAdults(clampPassengerCount(e.target.value, 1))
                }
                className="mt-1 min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-900 outline-none transition focus:border-[#0d3b66] focus:bg-white sm:text-sm"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400">
                Children (5–15)
              </span>
              <input
                type="number"
                min={0}
                max={20}
                value={children}
                onChange={(e) =>
                  setChildren(clampPassengerCount(e.target.value, 0))
                }
                className="mt-1 min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-900 outline-none transition focus:border-[#0d3b66] focus:bg-white sm:text-sm"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Under 5</span>
              <input
                type="number"
                min={0}
                max={20}
                value={infants}
                onChange={(e) =>
                  setInfants(clampPassengerCount(e.target.value, 0))
                }
                className="mt-1 min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-900 outline-none transition focus:border-[#0d3b66] focus:bg-white sm:text-sm"
              />
            </div>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Under-5s travel free; they are still included in capacity.
          </p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={returnTicket}
            onChange={(e) => setReturnTicket(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[#0d3b66] focus:ring-[#0d3b66]"
          />
          <span className="text-sm font-medium text-slate-700">
            Return fare
          </span>
        </label>
      </div>

      {date && departureLoading && (
        <p className="text-xs text-slate-500">
          Loading available departures...
        </p>
      )}
      {date && !departureLoading && departureError && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <p>{departureError}</p>
            <button
              type="button"
              onClick={() => {
                setDepartureLoading(true);
                setDepartureError(null);
                setAvailabilityRequest((request) => request + 1);
              }}
              className="mt-1 font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}
      {date &&
        !departureLoading &&
        !departureError &&
        departures.length === 0 && (
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <p>No scheduled departure is available for this date.</p>
            <a
              href={trip.whatsapp.question}
              className="mt-1 inline-block font-semibold text-[#0d3b66] underline underline-offset-2"
            >
              Ask us about another date
            </a>
          </div>
        )}
      {date &&
        !departureLoading &&
        !departureError &&
        selectedDepartureData && (
          <p className="text-xs font-medium text-[#0d3b66]">
            Online availability: {availableCapacity}/
            {selectedDepartureData.onlineCapacity ?? 20} seats remaining
          </p>
        )}

      {date &&
        !departureLoading &&
        !departureError &&
        selectedDepartureData &&
        passengerCount > availableCapacity && (
          <p className="text-xs text-red-600">
            This departure has {availableCapacity} seat
            {availableCapacity === 1 ? '' : 's'} left. Reduce the passenger
            count or choose another departure.
          </p>
        )}
      {summary && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Your fare
              </p>
              <p className="mt-1 text-xs text-slate-500">{summary.fareType}</p>
            </div>
            <p className="text-2xl font-semibold tracking-tight text-slate-950">
              {summary.totalLabel}
            </p>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={!journeyIsValid || status === 'loading'}
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#0d3b66] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#0b335a] disabled:opacity-50"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Processing...
                </>
              ) : (
                'Submit request'
              )}
            </button>
          </div>
        </div>
      )}
      </form>
      {contactModalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-contact-title"
        >
          <form
            onSubmit={handleSubmit}
            aria-busy={status === 'loading'}
            className="max-h-[calc(100dvh-1rem)] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#0d3b66]/10">
                  <Mail className="h-5 w-5 text-[#0d3b66]" />
                </div>
                <h4
                  id="booking-contact-title"
                  className="text-lg font-semibold text-slate-950"
                >
                  Where should we send your booking details?
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  Just a few details and we’ll send your request to the team.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setContactModalOpen(false);
                  setError(null);
                }}
                aria-label="Close contact details"
                className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700">
                  Full name
                </span>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Your name"
                  value={guest.fullName}
                  onChange={(e) =>
                    setGuest({ ...guest, fullName: e.target.value })
                  }
                  className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-base text-slate-900 outline-none transition focus:border-[#0d3b66] focus:bg-white sm:text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700">
                  Phone number
                </span>
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="Your phone number"
                  value={guest.phoneNumber}
                  onChange={(e) =>
                    setGuest({ ...guest, phoneNumber: e.target.value })
                  }
                  className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-base text-slate-900 outline-none transition focus:border-[#0d3b66] focus:bg-white sm:text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700">
                  Email address
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={guest.email}
                  onChange={(e) =>
                    setGuest({ ...guest, email: e.target.value })
                  }
                  className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-base text-slate-900 outline-none transition focus:border-[#0d3b66] focus:bg-white sm:text-sm"
                />
              </label>
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            {status === 'loading' && (
              <div
                className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-600"
                role="status"
                aria-live="polite"
              >
                <Loader2
                  size={15}
                  className="shrink-0 animate-spin text-[#0d3b66]"
                  aria-hidden="true"
                />
                Sending your booking request…
              </div>
            )}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setContactModalOpen(false);
                  setError(null);
                }}
                className="min-h-10 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!isFormValid || status === 'loading'}
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#0d3b66] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#0b335a] disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send request'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
