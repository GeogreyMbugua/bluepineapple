'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
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
  fortJesusPickupTimes,
  getTodayDate,
  trip,
  type Stop,
} from '../_data/trip';
import { isMpesaStkEnabledPublic } from '@/lib/payments/mpesa-flags';

type BookingStatus =
  | 'idle'
  | 'loading'
  | 'awaiting_payment'
  | 'success'
  | 'error';

type ConfirmationMode = 'paid' | 'request' | 'admin';

type MpesaStkResponse = {
  intentId: string;
  checkoutRequestId: string;
  customerMessage?: string;
};

type BookingCardMode = 'public' | 'admin-partner';

export type AdminPartnerOption = {
  id: string;
  partnerCode: string;
  companyName: string | null;
};

type FormData = {
  fullName: string;
  phoneNumber: string;
  email: string;
};

type PassengerCount = number | '';
type MobileBookingStep = 1 | 2 | 3 | 4;

interface BookingCardProps {
  readonly mode?: BookingCardMode;
  readonly partners?: AdminPartnerOption[];
  readonly defaultPartnerId?: string;
  readonly lockedPartner?: AdminPartnerOption;
  readonly onBookingSuccess?: () => void;
  readonly mobileSheetOpen?: boolean;
  readonly onMobileSheetOpenChange?: (open: boolean) => void;
  readonly hideMobileTrigger?: boolean;
  readonly forceDesktopLayout?: boolean;
  readonly embedded?: boolean;
  readonly showHeader?: boolean;
}

function clampPassengerCount(value: string, minimum: number): PassengerCount {
  if (value.trim() === '') return '';
  const count = Number(value);
  if (!Number.isFinite(count)) return minimum;
  return Math.min(20, Math.max(minimum, count));
}

