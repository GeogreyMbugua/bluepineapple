"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Globe, MessageCircle } from "lucide-react";

type ContactVariant = "default" | "coastal";

const MAP_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127641.23956217018!2d39.6505534!3d-4.0434778!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18401be4e389d071%3A0xef2e44a5161c9c1a!2sMombasa%2C%20Kenya!5e0!3m2!1sen!2sus!4v1719999999999";

const CONTACT = {
  default: {
    phone: "+254 769 851 080",
    phoneHref: "tel:+254769851080",
    phoneUk: "+44 7925 878286",
    phoneUkHref: "tel:+447925878286",
    email: "bluepineappleholdings@gmail.com",
    website: "bluepineappleholding.com",
    city: "Mombasa, Kenya",
    whatsapp:
      "https://wa.me/254769851080?text=Hello%20Blue%20Pineapple%20Holdings%2C%20I%20would%20like%20to%20discuss%20property%20and%20investment%20opportunities.",
  },
  coastal: {
    phone: "+254 708 485 978",
    phoneHref: "tel:+254708485978",
    phoneUk: "+44 7925 878286",
    phoneUkHref: "tel:+447925878286",
    email: "bluepineappleholdings@gmail.com",
    website: "bluepineappleholdings.com",
    city: "Mombasa Marina, Kenya",
    whatsapp:
      "https://wa.me/254708485978?text=Hi%20Blue%20Pineapple%2C%20I%27d%20like%20to%20book%20a%20coastal%20experience.",
  },
} as const;

const copy = {
  default: {
    eyebrow: "CONTACT BLUE PINEAPPLE",
    title: "Let's Build Your Future Together",
    body: "Have questions about property, investment, or management opportunities? We would love to hear from you. Chat on WhatsApp or fill out the form below.",
    subjectPlaceholder: "Partnership Inquiry",
    messagePlaceholder: "Tell us about your plans",
  },
  coastal: {
    eyebrow: "BOOK A TRIP",
    title: "Let's plan your coastal day",
    body: "Questions about routes, private charters, or group bookings? Message us on WhatsApp or send a note — we typically respond within 24 hours.",
    subjectPlaceholder: "Trip enquiry",
    messagePlaceholder: "Tell us the trip, dates, and group size",
  },
} as const;

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
  "w-full border border-zinc-200 rounded-lg px-4 py-3 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-300 transition-colors";

function FormField({
  label,
  placeholder,
  type = "text",
  autoComplete,
}: {
  readonly label: string;
  readonly placeholder: string;
  readonly type?: string;
  readonly autoComplete?: string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col">
      <motion.label htmlFor={id} className="mb-2 text-sm text-zinc-600" variants={fadeUp}>
        {label}
      </motion.label>
      <motion.input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={inputClass}
        variants={fadeUp}
      />
    </div>
  );
}

