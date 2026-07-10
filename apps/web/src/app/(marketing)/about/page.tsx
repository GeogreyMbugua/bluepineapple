import { motion } from "framer-motion";
import { MarketingShell } from '@/components/marketing/marketing-shell';

export default function AboutPage() {
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
            <span className="text-sm text-zinc-900">ABOUT BLUE PINEAPPLE</span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl text-zinc-900 mt-6 leading-tight max-w-3xl"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
          >
            Building Value, Creating Opportunities
          </motion.h1>

          <motion.p
            className="text-zinc-500 text-base md:text-lg mt-6 max-w-2xl"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
          >
            Blue Pineapple Holdings Ltd is a dynamic Kenyan company committed to providing innovative, reliable, and customer-focused business solutions. We strive to create value through quality service, professionalism, integrity, and sustainable business practices.
          </motion.p>

          <motion.p
            className="text-zinc-500 text-base md:text-lg mt-4 max-w-2xl"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
          >
            Our goal is to build long-term relationships with our clients by delivering services that exceed expectations while contributing to economic growth and community development.
          </motion.p>
        </div>
      </section>
    </MarketingShell>
  );
}