export function BookingCard({
  mode = 'public',
  partners = [],
  defaultPartnerId = '',
  lockedPartner,
  onBookingSuccess,
  mobileSheetOpen: controlledMobileSheetOpen,
  onMobileSheetOpenChange,
  hideMobileTrigger = false,
  forceDesktopLayout = false,
  embedded = false,
  showHeader = true,
}: BookingCardProps = {}) {
  const isAdminPartner = mode === 'admin-partner';
  const mpesaStkEnabled = isMpesaStkEnabledPublic();
  const applyPublicDiscounts = !isAdminPartner;
  const [partnerId, setPartnerId] = useState(lockedPartner?.id ?? defaultPartnerId);
  const resolvedPartnerId = lockedPartner?.id ?? partnerId;
  const showPartnerSelect = isAdminPartner && !lockedPartner;
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
  const [confirmationMode, setConfirmationMode] =
    useState<ConfirmationMode>('request');
  const [error, setError] = useState<string | null>(null);
  const [bookingReference, setBookingReference] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [paymentHint, setPaymentHint] = useState<string | null>(null);
  const [mpesaReceipt, setMpesaReceipt] = useState<string | null>(null);
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
      { applyDiscounts: applyPublicDiscounts },
    );
  }, [
    origin,
    destination,
    adultCount,
    childCount,
    infantCount,
    returnTicket,
    canCalculatePrice,
    applyPublicDiscounts,
  ]);

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
    setPartnerId(lockedPartner?.id ?? '');
    setMobileStep(1);
    setContactModalOpen(false);
    setStatus('idle');
    setConfirmationMode('request');
    setError(null);
    setBookingReference(null);
    setBookingId(null);
    setPaymentIntentId(null);
    setPaymentHint(null);
    setMpesaReceipt(null);
    setGuest({
      fullName: '',
      phoneNumber: '',
      email: '',
    });
  };
  const setMobileSheetOpen = (open: boolean) => {
    if (!open && (status === 'loading' || status === 'awaiting_payment')) return;
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
    if (status !== 'awaiting_payment' || !paymentIntentId) return;

    let cancelled = false;
    const startedAt = Date.now();
    const softReconcileAfterMs = 15_000;
    const hardTimeoutMs = 90_000;

    const poll = async () => {
      try {
        const elapsed = Date.now() - startedAt;
        const shouldReconcile = elapsed >= softReconcileAfterMs;
        const res = await fetch(
          `/api/payments/intents/${paymentIntentId}${shouldReconcile ? '?reconcile=1' : ''}`,
          { cache: 'no-store' },
        );
        if (!res.ok || cancelled) return;
        const json = (await res.json()) as {
          data?: {
            status?: string;
            mpesaReceiptNumber?: string | null;
            failureReason?: string | null;
          };
        };
        const paymentStatus = json.data?.status;
        if (!paymentStatus) return;

        if (paymentStatus === 'CAPTURED') {
          setMpesaReceipt(json.data?.mpesaReceiptNumber ?? null);
          setConfirmationMode('paid');
          setStatus('success');
          onBookingSuccess?.();
          return;
        }

        if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
          setError(
            json.data?.failureReason ||
              (paymentStatus === 'CANCELLED'
                ? 'M-Pesa prompt was cancelled. You can try again.'
                : 'M-Pesa payment failed. You can try again.'),
          );
          setStatus('error');
          return;
        }

        if (elapsed >= hardTimeoutMs) {
          setError(
            'No confirmation received from M-Pesa yet. Your booking is saved — you can retry payment.',
          );
          setStatus('error');
          return;
        }

        if (elapsed >= softReconcileAfterMs) {
          setPaymentHint(
            'Still waiting for M-Pesa… checking Safaricom status now.',
          );
        }
      } catch {
        // Transient network blip — keep polling.
      }
    };

    void poll();
    const timer = window.setInterval(() => {
      void poll();
    }, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [status, paymentIntentId, onBookingSuccess]);

  const routeStops: Stop[] = [...stops];

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
  const journeyIsValid =
    Boolean(origin && destination && date) &&
    adultCount > 0;
  const isFormValid =
    journeyIsValid &&
    guest.fullName.trim().length > 0 &&
    guest.phoneNumber.trim().length > 0 &&
    guest.email.trim().length > 0 &&
    (!isAdminPartner || resolvedPartnerId.length > 0);

  const hasUnpaidBooking =
    !isAdminPartner &&
    Boolean(bookingId && bookingReference) &&
    status !== 'success' &&
    status !== 'awaiting_payment';

  const dismissPaymentError = () => {
    setStatus('idle');
    setError(null);
    setContactModalOpen(false);
    setPaymentIntentId(null);
    setPaymentHint(null);
    // Keep the trip planner open on the fare step so the unpaid banner is visible.
    if (mobileSheetOpen) setMobileStep(4);
  };

  const unpaidBookingBanner =
    hasUnpaidBooking && bookingReference && mpesaStkEnabled ? (
      <div
        className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left"
        role="status"
        aria-live="polite"
      >
        <p className="text-sm font-semibold text-slate-950">
          Booking {bookingReference} is unpaid
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          {error
            ? error
            : 'Your trip details are saved. Pay with M-Pesa to finish, or start over.'}
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={status === 'loading'}
            onClick={() => {
              void retryMpesaPayment();
            }}
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#0d3b66] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#0b335a] disabled:opacity-50"
          >
            {status === 'loading' ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Sending prompt...
              </>
            ) : (
              'Pay with M-Pesa'
            )}
          </button>
          <button
            type="button"
            disabled={status === 'loading'}
            onClick={() => {
              resetBookingState();
            }}
            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-50"
          >
            Start over
          </button>
        </div>
      </div>
    ) : null;

  const partnerField = showPartnerSelect ? (
    <label className="block text-sm font-medium text-slate-900">
      Partner
      <select
        value={partnerId}
        onChange={(event) => setPartnerId(event.target.value)}
        required
        className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-base text-slate-900 outline-none transition focus:border-[#0d3b66] focus:bg-white sm:text-sm"
      >
        <option value="" disabled>
          Select partner
        </option>
        {partners.map((partner) => (
          <option key={partner.id} value={partner.id}>
            {partner.partnerCode}
            {partner.companyName ? ` — ${partner.companyName}` : ''}
          </option>
        ))}
      </select>
      <p className="mt-1 text-[11px] text-slate-500">
        Partner reward pricing applies. Public couple/group discounts are not used.
      </p>
    </label>
  ) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactModalOpen) {
      if (journeyIsValid) {
        setError(null);
        setContactModalOpen(true);
      }
      return;
    }
    if (!isFormValid) return;

    setStatus('loading');
    setError(null);
    setPaymentHint(null);
    setMpesaReceipt(null);

    try {
      const nameParts = guest.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || firstName;
      const phone = guest.phoneNumber.trim();

      const payload = {
        experienceSlug: 'fort-jesus' as const,
        travelDate: date,
        originStopName: origin,
        destinationStopName: destination,
        guest: {
          firstName,
          lastName,
          email: guest.email || null,
          phone: phone || null,
        },
        totalGuests: passengerCount,
        totalAmount: summary?.total ?? 0,
        adults: adultCount,
        children: childCount,
        infants: infantCount,
        returnTicket,
        specialRequests: '',
        bookingGuests: [
          {
            fullName: guest.fullName,
            phoneNumber: phone || null,
            isPrimary: true,
          },
        ],
        ...(isAdminPartner
          ? {
              partnerId: resolvedPartnerId,
              source: 'ADMIN' as const,
              initiateMpesaStk: false,
            }
          : {
              source: 'DIRECT' as const,
              mpesaPhone: phone,
              initiateMpesaStk: mpesaStkEnabled,
            }),
      };

      const res = await fetch(isAdminPartner ? '/api/admin/bookings' : '/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        ...(isAdminPartner ? { credentials: 'include' as const } : {}),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Booking failed');
      }

      const json = (await res.json()) as {
        data: {
          id: string;
          bookingReference: string;
          reused?: boolean;
          mpesaStkEnabled?: boolean;
          mpesaStk?: MpesaStkResponse;
          stkError?: string;
        };
      };

      setBookingId(json.data.id);
      setBookingReference(json.data.bookingReference);

      if (isAdminPartner) {
        setConfirmationMode('admin');
        setStatus('success');
        onBookingSuccess?.();
        return;
      }

      const stkLive = json.data.mpesaStkEnabled ?? mpesaStkEnabled;
      const stk = json.data.mpesaStk;
      if (stkLive && stk?.intentId) {
        setConfirmationMode('paid');
        setPaymentIntentId(stk.intentId);
        setPaymentHint(
          json.data.reused
            ? 'We found your existing unpaid booking. Check your phone and enter your M-Pesa PIN.'
            : stk.customerMessage ||
                'Check your phone and enter your M-Pesa PIN to complete payment.',
        );
        setStatus('awaiting_payment');
        return;
      }

      if (stkLive) {
        setError(
          json.data.stkError ||
            'Booking was created, but the M-Pesa prompt could not be started. You can retry payment.',
        );
        setStatus('error');
        return;
      }

      // STK parked — save the booking request without implying money was taken.
      setConfirmationMode('request');
      setStatus('success');
      setContactModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
      setStatus('error');
    }
  };

  const retryMpesaPayment = async () => {
    if (!mpesaStkEnabled) {
      setError('Online M-Pesa payment is temporarily unavailable.');
      return;
    }
    if (!bookingId || !guest.phoneNumber.trim()) {
      setError('Missing booking or phone number for payment retry.');
      return;
    }

    setStatus('loading');
    setError(null);
    try {
      const res = await fetch('/api/payments/mpesa/stk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          phone: guest.phoneNumber.trim(),
          amount: summary?.total,
          transactionDesc: 'Booking',
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to start M-Pesa payment');
      }
      const stk = json.data as MpesaStkResponse;
      setPaymentIntentId(stk.intentId);
      setPaymentHint(
        stk.customerMessage ||
          'Check your phone and enter your M-Pesa PIN to complete payment.',
      );
      setStatus('awaiting_payment');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start M-Pesa payment');
      setStatus('error');
    }
  };

  if (status === 'awaiting_payment') {
    return (
      <div
        className={
          embedded
            ? 'rounded-xl border border-slate-200 bg-slate-50 p-6 text-center'
            : 'fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4 md:static md:z-auto md:block md:bg-transparent md:p-0'
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-payment-title"
      >
        <div className={embedded ? 'w-full' : 'w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl sm:p-8'}>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#0d3b66]/10">
            <Loader2 className="h-6 w-6 animate-spin text-[#0d3b66]" aria-hidden="true" />
          </div>
          <p
            id="booking-payment-title"
            className="text-lg font-semibold text-slate-950"
          >
            Confirm payment on your phone
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {paymentHint ||
              'An M-Pesa PIN prompt has been sent. Enter your PIN to complete the booking.'}
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
            Amount: <span className="font-semibold">{summary?.totalLabel}</span>
          </p>
          <p className="mt-4 text-xs text-slate-500" role="status" aria-live="polite">
            Waiting for M-Pesa confirmation…
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div
        className={
          embedded
            ? 'rounded-xl border border-slate-200 bg-slate-50 p-6 text-center'
            : 'fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4 md:static md:z-auto md:block md:bg-transparent md:p-0'
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-success-title"
      >
        <div className={embedded ? 'w-full' : 'w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl sm:p-8'}>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <p
            id="booking-success-title"
            className="text-lg font-semibold text-slate-950"
          >
            {confirmationMode === 'admin'
              ? 'Booking request received'
              : confirmationMode === 'paid'
                ? 'Payment received'
                : 'Booking request received'}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {confirmationMode === 'admin'
              ? 'The partner booking has been created and is pending confirmation.'
              : confirmationMode === 'paid'
                ? 'Your M-Pesa payment went through. You’re booked — we’ll follow up with trip details.'
                : 'Thanks — your trip request is saved. Our team will confirm availability and payment with you shortly.'}
          </p>
          {bookingReference && (
            <p className="mt-4 text-sm text-slate-600">
              Reference:{' '}
              <span className="font-semibold text-slate-950">
                {bookingReference}
              </span>
            </p>
          )}
          {mpesaReceipt && (
            <p className="mt-1 text-sm text-slate-600">
              M-Pesa receipt:{' '}
              <span className="font-semibold text-slate-950">{mpesaReceipt}</span>
            </p>
          )}
          <p className="mt-1 text-sm text-slate-600">
            {origin} → {destination}
            {' · '}
            {origin ? `${fortJesusPickupTimes[origin]} EAT` : 'pickup time'}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Total: <span className="font-semibold">{summary?.totalLabel}</span>
          </p>
          {confirmationMode === 'request' && (
            <a
              href={trip.whatsapp.reserve}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
            >
              Continue on WhatsApp
            </a>
          )}
          <p className="mt-4 text-xs text-slate-500">
            Please arrive 15 minutes before departure. Life jackets will be
            provided.
          </p>
          <button
            type="button"
            onClick={() => {
              setStatus('idle');
              setConfirmationMode('request');
              setBookingReference(null);
              setBookingId(null);
              setPaymentIntentId(null);
              setPaymentHint(null);
              setMpesaReceipt(null);
              setError(null);
              setContactModalOpen(false);
              if (!embedded) setMobileSheetOpen(false);
              else onBookingSuccess?.();
            }}
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#0d3b66] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b335a] focus:outline-none focus:ring-2 focus:ring-[#0d3b66] focus:ring-offset-2"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  if (status === 'error' && bookingReference && !isAdminPartner) {
    return (
      <div
        className={
          embedded
            ? 'rounded-xl border border-slate-200 bg-slate-50 p-6 text-center'
            : 'fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4 md:static md:z-auto md:block md:bg-transparent md:p-0'
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-payment-error-title"
      >
        <div className={embedded ? 'w-full' : 'w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl sm:p-8'}>
          <p
            id="booking-payment-error-title"
            className="text-lg font-semibold text-slate-950"
          >
            Payment not completed
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {error || 'Your booking was saved, but M-Pesa payment did not complete.'}
          </p>
          <p className="mt-4 text-sm text-slate-600">
            Reference:{' '}
            <span className="font-semibold text-slate-950">{bookingReference}</span>
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                void retryMpesaPayment();
              }}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[#0d3b66] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b335a]"
            >
              Retry M-Pesa payment
            </button>
            <button
              type="button"
              onClick={dismissPaymentError}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {!forceDesktopLayout && (
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
                  <p className="text-sm leading-6 text-slate-600">
                    Choose your travel date. Your pickup time is set by your
                    selected stop.
                  </p>
                  <label className="block text-sm font-medium text-slate-900">
                    Travel date
                    <div className="relative mt-2">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b58845]" />
                      <input
                        type="date"
                        value={date}
                        min={getTodayDate()}
                        onChange={(event) => {
                          setDate(event.target.value);
                        }}
                        className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-base text-slate-900 outline-none transition focus:border-[#0d3b66] focus:ring-2 focus:ring-[#0d3b66]/15"
                      />
                    </div>
                  </label>
                  <div className="flex items-start gap-3 rounded-xl bg-white p-4">
                    <Clock3
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#b58845]"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-950">
                        Pickup time
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {origin
                          ? `${origin} · ${fortJesusPickupTimes[origin]} EAT`
                          : 'Choose a pickup point first'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-3">
                    <button type="button" onClick={() => setMobileStep(1)} className="min-h-12 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400">
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!date}
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
                      disabled={adultCount < 1}
                      onClick={() => setMobileStep(4)}
                      className="inline-flex min-h-12 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-[#0d3b66] px-4 text-sm font-semibold text-white transition hover:bg-[#0b335a] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Continue <ArrowRight size={17} />
                    </button>
                  </div>
                </div>
              )}

              {mobileStep === 4 && (
                <div className="mt-7">
                  {unpaidBookingBanner && (
                    <div className="mb-4">{unpaidBookingBanner}</div>
                  )}
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
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Date & pickup</p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">{date} · {origin ? `${fortJesusPickupTimes[origin]} EAT` : '—'}</p>
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
                      disabled={!journeyIsValid || status === 'loading'}
                      onClick={() => {
                        if (hasUnpaidBooking) {
                          void retryMpesaPayment();
                          return;
                        }
                        setContactModalOpen(true);
                      }}
                      className="inline-flex min-h-12 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-[#0d3b66] px-4 text-sm font-semibold text-white transition hover:bg-[#0b335a] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {hasUnpaidBooking && mpesaStkEnabled
                        ? 'Pay with M-Pesa'
                        : 'CHECK FARE'}{' '}
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </div>
              )}
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}

      <form
      onSubmit={handleSubmit}
      className={[
        forceDesktopLayout ? 'block' : 'hidden md:block',
        embedded
          ? 'w-full'
          : forceDesktopLayout
            ? 'w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-5'
            : 'rounded-none border-y border-white/20 bg-white/95 p-4 shadow-2xl backdrop-blur-sm sm:p-6 md:w-full md:max-w-sm md:rounded-2xl md:border md:border-slate-200 md:bg-white',
      ].join(' ')}
      >
      {showHeader && (
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b58845]">
          Fort Jesus Water Taxi
        </p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
          {isAdminPartner ? 'Book for Partner' : 'Book your ride'}
        </h3>
      </div>
      )}

      {partnerField && <div className={showHeader ? 'mt-5' : ''}>{partnerField}</div>}

      {unpaidBookingBanner && (
        <div className={showHeader || partnerField ? 'mt-5' : ''}>
          {unpaidBookingBanner}
        </div>
      )}

      <div className={showHeader || partnerField || unpaidBookingBanner ? 'mt-5 space-y-3' : 'space-y-3'}>
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
            {origin && (
              <p className="mt-1 text-[11px] text-slate-500">
                Boat arrives around {fortJesusPickupTimes[origin]} EAT
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
            onChange={(e) => setDate(e.target.value)}
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

      {summary && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Your fare
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{summary.fareType}</p>
            </div>
            <p className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
              {summary.totalLabel}
            </p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!journeyIsValid || status === 'loading'}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0d3b66] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b335a] focus:outline-none focus:ring-2 focus:ring-[#0d3b66] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {status === 'loading' ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Processing...
          </>
        ) : isAdminPartner ? (
          <>
            Submit request
            <ArrowRight size={16} aria-hidden="true" />
          </>
        ) : hasUnpaidBooking && mpesaStkEnabled ? (
          <>
            Review &amp; pay again
            <ArrowRight size={16} aria-hidden="true" />
          </>
        ) : summary ? (
          <>
            Continue
            <ArrowRight size={16} aria-hidden="true" />
          </>
        ) : (
          <>
            Check availability
            <ArrowRight size={16} aria-hidden="true" />
          </>
        )}
      </button>
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
                  {isAdminPartner
                    ? 'Where should we send your booking details?'
                    : mpesaStkEnabled
                      ? 'Pay with M-Pesa'
                      : 'Confirm your details'}
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {isAdminPartner
                    ? 'Just a few details and we’ll send your request to the team.'
                    : mpesaStkEnabled
                      ? 'Enter your details. We’ll send an M-Pesa PIN prompt to your phone to confirm payment.'
                      : 'Enter your details to save the booking request. We’ll follow up to confirm payment.'}
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
                  {isAdminPartner ? 'Phone number' : 'M-Pesa phone number'}
                </span>
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="07XXXXXXXX or 2547XXXXXXXX"
                  value={guest.phoneNumber}
                  onChange={(e) =>
                    setGuest({ ...guest, phoneNumber: e.target.value })
                  }
                  className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-base text-slate-900 outline-none transition focus:border-[#0d3b66] focus:bg-white sm:text-sm"
                />
                {!isAdminPartner && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    Use the Safaricom number that will receive the PIN prompt.
                  </p>
                )}
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
                {isAdminPartner
                  ? 'Sending your booking request…'
                  : mpesaStkEnabled
                    ? 'Creating booking and sending M-Pesa prompt…'
                    : 'Saving your booking request…'}
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
                    {isAdminPartner
                      ? 'Sending...'
                      : mpesaStkEnabled
                        ? 'Sending prompt...'
                        : 'Submitting...'}
                  </>
                ) : isAdminPartner ? (
                  'Send request'
                ) : mpesaStkEnabled ? (
                  'Pay with M-Pesa'
                ) : (
                  'Submit booking'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
