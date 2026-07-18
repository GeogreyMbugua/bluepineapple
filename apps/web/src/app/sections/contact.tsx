"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Globe } from "lucide-react";

const MAP_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127641.23956217018!2d39.6505534!3d-4.0434778!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18401be4e389d071%3A0xef2e44a5161c9c1a!2sMombasa%2C%20Kenya!5e0!3m2!1sen!2sus!4v1719999999999";

const CONTACT = {
  phone: "+254 769 851 080",
  phoneUk: "+44 7925 878286",
  email: "bluepineappleholdings@gmail.com",
  website: "bluepineappleholding.com",
  city: "Mombasa, Kenya",
  whatsapp: "https://wa.me/254769851080?text=Hello%20Blue%20Pineapple%20Holdings%2C%20I%20would%20like%20to%20discuss%20property%20and%20investment%20opportunities.",
};

const fadeUp = {
  initial: { y: 40, opacity: 0 },
  whileInView: { y: 0, opacity: 1 },
  viewport: { once: true },
  transition: {
    type: "spring",
    stiffness: 320,
    damping: 70,
  },
} as const;

const inputClass =
  "w-full border border-zinc-200 rounded-sm px-4 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-300 transition-colors";

const fields = [
  { label: "YOUR NAME", placeholder: "A. Patel", type: "text" },
  { label: "EMAIL ADDRESS", placeholder: "partner@bluepineapple.com", type: "email" },
  { label: "PHONE NUMBER", placeholder: "+254 700 000 000", type: "tel" },
  { label: "SUBJECT", placeholder: "Partnership Inquiry", type: "text" },
];

function FormField({ label, placeholder, type = "text" }: { readonly label: string; readonly placeholder: string; readonly type?: string }) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col">
      <motion.label htmlFor={id} className="text-sm text-zinc-600 mb-2" variants={fadeUp}>
        {label}
      </motion.label>
      <motion.input id={id} type={type} placeholder={placeholder} className={inputClass} variants={fadeUp} />
    </div>
  );
}

export function Contact() {
  return (
    <section className="py-20 w-full flex items-center justify-center bg-gray-100">
      <div className="max-w-5xl w-full mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <motion.div className="flex flex-col gap-6" variants={fadeUp} viewport={{ once: true }}>
          <motion.div className="flex items-center gap-1.5" variants={fadeUp} viewport={{ once: true }}>
            <span className="size-1.5 bg-zinc-900" />
            <span className="text-sm text-zinc-900">CONTACT BLUE PINEAPPLE</span>
          </motion.div>

            <motion.h2 className="text-3xl md:text-4xl text-zinc-900 mt-5 leading-tight font-medium tracking-tight max-w-[400px]" variants={fadeUp} viewport={{ once: true }}>
            Let&apos;s Build Your Future Together
          </motion.h2>

          <motion.p className="text-zinc-500 text-sm md:text-base max-w-[420px]" variants={fadeUp} viewport={{ once: true }}>
            Have questions about property, investment, or management opportunities? We would love to hear from you. Chat on WhatsApp or fill out the form below.
          </motion.p>

          <form className="mt-2 flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {fields.slice(0, 2).map((field) => (
                <FormField key={field.label} {...field} />
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {fields.slice(2).map((field) => (
                <FormField key={field.label} {...field} />
              ))}
            </div>

            <div className="flex flex-col">
              <motion.label htmlFor="message" className="text-sm text-zinc-600 mb-2" variants={fadeUp} viewport={{ once: true }}>
                MESSAGE
              </motion.label>
              <motion.textarea id="message" rows={4} placeholder="Tell us about your plans" className={inputClass} variants={fadeUp} viewport={{ once: true }} />
            </div>

            <motion.div variants={fadeUp} viewport={{ once: true }}>
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-950 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-cyan-900 cursor-pointer">
                Send Message
              </button>
            </motion.div>
          </form>
        </motion.div>

        <motion.div className="relative overflow-hidden group flex justify-center" variants={fadeUp} viewport={{ once: true }}>
          <div className="relative w-full h-[455px] overflow-hidden rounded-xl">
            <iframe src={MAP_URL} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0 w-full h-full object-cover select-none" />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
              <span className="text-sm font-semibold text-white mb-4 block">Contact Details</span>
              <motion.div className="flex flex-col gap-3 text-sm text-white/90" variants={fadeUp} viewport={{ once: true }}>
                <span className="flex items-center gap-3">
                  <Phone className="size-4 text-white/70" />
                  <a href="tel:+254769851080" className="hover:text-white transition-colors">{CONTACT.phone}</a>
                </span>
                <span className="flex items-center gap-3">
                  <Phone className="size-4 text-white/70" />
                  <a href="tel:+447925878286" className="hover:text-white transition-colors">{CONTACT.phoneUk}</a>
                </span>
                <span className="flex items-center gap-3">
                  <Mail className="size-4 text-white/70" />
                  <a href={`mailto:${CONTACT.email}`} className="hover:text-white transition-colors">{CONTACT.email}</a>
                </span>
                <span className="flex items-center gap-3">
                  <Globe className="size-4 text-white/70" />
                  <span>{CONTACT.website}</span>
                </span>
                <span className="flex items-center gap-3">
                  <MapPin className="size-4 text-white/70" />
                  <span>{CONTACT.city}</span>
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Contact;