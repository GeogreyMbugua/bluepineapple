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

const testimonialsCol1: Testimonial[] = [
    {
        name: "Sarah Johnson",
        location: "Fort Jesus Tourist",
        avatar: publicPath("/assets/galleryImage1.webp"),
        text: "The hop-on-hop-off Fort Jesus trip was the highlight of our Mombasa holiday. The crew was professional, the boat was spotless, and the views were incredible.",
    },
    {
        name: "James Ochieng",
        location: "Private Charter Guest",
        avatar: publicPath("/assets/galleryImage2.webp"),
        text: "Chartered Setting Sons for a corporate event. The 360° surveillance and attentive crew made it feel premium from start to finish.",
    },
];

const testimonialsCol2: Testimonial[] = [
    {
        name: "Emily Wanjiku",
        location: "Snorkelling Enthusiast",
        avatar: publicPath("/assets/galleryImage3.webp"),
        text: "The snorkelling reef trip was magical. Gliding over coral gardens with tropical fish all around — an experience we will never forget.",
    },
    {
        name: "David Kamau",
        location: "Sunset Cruise",
        avatar: publicPath("/assets/image1.webp"),
        text: "The sunset sailing experience with Swahili snacks and photo opportunities was the perfect way to end our day in Mombasa.",
    },
];

export function Testimonials() {
    const renderCard = (item: Testimonial, index: number) => (
        <div key={index} className="bg-white p-6 rounded-xl flex flex-col gap-4 w-[280px] sm:w-[320px] select-none">
            <div className="flex items-center gap-3">
                <Image src={item.avatar} alt={item.name} className="size-11 rounded-full object-cover shrink-0" width={50} height={50} />
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-800">
                        {item.name}
                    </span>
                    <span className="text-sm text-zinc-600 mt-0.5">
                        {item.location}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-orange-400 text-orange-400" />
                ))}
            </div>

            <p className="text-sm/5.5 text-zinc-500">
                {item.text}
            </p>
        </div>
    );

    return (
        <section className="py-20 md:py-40 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-brand-50 overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-2 justify-start items-start">

                {/* Left Column - Header Details */}
                <div className="lg:col-span-5 flex flex-col items-start mt-20">
                    <motion.div className="flex items-center gap-1.5"
                        initial={{ y: -20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        <span className="size-1.5 bg-zinc-900"></span>
                        <span className="text-sm text-zinc-900">
                            GUEST REVIEWS
                        </span>
                    </motion.div>
                    <div className="w-[148px] h-[1.5px] bg-linear-to-r from-[#030303] to-white mt-3.5"></div>
                        <motion.h2 className="text-3xl md:text-4xl text-zinc-900 mt-5 leading-tight font-medium tracking-tight max-w-[400px]"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
                    >
                        Trusted by Guests. Proven by the Sea.
                    </motion.h2>

                    <motion.p className="text-zinc-500 text-sm md:text-base mt-2.5 max-w-[340px]"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        Honest words from guests who value premium coastal experiences built on safety, comfort, and authentic Kenyan hospitality.
                    </motion.p>
                </div>

                {/* Right Column - Marquee Scroll Area with subtle colored shadow */}
                <div className="lg:col-span-7 relative h-[520px] md:h-[580px] overflow-hidden flex justify-center md:justify-start gap-5 mt-10 lg:mt-0">
                    {/* Shadow overlay on the right side */}
                    <div className="absolute inset-0 pointer-events-none rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.05)]"></div>

                    {/* Fade-out masks */}
                    <div className="absolute top-0 left-0 right-0 h-24 bg-linear-to-b from-brand-50 to-transparent pointer-events-none z-10" />
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-brand-50 to-transparent pointer-events-none z-10" />

                    {/* Column 1 (Scrolls Upwards) */}
                    <div className="overflow-hidden h-full flex flex-col">
                        <div className="flex flex-col gap-5 animate-marquee-up py-2">
                            {testimonialsCol1.map((item, index) => renderCard(item, index))}
                            {testimonialsCol1.map((item, index) => renderCard(item, index + testimonialsCol1.length))}
                        </div>
                    </div>

                    {/* Column 2 (Scrolls Downwards) */}
                    <div className="overflow-hidden h-full hidden sm:flex flex-col">
                        <div className="flex flex-col gap-5 animate-marquee-down py-2">
                            {testimonialsCol2.map((item, index) => renderCard(item, index))}
                            {testimonialsCol2.map((item, index) => renderCard(item, index + testimonialsCol2.length))}
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}