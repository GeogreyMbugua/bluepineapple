"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import {
  calculateBooking,
  getTodayDate,
  offers,
  stopRates,
  stops,
  trip,
  type Stop,
} from "../_data/trip";

function JourneyPath({ origin, destination }: { readonly origin: Stop; readonly destination: Stop }) {
  const originIndex = stops.indexOf(origin);
  const destinationIndex = stops.indexOf(destination);

  return (
    <div className="space-y-4">
      {stops.map((stop, index) => {
        const active = index >= originIndex && index <= destinationIndex;
        const isTerminal = index === originIndex || index === destinationIndex;
        return (
          <div key={stop} className="flex items-start gap-4">
            <div className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full border border-slate-300 bg-white">
              <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-[#b58845]" : "bg-slate-300"}`} />
            </div>
            <div>
              <p className={`text-sm font-semibold ${active ? "text-slate-950" : "text-slate-500"}`}>{stop}</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                {isTerminal ? (index === originIndex ? "Boarding" : "Arrival") : "Stop"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function RouteFaresPlanner() {
  const [origin, setOrigin] = useState<Stop>(stops[0]);
  const [destination, setDestination] = useState<Stop>(stops[1]);
  const [date, setDate] = useState(getTodayDate());
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [returnTicket, setReturnTicket] = useState(true);

  const handleOriginChange = (value: Stop) => {
    setOrigin(value);
    const originIndex = stops.indexOf(value);
    const validDestination = stops[Math.min(originIndex + 1, stops.length - 1)] as Stop;
    setDestination(validDestination);
  };

  const handleDestinationChange = (value: Stop) => {
    const originIndex = stops.indexOf(origin);
    const destinationIndex = stops.indexOf(value);
    if (destinationIndex > originIndex) {
      setDestination(value);
    }
  };

  const summary = useMemo(
    () => calculateBooking(origin, destination, adults, children, returnTicket),
    [origin, destination, adults, children, returnTicket],
  );

  const destinationOptions = useMemo(() => {
    const originIndex = stops.indexOf(origin);
    return stops.slice(originIndex + 1);
  }, [origin]);

  const fullFareTable = stopRates
    .map((price, count) => ({ count, price }))
    .filter((row) => row.count > 0);

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
          Route & fares
        </p>
        <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl">
          Plan your journey, see the fare instantly.
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-base sm:leading-7">
          Choose your boarding point, destination and travel date. Your fare updates instantly, with transparent
          pricing and a direct booking path.
        </p>

        {/* Planner form */}
        <div className="mt-8 rounded-lg bg-white p-5 shadow-sm sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
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
                onChange={(event) => handleDestinationChange(event.target.value as Stop)}
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
              Travel date
              <input
                type="date"
                value={date}
                min={getTodayDate()}
                onChange={(event) => setDate(event.target.value)}
                className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
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
                className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
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
                className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
              />
            </label>
          </div>

          <label className="mt-5 inline-flex items-center gap-3 text-sm text-slate-900">
            <input
              type="checkbox"
              checked={returnTicket}
              onChange={(event) => setReturnTicket(event.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-[#0d3b66] focus:ring-[#0d3b66]"
            />
            <span className="font-medium">Return ticket</span>
          </label>
        </div>

        {/* Result summary */}
        <div className="mt-5 rounded-lg bg-white p-5 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Selected journey</p>
          <p className="mt-2 text-sm text-slate-600">
            {origin} → {destination} · {summary.stopCount} stop{summary.stopCount > 1 ? "s" : ""}
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

          <a
            href={trip.whatsapp.reserve}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#0d3b66] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0b335a]"
          >
            Reserve now
            <ArrowUpRight size={16} />
          </a>
        </div>

        {/* Route visualization */}
        <div className="mt-5 rounded-lg bg-white p-5 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Full stop list</p>
          <div className="mt-6">
            <JourneyPath origin={origin} destination={destination} />
          </div>
        </div>

        {/* Full fare table */}
        <div className="mt-5 rounded-lg bg-white p-5 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Full fare table</p>
          <ul className="mt-4 divide-y divide-slate-100">
            {fullFareTable.map((row) => (
              <li key={row.count} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-slate-700">
                  {row.count} stop{row.count > 1 ? "s" : ""}
                  {row.count === stops.length - 1 ? " (full route)" : ""}
                </span>
                <span className="font-semibold text-slate-950">KES {row.price.toLocaleString("en-US")}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Fares shown are per adult, one-way. Children pay half fare. Return tickets are 1.8x the one-way total.
          </p>
        </div>

        {/* Offers */}
        <div className="mt-5 rounded-lg bg-white p-5 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Available offers</p>
          <ul className="mt-4 space-y-3">
            {offers.map((offer) => (
              <li key={offer} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b58845]" />
                {offer}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
