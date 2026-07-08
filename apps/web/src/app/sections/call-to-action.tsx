"use client";

import { MoveRight } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { publicPath } from "@/lib/paths";

const galleryImage1 = publicPath("/assets/galleryImage1.webp");
const galleryImage2 = publicPath("/assets/galleryImage2.webp");
const galleryImage3 = publicPath("/assets/galleryImage3.webp");

export function CallToAction() {
  return (
    <section className="py-36 px-4 md:px-16 lg:px-24 xl:px-32 w-full flex flex-col items-center justify-center text-center">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <div className="relative w-full max-w-sm overflow-hidden md:max-w-[600px] h-[200px] md:h-[220px] mb-12 flex justify-center items-center md:overflow-visible group/cta-images select-none">
          <Image height={139} width={251} src={galleryImage1} alt="Blue Pineapple experience showcase 1" className="absolute w-[200px] md:w-[251px] h-[100px] md:h-[139px] object-cover rounded-[10px] transition-all duration-500 ease-out z-0 origin-bottom-right -rotate-12 translate-x-[-115px] translate-y-4 group-hover/cta-images:translate-x-[-155px] group-hover/cta-images:rotate-[-16deg] group-hover/cta-images:translate-y-2" />
          <Image height={139} width={251} src={galleryImage3} alt="Blue Pineapple experience showcase 3" className="absolute w-[200px] md:w-[251px] h-[100px] md:h-[139px] object-cover rounded-[10px] transition-all duration-500 ease-out z-0 origin-bottom-left rotate-12 translate-x-[115px] translate-y-4 group-hover/cta-images:translate-x-[155px] group-hover/cta-images:rotate-16 group-hover/cta-images:translate-y-2" />
          <Image height={139} width={251} src={galleryImage2} alt="Blue Pineapple experience showcase 2" className="absolute w-[200px] md:w-[251px] h-[100px] md:h-[139px] object-cover rounded-[10px] transition-all duration-500 ease-out z-10 translate-y-[-10px] group-hover/cta-images:translate-y-[-22px] group-hover/cta-images:scale-105" />
        </div>

        <motion.h2 className="text-3xl md:text-[40px] text-zinc-800 tracking-tight max-w-[520px] mb-3"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
        >
          Discover a Platform Built for Premium Experiences
        </motion.h2>

        <motion.p className="text-zinc-500 text-sm max-w-[400px] mb-7"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
        >
          Explore a refined ecosystem for experiences, partners, bookings, and operational excellence.
        </motion.p>

        <motion.button className="bg-black hover:bg-zinc-900 text-white text-sm px-5 py-3.5 rounded-lg transition-all duration-200 flex items-center gap-2 group cursor-pointer"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
        >
          <span>Explore the Platform</span>
          <MoveRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
        </motion.button>
      </div>
    </section>
  );
}
