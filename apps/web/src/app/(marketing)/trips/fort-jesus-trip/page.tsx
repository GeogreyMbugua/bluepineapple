"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { publicPath } from "@/lib/paths";

const stops = [
  "Mtwapa Beach",
  "Serena",
  "Bamburi",
  "Whitesands",
  "Pirates",
  "Mombasa Beach",
  "Nyali",
  "English Point",
  "Fort Jesus",
] as const;

type Stop = (typeof stops)[number];

const timeline = [
  {
    label: "Departure",
    time: "09:30 AM",
    description: "First coastal departure from Mtwapa Beach.",
  },
  {
    label: "Journey",
    time: "11:00 AM",
    description: "Scenic passage along the harbour and coral coastline.",
  },
  {
    label: "Arrival",
    time: "11:30 AM",
    description: "Touch down at the historic Fort Jesus pier.",
  },
];

const galleryImages = [
  {
    src: publicPath("/assets/fort.webp"),
    alt: "Fort Jesus coastal view",
    caption: "The destination from the water.",
  },
  {
    src: publicPath("/assets/galleryImage3.webp"),
    alt: "Passengers boarding the water taxi",
    caption: "Board at any stop, every day.",
  },
  {
    src: publicPath("/assets/set.webp"),
    alt: "Sunset voyage along the coast",
    caption: "Sunset return from Fort Jesus.",
  },
];

const faqItems = [
  {
    question: "How do I reserve a seat?",
    answer: "Select your boarding point, destination and travel date, then confirm your reservation via WhatsApp.",
  },
  {
    question: "Can I board at any stop?",
    answer: "Yes — the coastal service stops at all nine boarding points between Mtwapa Beach and Fort Jesus.",
  },
  {
    question: "Is the fare fixed?",
    answer: "Fare is transparent and updates as you choose your journey length and passenger mix.",
  },
  {
    question: "Are return tickets available?",
    answer: "Yes — return options are included and reflected instantly in the estimate.",
  },
];

const stopRates = [0, 500, 750, 1000, 1250, 1650, 2050, 2450, 3000];