export function Contact({ variant = "default" }: { readonly variant?: ContactVariant }) {
  const info = CONTACT[variant];
  const text = copy[variant];
  const isCoastal = variant === "coastal";

  const fields = [
    { label: "YOUR NAME", placeholder: "A. Patel", type: "text", autoComplete: "name" },
    { label: "EMAIL ADDRESS", placeholder: "you@email.com", type: "email", autoComplete: "email" },
    { label: "PHONE NUMBER", placeholder: "+254 700 000 000", type: "tel", autoComplete: "tel" },
    { label: "SUBJECT", placeholder: text.subjectPlaceholder, type: "text" },
  ];

  return (
    <section id="contact" className="flex w-full items-center justify-center bg-gray-100 py-16 md:py-20">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-10 px-4 lg:grid-cols-2 lg:gap-16">
        {/* Mobile: contact details + WhatsApp first */}
        {isCoastal ? (
          <div className="flex flex-col gap-4 lg:hidden">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 bg-zinc-900" />
              <span className="text-sm text-zinc-900">{text.eyebrow}</span>
            </div>
            <h2 className="max-w-[400px] text-3xl leading-tight font-medium tracking-tight text-zinc-900">
              {text.title}
            </h2>
            <p className="max-w-[420px] text-sm text-zinc-500">{text.body}</p>
            <a
              href={info.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1ebe57] sm:w-auto"
            >
              <MessageCircle className="size-4" />
              Chat on WhatsApp
            </a>
            <div className="flex flex-col gap-2 text-sm text-zinc-600">
              <a href={info.phoneHref} className="hover:text-zinc-900">
                {info.phone}
              </a>
              <a href={`mailto:${info.email}`} className="hover:text-zinc-900">
                {info.email}
              </a>
            </div>
          </div>
        ) : null}

        <motion.div className="flex flex-col gap-6" variants={fadeUp} viewport={{ once: true }}>
          <motion.div className={`items-center gap-1.5 ${isCoastal ? "hidden lg:flex" : "flex"}`} variants={fadeUp} viewport={{ once: true }}>
            <span className="size-1.5 bg-zinc-900" />
            <span className="text-sm text-zinc-900">{text.eyebrow}</span>
          </motion.div>

          <motion.h2
            className={`mt-5 max-w-[400px] text-3xl leading-tight font-medium tracking-tight text-zinc-900 md:text-4xl ${isCoastal ? "hidden lg:block" : "block"}`}
            variants={fadeUp}
            viewport={{ once: true }}
          >
            {text.title}
          </motion.h2>

          <motion.p
            className={`max-w-[420px] text-sm text-zinc-500 md:text-base ${isCoastal ? "hidden lg:block" : "block"}`}
            variants={fadeUp}
            viewport={{ once: true }}
          >
            {text.body}
          </motion.p>

          {isCoastal ? (
            <motion.a
              href={info.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-11 w-fit items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1ebe57] lg:inline-flex"
              variants={fadeUp}
              viewport={{ once: true }}
            >
              <MessageCircle className="size-4" />
              Chat on WhatsApp
            </motion.a>
          ) : null}

          <form className="mt-2 flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {fields.slice(0, 2).map((field) => (
                <FormField key={field.label} {...field} />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {fields.slice(2).map((field) => (
                <FormField key={field.label} {...field} />
              ))}
            </div>

            <div className="flex flex-col">
              <motion.label htmlFor="message" className="mb-2 text-sm text-zinc-600" variants={fadeUp} viewport={{ once: true }}>
                MESSAGE
              </motion.label>
              <motion.textarea
                id="message"
                rows={4}
                placeholder={text.messagePlaceholder}
                className={inputClass}
                variants={fadeUp}
                viewport={{ once: true }}
              />
            </div>

            <motion.div variants={fadeUp} viewport={{ once: true }}>
              <button
                type="submit"
                className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-cyan-950 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-cyan-900"
              >
                Send Message
              </button>
            </motion.div>
          </form>
        </motion.div>

        <motion.div className="group relative flex justify-center overflow-hidden" variants={fadeUp} viewport={{ once: true }}>
          <div className="relative h-[380px] w-full overflow-hidden rounded-xl md:h-[455px]">
            <iframe
              src={MAP_URL}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full object-cover select-none"
              title="Blue Pineapple location map"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute right-0 bottom-0 left-0 z-10 p-6 md:p-8">
              <span className="mb-4 block text-sm font-semibold text-white">Contact Details</span>
              <motion.div className="flex flex-col gap-3 text-sm text-white/90" variants={fadeUp} viewport={{ once: true }}>
                <span className="flex items-center gap-3">
                  <Phone className="size-4 text-white/70" />
                  <a href={info.phoneHref} className="transition-colors hover:text-white">
                    {info.phone}
                  </a>
                </span>
                <span className="flex items-center gap-3">
                  <Phone className="size-4 text-white/70" />
                  <a href={info.phoneUkHref} className="transition-colors hover:text-white">
                    {info.phoneUk}
                  </a>
                </span>
                <span className="flex items-center gap-3">
                  <Mail className="size-4 text-white/70" />
                  <a href={`mailto:${info.email}`} className="transition-colors hover:text-white">
                    {info.email}
                  </a>
                </span>
                <span className="flex items-center gap-3">
                  <Globe className="size-4 text-white/70" />
                  <span>{info.website}</span>
                </span>
                <span className="flex items-center gap-3">
                  <MapPin className="size-4 text-white/70" />
                  <span>{info.city}</span>
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
