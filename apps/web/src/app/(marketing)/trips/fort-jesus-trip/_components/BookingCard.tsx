"use client";

import { useState, useMemo, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { stops, calculateBooking, getTodayDate, type Stop } from "../_data/trip";

type BookingStatus = "idle" | "loading" | "success" | "error";

type FormData = {
  fullName: string;
  phoneNumber: string;
  email: string;
  idNumber: string;
};

export function BookingCard() {
  const [origin, setOrigin] = useState<Stop>("Mtwapa Beach");
  const [destination, setDestination] = useState<Stop>("Fort Jesus");
  const [date, setDate] = useState(getTodayDate());
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [returnTicket, setReturnTicket] = useState(false);
  const [status, setStatus] = useState<BookingStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [bookingReference, setBookingReference] = useState<string | null>(null);
  const [guest, setGuest] = useState<FormData>({
    fullName: "",
    phoneNumber: "",
    email: "",
    idNumber: "",
  });

  const handleOriginChange = (value: Stop) => {
    setOrigin(value);
    const originIndex = stops.indexOf(value);
    const validDestination = stops[Math.min(originIndex + 1, stops.length - 1)] as Stop;
    setDestination(validDestination);
  };

  const summary = useMemo(
    () => calculateBooking(origin, destination, adults, children, 0, returnTicket),
    [origin, destination, adults, children, returnTicket]
  );

  const destinationOptions = useMemo(() => {
    const originIndex = stops.indexOf(origin);
    return stops.slice(originIndex + 1);
  }, [origin]);

  const [departures, setDepartures] = useState<
    { id: string; departureDateTime: string; availableCapacity: number; route?: { stops: { id: string; name: string; code: string }[] } }[]
  >([]);
  const [selectedDeparture, setSelectedDeparture] = useState<string>("");
  const [departureLoading, setDepartureLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setDepartureLoading(true);
    setSelectedDeparture("");

    fetch(`/api/bookings?experienceId=cd5f3db7-4b89-44c4-9ceb-56d28bf5109f&date=${date}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((json) => {
        if (!cancelled) {
          const list = json.data || [];
          const filtered = list.filter(
            (d: { departureDateTime: string; availableCapacity: number }) => {
              const depDate = new Date(d.departureDateTime).toISOString().split("T")[0];
              return depDate === date && d.availableCapacity > 0;
            }
          );
          setDepartures(filtered);
          if (filtered.length > 0) setSelectedDeparture(filtered[0].id);
        }
      })
      .catch(() => {
        if (!cancelled) setDepartures([]);
      })
      .finally(() => {
        if (!cancelled) setDepartureLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date]);

  const isFormValid =
    guest.fullName.trim().length > 0 &&
    guest.phoneNumber.trim().length > 0 &&
    selectedDeparture !== "" &&
    adults > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !selectedDeparture) return;

    setStatus("loading");
    setError(null);

    try {
      const nameParts = guest.fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || firstName;

      const selectedDepartureData = departures.find((d) => d.id === selectedDeparture);
      const pickupStopId = selectedDepartureData?.route?.stops?.find((s) => s.name === origin)?.id || null;

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departureId: selectedDeparture,
          partnerId: "550a0b12-3525-465a-bad4-f74967714c53",
          guest: {
            firstName,
            lastName,
            email: guest.email || null,
            phone: guest.phoneNumber || null,
          },
          totalGuests: adults + children,
          totalAmount: summary.total,
          pickupStopId,
          specialRequests: "",
          bookingGuests: [
            {
              fullName: guest.fullName,
              phoneNumber: guest.phoneNumber || null,
              idNumber: guest.idNumber || null,
              isPrimary: true,
            },
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
      <div className="rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-950">Booking confirmed</h3>
        <p className="mt-2 text-sm text-slate-600">
          Reference: <span className="font-semibold">{bookingReference}</span>
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Total: <span className="font-semibold">{summary.totalLabel}</span>
        </p>
        <p className="mt-4 text-xs text-slate-500">
          Please arrive 15 minutes before departure. Life jackets will be provided.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-5 shadow-2xl sm:p-6 lg:w-full lg:max-w-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-950">Book your journey</h3>
        <span className="text-xs font-medium text-[#b58845]">From Ksh {summary.baseFare.toLocaleString()}</span>
      </div>

      <div className="mt-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-400">
              From
            </label>
            <select
              value={origin}
              onChange={(e) => handleOriginChange(e.target.value as Stop)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#0d3b66] focus:bg-white"
            >
              {stops.slice(0, stops.length - 1).map((stop) => (
                <option key={stop} value={stop}>
                  {stop}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-400">
              To
            </label>
            <select
              value={destination}
              onChange={(e) => {
                const originIndex = stops.indexOf(origin);
                const destinationIndex = stops.indexOf(e.target.value as Stop);
                if (destinationIndex > originIndex) {
                  setDestination(e.target.value as Stop);
                }
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#0d3b66] focus:bg-white"
            >
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
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#0d3b66] focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Passengers
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400">Adults</span>
              <input
                type="number"
                min={1}
                max={10}
                value={adults}
                onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#0d3b66] focus:bg-white"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Children</span>
              <input
                type="number"
                min={0}
                max={10}
                value={children}
                onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#0d3b66] focus:bg-white"
              />
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={returnTicket}
            onChange={(e) => setReturnTicket(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[#0d3b66] focus:ring-[#0d3b66]"
          />
          <span className="text-sm font-medium text-slate-700">Return ticket</span>
        </label>
      </div>

      <div className="mt-5 space-y-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Contact details</p>
        <input
          type="text"
          required
          placeholder="Full name"
          value={guest.fullName}
          onChange={(e) => setGuest({ ...guest, fullName: e.target.value })}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#0d3b66] focus:bg-white"
        />
        <input
          type="tel"
          required
          placeholder="Phone number"
          value={guest.phoneNumber}
          onChange={(e) => setGuest({ ...guest, phoneNumber: e.target.value })}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#0d3b66] focus:bg-white"
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={guest.email}
          onChange={(e) => setGuest({ ...guest, email: e.target.value })}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#0d3b66] focus:bg-white"
        />
        <input
          type="text"
          placeholder="ID / Passport (optional)"
          value={guest.idNumber}
          onChange={(e) => setGuest({ ...guest, idNumber: e.target.value })}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#0d3b66] focus:bg-white"
        />

        {departureLoading && (
          <p className="text-xs text-slate-500">Loading available departures...</p>
        )}
        {!departureLoading && departures.length === 0 && (
          <p className="text-xs text-red-600">No departures available for this date.</p>
        )}
        {!departureLoading && departures.length > 0 && (
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Departure
            </label>
            <select
              value={selectedDeparture}
              onChange={(e) => setSelectedDeparture(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#0d3b66] focus:bg-white"
            >
              {departures.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {new Date(dep.departureDateTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  — {dep.availableCapacity} seats left
                </option>
              ))}
            </select>
          </div>
        )}

        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">
              {summary.stopCount} stop{summary.stopCount > 1 ? "s" : ""}
              {returnTicket && " · Return"}
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{summary.totalLabel}</p>
            {summary.discountRate > 0 && (
              <p className="mt-0.5 text-[11px] text-green-700">{summary.discountLabel}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={!isFormValid || status === "loading"}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0d3b66] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b335a] disabled:opacity-50"
          >
            {status === "loading" ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Processing...
              </>
            ) : (
              "Book now"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
