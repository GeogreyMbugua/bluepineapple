"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { stops, calculateBooking, getTodayDate, type Stop } from "../_data/trip";

type RouteStop = {
  id: string;
  name: string;
  code: string;
};

type DepartureData = {
  id: string;
  departureDateTime: string;
  availableCapacity: number;
  route?: { stops: RouteStop[] };
};

type BookingStatus = "idle" | "loading" | "success" | "error";

export default function BookFortJesusPage() {
  const [departures, setDepartures] = useState<DepartureData[]>([]);
  const [selectedDeparture, setSelectedDeparture] = useState<string>("");
  const [date, setDate] = useState(getTodayDate());
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [returnTicket, setReturnTicket] = useState(false);
  const [origin, setOrigin] = useState<Stop>(stops[0]!);
  const [destination, setDestination] = useState<Stop>(stops[stops.length - 1]!);
  const [status, setStatus] = useState<BookingStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [bookingReference, setBookingReference] = useState<string | null>(null);

  const [primaryGuest, setPrimaryGuest] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    idNumber: "",
  });

  const [additionalGuests, _setAdditionalGuests] = useState<{ fullName: string; phoneNumber: string }[]>([
    { fullName: "", phoneNumber: "" },
  ]);

  const availableDepartures = useMemo(() => {
    return departures.filter((d) => {
      const depDate = new Date(d.departureDateTime).toISOString().split("T")[0];
      return depDate === date && d.availableCapacity > 0;
    });
  }, [departures, date]);

  const selectedDepartureData = useMemo(() => {
    return departures.find((d) => d.id === selectedDeparture);
  }, [departures, selectedDeparture]);

  const summary = useMemo(
    () => calculateBooking(origin, destination, adults, children, 0, returnTicket),
    [origin, destination, adults, children, returnTicket]
  );

  const destinationOptions = useMemo(() => {
    const originIndex = stops.indexOf(origin);
    return stops.slice(originIndex + 1);
  }, [origin]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`/api/bookings?experienceId=cd5f3db7-4b89-44c4-9ceb-56d28bf5109f&date=${date}`);
        if (res.ok) {
          const json = await res.json();
          setDepartures(json.data || []);
        }
      } catch {
        // Handle error silently
      }
    })();
  }, [date]);

  const handleOriginChange = (value: Stop) => {
    setOrigin(value);
    const originIndex = stops.indexOf(value);
    const validDestination = stops[Math.min(originIndex + 1, stops.length - 1)] as Stop;
    setDestination(validDestination);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    if (!selectedDeparture) {
      setError("Please select a departure");
      setStatus("error");
      return;
    }

    try {
      const nameParts = primaryGuest.fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || firstName;

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departureId: selectedDeparture,
          partnerId: "550a0b12-3525-465a-bad4-f74967714c53",
          guest: {
            firstName,
            lastName,
            email: primaryGuest.email || null,
            phone: primaryGuest.phoneNumber || null,
          },
          totalGuests: adults + children,
          totalAmount: summary.total,
           pickupStopId: selectedDepartureData?.route?.stops?.find((s) => s.name === origin)?.id || null,
          specialRequests: "",
          bookingGuests: [
            {
              fullName: primaryGuest.fullName,
              phoneNumber: primaryGuest.phoneNumber || null,
              idNumber: primaryGuest.idNumber || null,
              isPrimary: true,
            },
            ...additionalGuests
              .filter((g) => g.fullName.trim())
              .map((g) => ({
                fullName: g.fullName,
                phoneNumber: g.phoneNumber || null,
                isPrimary: false,
              })),
          ],
          source: "DIRECT",
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || "Booking failed");
      }

      const json = await res.json();
      setBookingReference(json.data.bookingReference);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <main className="min-h-screen bg-[#f7f3eb] pb-24 text-slate-950">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="rounded-lg bg-white p-8 shadow-sm text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-950">Booking Confirmed!</h1>
            <p className="mt-2 text-sm text-slate-600">
              Your booking reference is <span className="font-semibold">{bookingReference}</span>
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Total: <span className="font-semibold">{summary.totalLabel}</span>
            </p>
            <p className="mt-4 text-xs text-slate-500">
              Please arrive 15 minutes before departure. Life jackets will be provided.
            </p>
            <Link
              href="/trips/fort-jesus-trip"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-[#0d3b66] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b335a]"
            >
              Back to Fort Jesus Trip
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3eb] pb-24 text-slate-950 sm:pb-16">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Link
          href="/trips/fort-jesus-trip"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
        >
          <ArrowLeft size={16} />
          Back to Fort Jesus trip
        </Link>

        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b58845] sm:text-xs sm:tracking-[0.28em]">
          Book Now
        </p>
        <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl">
          Reserve your spot
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-base sm:leading-7">
          Select your travel date, boarding point, and passenger details. Your fare updates instantly.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Date & Departure Selection */}
          <div className="rounded-lg bg-white p-5 shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold text-slate-950">1. Select date & departure</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-900">
                Travel date
                <input
                  type="date"
                  value={date}
                  min={getTodayDate()}
                  onChange={(event) => {
                    setDate(event.target.value);
                    setSelectedDeparture("");
                  }}
                  className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </label>

              <label className="block text-sm font-medium text-slate-900">
                Departure time
                <select
                  value={selectedDeparture}
                  onChange={(event) => setSelectedDeparture(event.target.value)}
                  className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                >
                  <option value="">Select departure</option>
                  {availableDepartures.length === 0 ? (
                    <option value="" disabled>No departures available for this date</option>
                  ) : (
                    availableDepartures.map((dep) => (
                      <option key={dep.id} value={dep.id}>
                        {new Date(dep.departureDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} —{" "}
                        {dep.availableCapacity} seats left
                      </option>
                    ))
                  )}
                </select>
                {availableDepartures.length === 0 && (
                  <p className="mt-1 text-xs text-slate-500">Try selecting a different date or contact us for availability.</p>
                )}
              </label>
            </div>
          </div>

          {/* Journey Details */}
          <div className="rounded-lg bg-white p-5 shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold text-slate-950">2. Choose your journey</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-900">
                Boarding point
                <select
                  value={origin}
                  onChange={(event) => handleOriginChange(event.target.value as Stop)}
                  className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                >
                  {stops.slice(0, stops.length - 1).map((stop) => (
                    <option key={stop} value={stop}>
                      {stop}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-900">
                Destination
                <select
                  value={destination}
                  onChange={(event) => {
                    const originIndex = stops.indexOf(origin);
                    const destinationIndex = stops.indexOf(event.target.value as Stop);
                    if (destinationIndex > originIndex) {
                      setDestination(event.target.value as Stop);
                    }
                  }}
                  className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                >
                  {destinationOptions.map((stop) => (
                    <option key={stop} value={stop}>
                      {stop}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              <label className="block text-sm font-medium text-slate-900">
                Adults
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={adults}
                  onChange={(event) => setAdults(Math.max(1, Number(event.target.value)))}
                  className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </label>

              <label className="block text-sm font-medium text-slate-900">
                Children (5-15)
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={children}
                  onChange={(event) => setChildren(Math.max(0, Number(event.target.value)))}
                  className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </label>

              <div className="flex items-end">
                <label className="inline-flex items-center gap-3 text-sm text-slate-900 pb-3">
                  <input
                    type="checkbox"
                    checked={returnTicket}
                    onChange={(event) => setReturnTicket(event.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-[#0d3b66] focus:ring-[#0d3b66]"
                  />
                  <span className="font-medium">Return ticket</span>
                </label>
              </div>
            </div>
          </div>

          {/* Guest Details */}
          <div className="rounded-lg bg-white p-5 shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold text-slate-950">3. Contact & passenger details</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-900 sm:col-span-2">
                Primary contact name
                <input
                  type="text"
                  required
                  value={primaryGuest.fullName}
                  onChange={(event) => setPrimaryGuest({ ...primaryGuest, fullName: event.target.value })}
                  className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </label>

              <label className="block text-sm font-medium text-slate-900">
                Phone number
                <input
                  type="tel"
                  required
                  value={primaryGuest.phoneNumber}
                  onChange={(event) => setPrimaryGuest({ ...primaryGuest, phoneNumber: event.target.value })}
                  className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </label>

              <label className="block text-sm font-medium text-slate-900">
                Email
                <input
                  type="email"
                  value={primaryGuest.email}
                  onChange={(event) => setPrimaryGuest({ ...primaryGuest, email: event.target.value })}
                  className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </label>

              <label className="block text-sm font-medium text-slate-900 sm:col-span-2">
                ID / Passport number
                <input
                  type="text"
                  value={primaryGuest.idNumber}
                  onChange={(event) => setPrimaryGuest({ ...primaryGuest, idNumber: event.target.value })}
                  className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </label>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="rounded-lg bg-white p-5 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Booking summary</p>
            <p className="mt-2 text-sm text-slate-600">
              {origin} → {destination} · {summary.stopCount} stop{summary.stopCount > 1 ? "s" : ""}
              {returnTicket && " · Return"}
            </p>

            <div className="mt-6 flex items-end justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Estimated total</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">{summary.totalLabel}</p>
              </div>
              <div className="text-right text-sm text-slate-600">
                <p>
                  {adults} adult{adults > 1 ? "s" : ""}
                </p>
                <p>
                  {children} child{children !== 1 ? "ren" : ""}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600">{summary.discountLabel}</p>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={status === "loading" || !selectedDeparture}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#0d3b66] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0b335a] disabled:opacity-50"
            >
              {status === "loading" ? "Processing..." : "Confirm booking"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
