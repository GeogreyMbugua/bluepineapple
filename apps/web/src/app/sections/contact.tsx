"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const houseImage = "/assets/house.png";

export function Contact() {
    return (
        <section className="py-20 w-full flex items-center justify-center">
            <div className="max-w-5xl w-full mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                {/* Left Column: Contact Form */}
                <div className="flex flex-col">

                    <motion.div className="flex items-center gap-1.5"
                        initial={{ y: -20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        <span className="size-1.5 bg-zinc-900"></span>
                        <span className="text-sm text-zinc-900">
                            CONTACT BLUE PINEAPPLE
                        </span>
                    </motion.div>

                    <motion.h2 className="text-3xl md:text-[40px]/11 text-zinc-900 mt-5 leading-tight font-medium max-w-[400px]"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
                    >
                        Connect with us <br />to explore the platform
                    </motion.h2>

                    {/* Form */}
                    <form className="mt-15 flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Name */}
                            <div className="flex flex-col">
                                <motion.label className="text-sm text-zinc-600 mb-2"
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                                >
                                    YOUR NAME
                                </motion.label>
                                <motion.input type="text" placeholder="A. Patel" className="w-full border border-zinc-200 rounded-sm px-4 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-300 transition-colors" 
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                                />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col">
                                <motion.label className="text-sm text-zinc-600 mb-2"
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                                >
                                    EMAIL ADDRESS
                                </motion.label>
                                <motion.input type="email" placeholder="partner@bluepineapple.com" className="w-full border border-zinc-200 rounded-sm px-4 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-300 transition-colors" 
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Phone */}
                            <div className="flex flex-col">
                                <motion.label className="text-sm text-zinc-600 mb-2"
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                                >
                                    PHONE NUMBER
                                </motion.label>
                                <motion.input type="tel" placeholder="E.g. +254 700 000 000" className="w-full border border-zinc-200 rounded-sm px-4 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-300 transition-colors" 
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                                />
                            </div>

                            {/* Subject */}
                            <div className="flex flex-col">
                                <motion.label className="text-sm text-zinc-600 mb-2"
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                                >
                                    SUBJECT
                                </motion.label>
                                <motion.input type="text" placeholder="E.g. Partnership Inquiry" className="w-full border border-zinc-200 rounded-sm px-4 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-300 transition-colors" 
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                                />
                            </div>
                        </div>

                        {/* Message */}
                        <div className="flex flex-col">
                            <motion.label className="text-sm text-zinc-600 mb-2"
                                initial={{ y: 50, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                            >
                                MESSAGE
                            </motion.label>
                            <motion.textarea rows={4} placeholder="E.g. I would like to learn more about the platform" className="w-full border border-zinc-200 rounded-sm px-4 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-300 transition-colors resize-none" 
                                initial={{ y: 50, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                            />
                        </div>

                        {/* Submit Button */}
                        <motion.div className="mt-2"
                            initial={{ y: 50, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                        >
                            <button type="submit" className="bg-black hover:bg-zinc-900 text-white text-xs px-6 py-3.5 rounded-full transition-colors duration-200 cursor-pointer">
                                GET IN TOUCH
                            </button>
                        </motion.div>
                    </form>
                </div>

                {/* Right Column: Key Details Image Card */}
                <motion.div className="relative overflow-hidden group flex justify-center"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                    <div className="relative w-[382px] h-[455px] overflow-hidden rounded-xl">
                        <Image src={houseImage} alt="Contact House" width={382} height={455} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none brightness-80" />

                        {/* Details Content Overlay */}
                        <div className="absolute bottom-10 left-10 flex flex-col gap-2.5 z-10">
                            <span className="text-base text-white">
                                KEY DETAILS
                            </span>
                            <motion.div className="flex flex-col gap-1 text-sm text-white"
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                            >
                                <p>Monday-Friday: 10 AM - 6 PM</p>
                                <p>Saturday: 10 AM - 4 PM</p>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
