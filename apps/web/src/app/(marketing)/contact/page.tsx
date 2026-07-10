import { motion } from "framer-motion";
import { MarketingShell } from '@/components/marketing/marketing-shell';

export default function ContactPage() {
  return (
    <MarketingShell variant="parent">
      <section className="py-20 px-4 md:px-16 lg:px-24 xl:px-32 w-full">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="flex items-center gap-1.5"
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
          >
            <span className="size-1.5 bg-zinc-900"></span>
            <span className="text-sm text-zinc-900">CONTACT BLUE PINEAPPLE</span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl text-zinc-900 mt-6 leading-tight max-w-3xl"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
          >
            Get in touch with Blue Pineapple Holdings
          </motion.h1>

          <motion.div
            className="mt-10 flex flex-col gap-4 text-zinc-700"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
          >
            <p>Phone: +254 769 851 080 / +44 7925 878286</p>
            <p>Email: info@bluepineapple.com</p>
            <p>Location: Mombasa, Kenya</p>
          </motion.div>
        </div>
      </section>
    </MarketingShell>
  );
}