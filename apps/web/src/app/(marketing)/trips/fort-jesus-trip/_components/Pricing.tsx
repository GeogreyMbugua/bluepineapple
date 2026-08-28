"use client";

import { useState } from "react";
import Link from "next/link";
import { offers, trip } from "../_data/trip";

const oneWayFares = [
  { stops: 1, price: 500 },
  { stops: 2, price: 700 },
  { stops: 3, price: 1000 },
  { stops: 4, price: 1400 },
  { stops: 5, price: 1800 },
  { stops: 6, price: 2200 },
  { stops: 7, price: 2600 },
  { stops: 8, price: 3000 },
];

const returnFares = [
  { stops: 1, price: 800 },
  { stops: 2, price: 1200 },
  { stops: 3, price: 1500 },
  { stops: 4, price: 1900 },
  { stops: 5, price: 2300 },
  { stops: 6, price: 2700 },
  { stops: 7, price: 3100 },
  { stops: 8, price: 5000 },
];

export function Pricing() {
  const [tab, setTab] = useState<"one-way" | "return">("one-way");
  const fares = tab === "one-way" ? oneWayFares : returnFares;

  return (
    <section className="bg-[#f7f3eb] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b58845] sm:text-xs sm:tracking-[0.28em]">
              Pricing
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Transparent fares
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Fares scale with distance. Pay on board. Children aged 5–15 pay half fare.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={() => setTab("one-way")}
                className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${
                  tab === "one-way"
                    ? "bg-[#0d3b66] text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                One way
              </button>
              <button
                onClick={() => setTab("return")}
                className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${
                  tab === "return"
                    ? "bg-[#0d3b66] text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                Return
              </button>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/trips/fort-jesus-trip/book"
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg bg-[#0d3b66] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b335a]"
              >
                Book Now
              </Link>
              <a
                href={trip.whatsapp.question}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:border-slate-400"
              >
                Ask a Question
              </a>
            </div>
          </div>

          <div>
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="grid grid-cols-2 border-b border-slate-200">
                <div className="px-6 py-3">
                  <span className="text-xs font-medium text-slate-500">Stops</span>
                </div>
                <div className="px-6 py-3 text-right">
                  <span className="text-xs font-medium text-slate-500">Per guest</span>
                </div>
              </div>
              {fares.map((row) => (
                <div
                  key={row.stops}
                  className={`grid grid-cols-2 ${
                    row.stops === 8 ? "bg-[#0d3b66]/5" : ""
                  }`}
                >
                  <div className="px-6 py-3">
                    <span className="text-sm text-slate-700">
                      {row.stops} stop{row.stops > 1 ? "s" : ""}
                      {row.stops === 8 && " (full route)"}
                    </span>
                  </div>
                  <div className="px-6 py-3 text-right">
                    <span className={`text-sm font-semibold ${row.stops === 8 ? "text-[#0d3b66]" : "text-slate-950"}`}>
                      KES {row.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Available offers</p>
              <ul className="mt-4 space-y-2.5">
                {offers.map((offer) => (
                  <li key={offer} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b58845]" />
                    {offer}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
