import { motion } from "framer-motion";
import { MarketingShell } from '@/components/marketing/marketing-shell';

const services = [
  "Real Estate Investment and Property Marketing",
  "Property Management",
  "Land Sales and Development",
  "Construction and Project Management",
  "Investment Consultancy",
  "General Supplies",
  "Business Consultancy",
  "Hospitality and Tourism Investments",
];

export default function ServicesPage() {
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
            <span className="text-sm text-zinc-900">OUR SERVICES</span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl text-zinc-900 mt-6 leading-tight max-w-3xl"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
          >
            Comprehensive Business Solutions
          </motion.h1>

          <motion.p
            className="text-zinc-500 text-base md:text-lg mt-4 max-w-2xl"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
          >
            Blue Pineapple Holdings Ltd offers a full spectrum of services designed to deliver excellence at every stage.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {services.map((service, index) => (
              <motion.div
                key={service}
                className="bg-white border border-zinc-100 rounded-sm p-6"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
              >
                <p className="text-sm text-zinc-700">{service}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}