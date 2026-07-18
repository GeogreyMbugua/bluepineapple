"use client";

import { MoveRight } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { publicPath } from "@/lib/paths";

const cardBase =
  "absolute inset-0 rounded-2xl object-cover border border-white/10 shadow-2xl shadow-black/30 ring-1 ring-white/10";

export function CallToAction() {
  return (
    <section className="relative py-36 px-4 md:px-16 lg:px-24 xl:px-32 w-full flex flex-col items-center justify-center text-center bg-white overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        <div className="group/cta relative w-full max-w-xl h-[260px] sm:h-[300px] mb-14 select-none">
          <motion.div
            className="absolute left-2 top-0 z-10 w-[160px] sm:w-[210px] h-[92px] sm:h-[120px] -rotate-6 group-hover/cta:-translate-y-2 group-hover/cta:-rotate-3 transition-all duration-500 ease-out"
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 220, damping: 70, mass: 1 }}
          >
            <Image src={publicPath("/assets/galleryImage1.webp")} alt="Blue Pineapple coastal experience 1" fill className={cardBase} />
          </motion.div>

          <motion.div
            className="absolute right-2 bottom-0 z-10 w-[160px] sm:w-[210px] h-[92px] sm:h-[120px] rotate-6 group-hover/cta:translate-y-2 group-hover/cta:rotate-3 transition-all duration-500 ease-out"
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, type: "spring", stiffness: 220, damping: 70, mass: 1 }}
          >
            <Image src={publicPath("/assets/galleryImage3.webp")} alt="Blue Pineapple coastal experience 3" fill className={cardBase} />
          </motion.div>

          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[250px] sm:w-[340px] h-[140px] sm:h-[190px]"
            initial={{ y: 60, opacity: 0, scale: 0.95 }}
            whileInView={{ y: 0, opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05, type: "spring", stiffness: 220, damping: 70, mass: 1 }}
          >
            <Image
              src={publicPath("/assets/galleryImage2.webp")}
              alt="Blue Pineapple coastal experience 2"
              fill
              className={`${cardBase} group-hover/cta:-translate-y-1 group-hover/cta:scale-[1.02] transition-all duration-500 ease-out`}
            />
          </motion.div>
        </div>

        <motion.h2
          className="text-3xl md:text-4xl text-zinc-900 tracking-tight max-w-[520px] mb-3 font-semibold"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
        >
          Discover Your Next Opportunity
        </motion.h2>

        <motion.p
          className="text-zinc-600 text-sm md:text-base max-w-[460px] mb-7 leading-relaxed"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
        >
          Explore premium coastal properties, investment-ready land, and tailored guidance for buyers, investors, and developers across Kenya.
        </motion.p>

        <motion.button
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-zinc-800 cursor-pointer"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
        >
          <span>Speak to Our Team</span>
          <MoveRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
        </motion.button>
      </div>
    </section>
  );
}
