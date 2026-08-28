"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  stops,
  calculateBooking,
  getTodayDate,
  type Stop,
} from "../_data/trip";

export function BookingModule() {
  const [origin, setOrigin] = useState<Stop>("Mtwapa Beach");
  const [destination, setDestination] = useState<Stop>("Fort Jesus");
  const [date, setDate] = useState(getTodayDate());
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [returnTicket, setReturnTicket] = useState(false);

  const handleOriginChange = (value: Stop) => {
    setOrigin(value);
    const originIndex = stops.indexOf(value);
    const validDestination = stops[Math.min(originIndex + 1, stops.length - 1)] as Stop;
    setDestination(validDestination);
  };

  const summary = useMemo(
    () => calculateBooking(origin, destination, adults, children, infants, returnTicket),
    [origin, destination, adults, children, infants, returnTicket]
  );

  const destinationOptions = useMemo(() => {
    const originIndex = stops.indexOf(origin);
    return stops.slice(originIndex + 1);
  }, [origin]);

  const bookHref = useMemo(() => {
    const params = new URLSearchParams({
      origin,
      destination,
      date,
      adults: String(adults),
      children: String(children),
      infants: String(infants),
      returnTicket: returnTicket ? "1" : "0",
    });
    return `/trips/fort-jesus-trip/book?${params.toString()}`;
  }, [origin, destination, date, adults, children, infants, returnTicket]);

  return (
    <div className="rounded-lg bg-white p-5 shadow-sm sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Book your journey</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-900">
          From
          <select
            value={origin}
            onChange={(event) => handleOriginChange(event.target.value as Stop)}
            className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900"
          >
            {stops.slice(0, stops.length - 1).map((stop) => (
              <option key={stop} value={stop}>
                {stop}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-900">
          To
          <select
            value={destination}
            onChange={(event) => {
              const originIndex = stops.indexOf(origin);
              const destinationIndex = stops.indexOf(event.target.value as Stop);
              if (destinationIndex > originIndex) {
                setDestination(event.target.value as Stop);
              }
            }}
            className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900"
          >
            {destinationOptions.map((stop) => (
              <option key={stop} value={stop}>
                {stop}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-4">
        <label className="block text-sm font-medium text-slate-900">
          Date
          <input
            type="date"
            value={date}
            min={getTodayDate()}
            onChange={(event) => setDate(event.target.value)}
            className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </label>

        <label className="block text-sm font-medium text-slate-900">
          Adults
          <input
            type="number"
            min={1}
            max={10}
            value={adults}
            onChange={(event) => setAdults(Math.max(1, Number(event.target.value)))}
            className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </label>

        <label className="block text-sm font-medium text-slate-900">
          Children
          <input
            type="number"
            min={0}
            max={10}
            value={children}
            onChange={(event) => setChildren(Math.max(0, Number(event.target.value)))}
            className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </label>

        <label className="block text-sm font-medium text-slate-900">
          Infants
          <input
            type="number"
            min={0}
            max={10}
            value={infants}
            onChange={(event) => setInfants(Math.max(0, Number(event.target.value)))}
            className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </label>
      </div>

      <label className="mt-4 inline-flex items-center gap-3 text-sm text-slate-900">
        <input
          type="checkbox"
          checked={returnTicket}
          onChange={(event) => setReturnTicket(event.target.checked)}
          className="h-5 w-5 rounded border-slate-300 text-[#0d3b66] focus:ring-[#0d3b66]"
        />
        <span className="font-medium">Return ticket</span>
      </label>

      <div className="mt-5 flex items-end justify-between gap-4 border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
            {summary.stopCount} stop{summary.stopCount > 1 ? "s" : ""} · {summary.discountLabel}
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">{summary.totalLabel}</p>
        </div>
        <Link
          href={bookHref}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#0d3b66] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b335a]"
        >
          Continue
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
}