function formatKsh(value: number) {
  return `Ksh ${value.toLocaleString("en-US")}`;
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function calculateBooking(origin: Stop, destination: Stop, adults: number, children: number, returnTicket: boolean) {
  const originIndex = stops.indexOf(origin);
  const destinationIndex = stops.indexOf(destination);
  const stopCount = Math.max(1, destinationIndex - originIndex);
  const baseFare = stopRates[stopCount];
  const adultFare = baseFare;
  const childFare = Math.round(baseFare * 0.5);
  const subtotal = adultFare * adults + childFare * children;
  let discountRate = 0;
  const discounts: string[] = [];

  if (adults === 2 && children === 0) {
    discountRate += 0.1;
    discounts.push("10% couple savings");
  }

  if (adults + children >= 4) {
    discountRate += 0.08;
    discounts.push("8% group savings");
  }

  const discounted = Math.round(subtotal * (1 - discountRate));
  const total = returnTicket ? Math.round(discounted * 1.8) : discounted;

  return {
    stopCount,
    adultFare,
    childFare,
    subtotal,
    discountRate,
    discounts,
    total,
    totalLabel: formatKsh(total),
    baseLabel: formatKsh(baseFare),
    adultLabel: formatKsh(adultFare),
    childLabel: formatKsh(childFare),
    discountLabel: discounts.length > 0 ? discounts.join(" • ") : "Standard fare applies",
  };
}

function JourneyPath({ origin, destination }: { origin: Stop; destination: Stop }) {
  const originIndex = stops.indexOf(origin);
  const destinationIndex = stops.indexOf(destination);

  return (
    <div className="space-y-4">
      {stops.map((stop, index) => {
        const active = index >= originIndex && index <= destinationIndex;
        const isTerminal = index === originIndex || index === destinationIndex;
        return (
          <div key={stop} className="flex items-start gap-4">
            <div className="mt-1 h-4 w-4 rounded-full border border-slate-300 bg-white text-transparent grid place-items-center text-xs font-semibold">
              <span className={active ? "bg-[#b58845] h-4 w-4 rounded-full" : "bg-slate-300 h-4 w-4 rounded-full"} />
            </div>
            <div>
              <p className={`text-sm font-semibold ${active ? "text-slate-950" : "text-slate-500"}`}>{stop}</p>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                {isTerminal ? (index === originIndex ? "Boarding" : "Arrival") : "Stop"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LiveBookingPlanner({
  origin,
  destination,
  setOrigin,
  setDestination,
  date,
  setDate,
  adults,
  setAdults,
  children,
  setChildren,
  returnTicket,
  setReturnTicket,
  summary,
}: {
  origin: Stop;
  destination: Stop;
  setOrigin: (value: Stop) => void;
  setDestination: (value: Stop) => void;
  date: string;
  setDate: (value: string) => void;
  adults: number;
  setAdults: (value: number) => void;
  children: number;
  setChildren: (value: number) => void;
  returnTicket: boolean;
  setReturnTicket: (value: boolean) => void;
  summary: ReturnType<typeof calculateBooking>;
}) {
  const destinationOptions = useMemo(() => {
    const originIndex = stops.indexOf(origin);
    return stops.slice(originIndex + 1);
  }, [origin]);

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div className="max-w-xl">
          <p className="text-xs uppercase tracking-[0.32em] text-[#b58845]">Reserve your journey</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            A seamless coastal passage to Fort Jesus.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            Choose your boarding point, destination and travel date. The selected journey appears instantly, with transparent pricing and a confident booking path.
          </p>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-8 rounded-none bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-900">
              Boarding point
              <select
                value={origin}
                onChange={(event) => setOrigin(event.target.value as Stop)}
                className="mt-3 block w-full border-b border-slate-300 bg-transparent py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
              >
                {stops.slice(0, stops.length - 1).map((stop) => (
                  <option key={stop} value={stop}>{stop}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-900">
              Destination
              <select
                value={destination}
                onChange={(event) => setDestination(event.target.value as Stop)}
                className="mt-3 block w-full border-b border-slate-300 bg-transparent py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
              >
                {destinationOptions.map((stop) => (
                  <option key={stop} value={stop}>{stop}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <label className="block text-sm font-medium text-slate-900">
              Travel date
              <input
                type="date"
                value={date}
                min={getTodayDate()}
                onChange={(event) => setDate(event.target.value)}
                className="mt-3 block w-full border-b border-slate-300 bg-transparent py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
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
                className="mt-3 block w-full border-b border-slate-300 bg-transparent py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
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
                className="mt-3 block w-full border-b border-slate-300 bg-transparent py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
              />
            </label>
          </div>

          <div className="inline-flex items-center gap-3 text-sm text-slate-900">
            <input
              type="checkbox"
              checked={returnTicket}
              onChange={(event) => setReturnTicket(event.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-[#0d3b66] focus:ring-[#0d3b66]"
            />
            <span className="font-medium">Return ticket</span>
          </div>
        </div>

        <div className="rounded-none bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.32em] text-[#b58845]">Selected journey</p>
          <div className="mt-4 text-sm text-slate-500">
            {origin} → {destination}
          </div>
          <div className="mt-8 flex items-start justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Estimated total</p>
              <p className="mt-4 text-4xl font-semibold text-slate-950">{summary.totalLabel}</p>
            </div>
            <div className="text-right text-sm text-slate-600">
              <p>{adults} adult{adults > 1 ? "s" : ""}</p>
              <p>{children} child{children !== 1 ? "ren" : ""}</p>
            </div>
          </div>

          <div className="mt-8 space-y-4 text-sm text-slate-600">
            <p>{summary.discountLabel}</p>
            <p>Fare per adult from {summary.baseLabel} depending on route length.</p>
          </div>

          <a
            href="https://wa.me/254708485978?text=Hi%20Blue%20Pineapple%2C%20I%20would%20like%20to%20reserve%20a%20seat%20for%20the%20%20Fort%20Jesus%20coastal%20journey."
            className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#0d3b66] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0b335a]"
          >
            Reserve now
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}

function PricingSection({ summary, adults, children, returnTicket }: { summary: ReturnType<typeof calculateBooking>; adults: number; children: number; returnTicket: boolean }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-[#b58845]">Price confidence</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          A clear fare that feels premium.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
          Your journey cost is presented in a refined way so you can decide confidently without being overwhelmed by calculations.
        </p>
      </div>

      <div className="rounded-none bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Journey total</p>
            <p className="mt-3 text-5xl font-semibold text-slate-950">{summary.totalLabel}</p>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p>{adults} adult{adults > 1 ? "s" : ""}</p>
            <p>{children} child{children !== 1 ? "ren" : ""}</p>
          </div>
        </div>

        <div className="mt-8 space-y-3 text-sm text-slate-600">
          <p>{summary.discountLabel}</p>
          <p>{returnTicket ? "Return travel included." : "Single journey selected."}</p>
          <p>Final booking is secured via our concierge team.</p>
        </div>
      </div>
    </div>
  );
}

function TimelineSection() {
  return (
    <div className="space-y-6">
      <div className="grid gap-2 sm:grid-cols-3">
        {timeline.map((item) => (
          <div key={item.label} className="space-y-3">
            <p className="text-xs uppercase tracking-[0.32em] text-[#b58845]">{item.label}</p>
            <p className="text-3xl font-semibold text-slate-950">{item.time}</p>
            <p className="text-sm leading-7 text-slate-600">{item.description}</p>
          </div>
        ))}
      </div>
      <div className="relative mt-6 h-1 bg-slate-200">
        <div className="absolute left-0 top-0 h-1 w-full bg-[#0d3b66]" />
      </div>
    </div>
  );
}

function GallerySection() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
      <div className="relative overflow-hidden bg-slate-100">
        <Image src={galleryImages[0].src} alt={galleryImages[0].alt} width={1200} height={800} className="h-full w-full object-cover" />
        <div className="absolute bottom-6 left-6 bg-white/90 px-4 py-2 text-sm font-medium text-slate-900">{galleryImages[0].caption}</div>
      </div>
      <div className="grid gap-6">
        <div className="relative overflow-hidden bg-slate-100 h-72">
          <Image src={galleryImages[1].src} alt={galleryImages[1].alt} width={1200} height={900} className="h-full w-full object-cover" />
          <div className="absolute bottom-6 left-6 bg-white/90 px-4 py-2 text-sm font-medium text-slate-900">{galleryImages[1].caption}</div>
        </div>
        <div className="relative overflow-hidden bg-slate-100 h-72">
          <Image src={galleryImages[2].src} alt={galleryImages[2].alt} width={1200} height={900} className="h-full w-full object-cover" />
          <div className="absolute bottom-6 left-6 bg-white/90 px-4 py-2 text-sm font-medium text-slate-900">{galleryImages[2].caption}</div>
        </div>
      </div>
    </div>
  );
}

export default function FortJesusTrip() {
  const [origin, setOrigin] = useState<Stop>(stops[0]);
  const [destination, setDestination] = useState<Stop>(stops[1]);
  const [date, setDate] = useState(getTodayDate());
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [returnTicket, setReturnTicket] = useState(true);

  useEffect(() => {
    const originIndex = stops.indexOf(origin);
    const destinationIndex = stops.indexOf(destination);
    if (destinationIndex <= originIndex) {
      setDestination(stops[Math.min(originIndex + 1, stops.length - 1)]);
    }
  }, [origin]);

  const summary = useMemo(
    () => calculateBooking(origin, destination, adults, children, returnTicket),
    [origin, destination, adults, children, returnTicket],
  );

  return (
    <main className="bg-[#f7f3eb] text-slate-950">
      <section className="overflow-hidden bg-[#f5efe4]">
        <div className="mx-auto grid max-w-7xl gap-16 px-4 py-24 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">
          <div className="max-w-2xl self-center">
            <p className="text-xs uppercase tracking-[0.32em] text-[#b58845]">Hop-On Hop-Off Coastal Experience</p>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              A refined coastal journey to Fort Jesus.
            </h1>
            <p className="mt-6 text-lg leading-9 text-slate-700">
              Board at the shoreline, glide along Mombasa’s harbour, and arrive at one of Kenya’s most storied landmarks. This is not a ferry ride; it is a curated coastal passage.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a href="#planner" className="inline-flex items-center justify-center rounded-md bg-[#0d3b66] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#0b335a]">
                Reserve your experience
              </a>
              <a href="#route-map" className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-8 py-4 text-sm font-semibold text-slate-950 transition hover:border-slate-400">
                Explore the route
              </a>
            </div>

            <div className="mt-14 grid gap-8 sm:grid-cols-3 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-950">Daily departures</p>
                <p className="mt-2">Every 2 hours from sunrise.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-950">9 boarding points</p>
                <p className="mt-2">From Mtwapa Beach to Fort Jesus.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-950">Curated comfort</p>
                <p className="mt-2">Roomy seating, fresh air and coastal vistas.</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-slate-100">
            <Image src={publicPath("/assets/fort.webp")} alt="Coastal view toward Fort Jesus" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#f5efe4]/90 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <section id="planner" className="border-t border-slate-200 bg-[#f7f3eb] py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <LiveBookingPlanner
            origin={origin}
            destination={destination}
            setOrigin={setOrigin}
            setDestination={setDestination}
            date={date}
            setDate={setDate}
            adults={adults}
            setAdults={setAdults}
            children={children}
            setChildren={setChildren}
            returnTicket={returnTicket}
            setReturnTicket={setReturnTicket}
            summary={summary}
          />
        </div>
      </section>

      <section id="route-map" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.32em] text-[#b58845]">Route experience</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Your journey becomes the destination.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              The route is the product. Watch your boarding point, the coastal passage and the Fort Jesus arrival come together in an elegant sequence.
            </p>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] items-start">
            <div className="rounded-none bg-white p-10 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-8 border-b border-slate-200 pb-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-[#b58845]">Selected passage</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">{origin} → {destination}</p>
                </div>
                <div className="text-right text-sm text-slate-600">
                  <p>{summary.stopCount} stops</p>
                  <p className="mt-2">{returnTicket ? "Return included" : "One-way journey"}</p>
                </div>
              </div>

              <div className="mt-10">
                <JourneyPath origin={origin} destination={destination} />
              </div>
            </div>

            <div className="rounded-none bg-[#f7f3eb] p-10">
              <p className="text-sm uppercase tracking-[0.32em] text-[#b58845]">Journey highlights</p>
              <div className="mt-8 space-y-6 text-slate-700">
                <div>
                  <p className="text-base font-semibold text-slate-950">Coastal views at every turn</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">Glide past coral beaches, fishing villages and the historic harbour entrance.</p>
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-950">Flexible boarding</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">Choose the stop that suits your day and arrive on your own schedule.</p>
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-950">Premium arrival</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">Disembark at Fort Jesus and step directly into a landmark experience.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f5efe4] py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.32em] text-[#b58845]">Timetable</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              A graceful schedule for your voyage.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Clear timing that feels more like a refined itinerary than a timetable.
            </p>
          </div>

          <div className="mt-14 overflow-hidden rounded-none bg-white p-10 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="relative">
              <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-200" />
              <div className="grid gap-10 sm:grid-cols-3">
                {timeline.map((item, index) => (
                  <div key={item.label} className="relative z-10 text-center">
                    <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#0d3b66] text-white">{index + 1}</div>
                    <p className="text-sm uppercase tracking-[0.32em] text-[#b58845]">{item.label}</p>
                    <p className="mt-4 text-3xl font-semibold text-slate-950">{item.time}</p>
                    <p className="mt-4 text-sm leading-7 text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <PricingSection summary={summary} adults={adults} children={children} returnTicket={returnTicket} />
        </div>
      </section>

      <section className="bg-[#f7f3eb] py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.32em] text-[#b58845]">Gallery</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              The mood of the coastal route.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Images that capture the calm, the light and the rich atmosphere of this premium water taxi experience.
            </p>
          </div>

          <div className="mt-14">
            <GallerySection />
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.32em] text-[#b58845]">FAQ</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Trusted answers before you go.
            </h2>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-2 text-slate-700">
            {faqItems.map((item) => (
              <div key={item.question}>
                <p className="text-lg font-semibold text-slate-950">{item.question}</p>
                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f5efe4] py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[#b58845]">Ready to board?</p>
              <h2 className="mt-4 text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
                Reserve a coastal passage that feels effortless.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
                Our team will confirm your selected route and complete your booking with thoughtful service and clear expectations.
              </p>
            </div>
            <div className="rounded-none bg-white p-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <a
                href="https://wa.me/254708485978?text=Hi%20Blue%20Pineapple%2C%20I%20would%20like%20to%20reserve%20a%20seat%20for%20the%20Fort%20Jesus%20journey."
                className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-[#0d3b66] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#0b335a]"
              >
                Reserve your journey
              </a>
              <div className="mt-8 space-y-5 text-sm text-slate-600">
                <div>
                  <p className="font-semibold text-slate-950">WhatsApp</p>
                  <p>+254 708 485 978</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-950">Email</p>
                  <p>bluepineappleholdings@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
