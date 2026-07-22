"use client";

import { MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { publicPath } from "@/lib/paths";

const cardBase =
  "absolute inset-0 rounded-2xl object-cover border border-white/10 shadow-2xl shadow-black/30 ring-1 ring-white/10";

type CallToActionVariant = "default" | "coastal";

const WHATSAPP_COASTAL =
  "https://wa.me/254708485978?text=Hi%20Blue%20Pineapple%2C%20I%27d%20like%20to%20book%20a%20coastal%20experience.";

const content = {
  default: {
    title: "Discover Your Next Opportunity",
    body: "Explore premium coastal properties, investment-ready land, and tailored guidance for buyers, investors, and developers across Kenya.",
    cta: "Speak to Our Team",
    href: "#contact",
    images: [
      publicPath("/assets/galleryImage1.webp"),
      publicPath("/assets/galleryImage3.webp"),
      publicPath("/assets/galleryImage2.webp"),
    ],
  },
  coastal: {
    title: "Ready for the water?",
    body: "Book a harbour tour, reef snorkel, mangrove safari, or private charter — clear pricing, experienced crew, unforgettable views.",
    cta: "Book on WhatsApp",
    href: WHATSAPP_COASTAL,
    images: [
      publicPath("/assets/fleet.webp"),
      publicPath("/assets/set.webp"),
      publicPath("/assets/hunky11.webp"),
    ],
  },
} as const;

export function CallToAction({ variant = "default" }: { readonly variant?: CallToActionVariant }) {
  const copy = content[variant];
  const isExternal = copy.href.startsWith("http");

  return (
    <section className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-white px-4 py-24 text-center md:px-16 md:py-36 lg:px-24 xl:px-32">
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center">
        <div className="group/cta relative mb-10 h-[220px] w-full max-w-xl select-none sm:mb-14 sm:h-[300px]">
          <motion.div
            className="absolute top-0 left-2 z-10 h-[92px] w-[160px] -rotate-6 transition-all duration-500 ease-out group-hover/cta:-translate-y-2 group-hover/cta:-rotate-3 sm:h-[120px] sm:w-[210px]"
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 220, damping: 70, mass: 1 }}
          >
            <Image src={copy.images[0]} alt="Blue Pineapple experience 1" fill className={cardBase} />
          </motion.div>

          <motion.div
            className="absolute right-2 bottom-0 z-10 h-[92px] w-[160px] rotate-6 transition-all duration-500 ease-out group-hover/cta:translate-y-2 group-hover/cta:rotate-3 sm:h-[120px] sm:w-[210px]"
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, type: "spring", stiffness: 220, damping: 70, mass: 1 }}
          >
            <Image src={copy.images[1]} alt="Blue Pineapple experience 3" fill className={cardBase} />
          </motion.div>

          <motion.div
            className="absolute top-1/2 left-1/2 z-20 h-[140px] w-[250px] -translate-x-1/2 -translate-y-1/2 sm:h-[190px] sm:w-[340px]"
            initial={{ y: 60, opacity: 0, scale: 0.95 }}
            whileInView={{ y: 0, opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05, type: "spring", stiffness: 220, damping: 70, mass: 1 }}
          >
            <Image
              src={copy.images[2]}
              alt="Blue Pineapple experience 2"
              fill
              className={`${cardBase} transition-all duration-500 ease-out group-hover/cta:-translate-y-1 group-hover/cta:scale-[1.02]`}
            />
          </motion.div>
        </div>

        <motion.h2
          className="mb-3 max-w-[520px] text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
        >
          {copy.title}
        </motion.h2>

        <motion.p
          className="mb-7 max-w-[460px] text-sm leading-relaxed text-zinc-600 md:text-base"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
        >
          {copy.body}
        </motion.p>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
        >
          <Link
            href={copy.href}
            {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-zinc-800"
          >
            <span>{copy.cta}</span>
            <MoveRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
