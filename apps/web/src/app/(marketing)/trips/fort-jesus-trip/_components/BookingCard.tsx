"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { stops, calculateBooking, getTodayDate, type Stop } from "../_data/trip";

export function BookingCard() {
  const [origin, setOrigin] = useState<Stop>("Mtwapa Beach");
  const [destination, setDestination] = useState<Stop>("Fort Jesus");
  const [date, setDate] = useState(getTodayDate());
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [returnTicket, setReturnTicket] = useState(false);

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

  const bookHref = useMemo(() => {
    const params = new URLSearchParams({
      origin,
      destination,
      date,
      adults: String(adults),
      children: String(children),
      returnTicket: returnTicket ? "1" : "0",
    });
    return `/trips/fort-jesus-trip/book?${params.toString()}`;
  }, [origin, destination, date, adults, children, returnTicket]);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-2xl sm:p-6 lg:w-full lg:max-w-sm">
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
          <Link
            href={bookHref}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0d3b66] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b335a]"
          >
            Continue
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
