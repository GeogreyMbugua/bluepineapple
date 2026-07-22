"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { publicPath } from "@/lib/paths";

type Testimonial = {
    name: string;
    location: string;
    avatar: string;
    text: string;
};

type TestimonialsVariant = "default" | "coastal";

const realEstateCol1: Testimonial[] = [
    {
        name: "James Mwangi",
        location: "Investor, Nairobi",
        avatar: publicPath("/assets/galleryImage1.webp"),
        text: "Blue Pineapple Holdings helped us acquire our investment property with complete transparency and professionalism. The process felt clear from start to finish.",
    },
    {
        name: "Caroline Wanjiku",
        location: "Property Owner",
        avatar: publicPath("/assets/galleryImage2.webp"),
        text: "Their Airbnb management service transformed our property into a successful business. The team handles everything with care and consistency.",
    },
];

const realEstateCol2: Testimonial[] = [
    {
        name: "Ahmed Kassim",
        location: "Business Owner",
        avatar: publicPath("/assets/galleryImage3.webp"),
        text: "The construction team delivered beyond our expectations. Every stage was managed professionally, and the end result was exceptional.",
    },
    {
        name: "Mary Njoroge",
        location: "Buyer, Mombasa",
        avatar: publicPath("/assets/image1.webp"),
        text: "From the first consultation to handover, the experience felt premium, personal, and reassuring. We found the right property with confidence.",
    },
];

const coastalCol1: Testimonial[] = [
    {
        name: "Amina Otieno",
        location: "Guest, Nairobi",
        avatar: publicPath("/assets/crew.webp"),
        text: "Our Fort Jesus harbour trip was seamless — clear pricing, a calm crew, and views we still talk about. It felt premium without being complicated.",
    },
    {
        name: "Daniel Kariuki",
        location: "Family charter",
        avatar: publicPath("/assets/hunky11.webp"),
        text: "Hunky Dory was perfect with the kids. Glass-bottom viewing, life jackets ready, and captains who made everyone feel safe from start to finish.",
    },
];

const coastalCol2: Testimonial[] = [
    {
        name: "Sophie Chen",
        location: "Sunset sailing",
        avatar: publicPath("/assets/set.webp"),
        text: "The sunset sailing was beautifully paced. Clean boat, thoughtful crew, and that golden-hour light over Mombasa — exactly what we hoped for.",
    },
    {
        name: "Brian Mwenda",
        location: "Corporate outing",
        avatar: publicPath("/assets/fleet.webp"),
        text: "We chartered Setting Sons for a team day. Logistics were easy, the vessel felt polished, and the coastal route was a highlight for everyone.",
    },
];

const copy = {
    default: {
        eyebrow: "CLIENT TESTIMONIALS",
        title: "Trusted by Clients. Proven by Results.",
        body: "Real feedback from clients who value professionalism, premium service, and trusted property guidance across Kenya.",
    },
    coastal: {
        eyebrow: "GUEST STORIES",
        title: "Loved on the water.",
        body: "Real feedback from guests who value safety, clear pricing, and unforgettable coastal days in Mombasa.",
    },
} as const;

export function Testimonials({ variant = "default" }: { readonly variant?: TestimonialsVariant }) {
    const testimonialsCol1 = variant === "coastal" ? coastalCol1 : realEstateCol1;
    const testimonialsCol2 = variant === "coastal" ? coastalCol2 : realEstateCol2;
    const content = copy[variant];

    const renderCard = (item: Testimonial, index: number) => (
        <div key={`${item.name}-${index}`} className="flex w-[280px] shrink-0 flex-col gap-4 rounded-xl bg-white p-6 select-none sm:w-[320px]">
            <div className="flex items-center gap-3">
                <Image src={item.avatar} alt={item.name} className="size-11 shrink-0 rounded-full object-cover" width={50} height={50} />
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-800">{item.name}</span>
                    <span className="mt-0.5 text-sm text-zinc-600">{item.location}</span>
                </div>
            </div>

            <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-orange-400 text-orange-400" />
                ))}
            </div>

            <p className="text-sm/5.5 text-zinc-500">{item.text}</p>
        </div>
    );

    return (
        <section className="w-full overflow-hidden bg-brand-50 px-4 py-16 md:px-16 md:py-40 lg:px-24 xl:px-32">
            <div className="mx-auto grid max-w-7xl grid-cols-1 items-start justify-start gap-4 lg:grid-cols-12 lg:gap-2">
                <div className="mt-4 flex flex-col items-start md:mt-20 lg:col-span-5">
                    <motion.div
                        className="flex items-center gap-1.5"
                        initial={{ y: -20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        <span className="size-1.5 bg-zinc-900" />
                        <span className="text-sm text-zinc-900">{content.eyebrow}</span>
                    </motion.div>
                    <div className="mt-3.5 h-[1.5px] w-[148px] bg-linear-to-r from-[#030303] to-white" />
                    <motion.h2
                        className="mt-5 max-w-[400px] text-3xl leading-tight font-medium tracking-tight text-zinc-900 md:text-4xl"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
                    >
                        {content.title}
                    </motion.h2>

                    <motion.p
                        className="mt-2.5 max-w-[340px] text-sm text-zinc-500 md:text-base"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        {content.body}
                    </motion.p>
                </div>

                {/* Mobile: horizontal snap stack instead of tall marquee */}
                <div className="mt-8 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:hidden [&::-webkit-scrollbar]:hidden">
                    {[...testimonialsCol1, ...testimonialsCol2].map((item, index) => renderCard(item, index))}
                </div>

                {/* sm+: marquee */}
                <div className="relative mt-10 hidden h-[520px] justify-center gap-5 overflow-hidden sm:flex md:h-[580px] md:justify-start lg:col-span-7 lg:mt-0">
                    <div className="pointer-events-none absolute inset-0 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.05)]" />
                    <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-24 bg-linear-to-b from-brand-50 to-transparent" />
                    <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-24 bg-linear-to-t from-brand-50 to-transparent" />

                    <div className="flex h-full flex-col overflow-hidden">
                        <div className="animate-marquee-up flex flex-col gap-5 py-2">
                            {testimonialsCol1.map((item, index) => renderCard(item, index))}
                            {testimonialsCol1.map((item, index) => renderCard(item, index + testimonialsCol1.length))}
                        </div>
                    </div>

                    <div className="hidden h-full flex-col overflow-hidden sm:flex">
                        <div className="animate-marquee-down flex flex-col gap-5 py-2">
                            {testimonialsCol2.map((item, index) => renderCard(item, index))}
                            {testimonialsCol2.map((item, index) => renderCard(item, index + testimonialsCol2.length))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
