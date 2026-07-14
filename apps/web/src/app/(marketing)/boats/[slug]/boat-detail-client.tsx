"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowDown } from "lucide-react";

const safetyItems = [
  "Life jackets for all passengers",
  "GPS navigation system",
  "CCTV surveillance",
  "Experienced captain with 20+ years experience",
  "Fully insured & certified",
  "European safety standards",
];

const offers = [
  "10% OFF couple bookings",
  "20% OFF group/family bookings (4+ paying passengers)",
  "50% OFF children 5-15",
  "FREE under 5 years",
];

type Boat = {
  name: string;
  slug: string;
  subtitle: string;
  capacity: string;
  hourly: string;
  daily: string;
  images: string[];
  features: string[];
  description: string;
  heroImage: string;
};

function BoatDetailClient({ boat }: { readonly boat: Boat }) {
  return (
    <main className="bg-background text-foreground">
      {/* ============================================
            HERO
      ============================================ */}
      <section className="relative min-h-[80vh] w-full overflow-hidden bg-black">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${boat.heroImage}')` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        <div className="container-page relative z-10 flex min-h-[80vh] flex-col justify-center pt-28 pb-16">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">
              {boat.capacity} • {boat.subtitle}
            </span>
            <h1 className="max-w-[15ch] text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-zinc-50 sm:text-5xl lg:text-6xl mt-4">
              {boat.name}
            </h1>
            <p className="mt-6 max-w-[520px] text-pretty text-sm leading-relaxed text-white/60 sm:text-base">
              {boat.description}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
              <a
                href={`https://wa.me/254708485978?text=Hi%20Blue%20Pineapple%2C%20I'd%20like%20to%20book%20the%20${encodeURIComponent(boat.name)}`}
                className="group inline-flex items-center gap-2 rounded-full bg-cyan-950 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-cyan-900"
              >
                Reserve spot
              </a>
              <Link href="#gallery" className="group inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white">
                View gallery
                <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
            <div className="mt-8 flex items-baseline gap-2">
              <span className="text-4xl font-medium text-white">{boat.hourly.replace("/hr", "")}</span>
              <span className="text-sm text-white/60">per hour</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.25em]">Scroll</span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown size={16} />
          </motion.span>
        </motion.div>
      </section>

      {/* ============================================
            GALLERY
      ============================================ */}
      <section id="gallery" className="py-16 md:py-25 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-black">
        <div className="max-w-7xl mx-auto">
          <motion.div className="flex items-center gap-1.5 mb-8"
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
          >
            <span className="size-1.5 bg-white"></span>
            <span className="text-sm text-white/80">
              GALLERY
            </span>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {boat.images.map((img, i) => (
              <motion.div
                key={i}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
              >
                <Image src={img} alt={`${boat.name} ${i + 1}`} fill className="object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
            DETAILS
      ============================================ */}
      <section className="py-16 md:py-25 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
          >
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 bg-zinc-900"></span>
              <span className="text-sm text-zinc-900">
                VESSEL DETAILS
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl text-zinc-900 mt-4 leading-tight font-medium max-w-2xl tracking-tight">
              {boat.name} — {boat.subtitle}
            </h2>
            <p className="text-zinc-500 text-sm md:text-base mt-3 max-w-2xl">
              {boat.description}
            </p>

            <div className="mt-10 grid grid-cols-2 gap-6">
              <div className="bg-zinc-50 rounded-xl p-6">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Hourly Charter</span>
                <span className="block text-2xl font-medium text-zinc-900 mt-1">{boat.hourly}</span>
              </div>
              <div className="bg-zinc-50 rounded-xl p-6">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Full Day</span>
                <span className="block text-2xl font-medium text-zinc-900 mt-1">{boat.daily}</span>
              </div>
              <div className="bg-zinc-50 rounded-xl p-6">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Capacity</span>
                <span className="block text-2xl font-medium text-zinc-900 mt-1">{boat.capacity}</span>
              </div>
              <div className="bg-zinc-50 rounded-xl p-6">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Type</span>
                <span className="block text-2xl font-medium text-zinc-900 mt-1">{boat.subtitle}</span>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-base font-medium text-zinc-900 mb-4">Features</h3>
              <div className="flex flex-wrap gap-3">
                {boat.features.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full bg-cyan-50 px-4 py-2 text-sm text-cyan-950"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="relative h-[400px] md:h-[520px] w-full rounded-2xl overflow-hidden"
            initial={{ y: 50, opacity: 0, scale: 0.96 }}
            whileInView={{ y: 0, opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, type: "spring", stiffness: 240, damping: 70, mass: 1 }}
          >
            <Image
              src={boat.images[0]!}
              alt={boat.name}
              fill
              className="object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* ============================================
            SAFETY
      ============================================ */}
      <section className="py-16 md:py-25 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-cyan-50">
        <div className="max-w-7xl mx-auto">
          <motion.div className="flex items-center gap-1.5"
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
          >
            <span className="size-1.5 bg-zinc-900"></span>
            <span className="text-sm text-zinc-900">
              SAFETY & COMFORT
            </span>
          </motion.div>
          <motion.h2 className="text-3xl md:text-4xl text-zinc-900 mt-4 leading-tight font-medium max-w-2xl tracking-tight"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
          >
            Safety first, always
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {safetyItems.map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 bg-white rounded-xl p-5"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
              >
                <div className="w-2 h-2 rounded-full bg-cyan-950 shrink-0" />
                <span className="text-sm text-zinc-700">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
            OFFERS
      ============================================ */}
      <section className="py-16 md:py-25 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div className="flex items-center gap-1.5"
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
          >
            <span className="size-1.5 bg-zinc-900"></span>
            <span className="text-sm text-zinc-900">
              AVAILABLE OFFERS
            </span>
          </motion.div>
          <motion.h2 className="text-3xl md:text-4xl text-zinc-900 mt-4 leading-tight font-medium max-w-2xl tracking-tight"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
          >
            Special rates for every group
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
            {offers.map((offer, i) => (
              <motion.div
                key={i}
                className="bg-zinc-50 rounded-xl p-6 border border-zinc-100"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
              >
                <span className="text-sm font-medium text-zinc-900">{offer}</span>
              </motion.div>
            ))}
          </div>

          <motion.div className="mt-10 flex flex-wrap gap-4"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
          >
            <a
              href={`https://wa.me/254708485978?text=Hi%20Blue%20Pineapple%2C%20I'd%20like%20to%20book%20the%20${encodeURIComponent(boat.name)}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-950 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-cyan-900"
            >
              Book Now
            </a>
            <Link href="/boats" className="inline-flex items-center justify-center gap-2 rounded-full bg-white border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-800 transition-colors duration-200 hover:bg-zinc-50">
              Back to Fleet
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

export { BoatDetailClient };
