"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { publicPath } from "@/lib/paths";

export function Footer() {
    return (
        <footer className="bg-black text-white pt-16 pb-8 mt-32 px-4 md:px-16 lg:px-24 xl:px-32 w-full overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-16">

                    {/* Left Brand Details */}
                    <div className="lg:col-span-7 flex flex-col items-start gap-6">
                        <a href="#" className="select-none">
                            <Image src={publicPath("/logos/logo.avif")} alt="Blue Pineapple Holdings" width={180} height={60} className="h-auto w-auto max-w-[180px]" />
                        </a>
                        <p className="text-zinc-300 text-sm/5.5 max-w-md">
                            Blue Pineapple Holdings Ltd is a dynamic Kenyan company delivering innovative, reliable, and customer-focused business solutions across real estate, hospitality, tourism, and investments.
                        </p>
                    </div>

                    {/* Right Link Columns */}
                    <div className="lg:col-span-5 flex justify-between gap-8 flex-wrap">
                        {/* Explore */}
                        <div className="flex flex-col gap-5">
                            <span className="text-white">Explore</span>
                            <div className="flex flex-col gap-3 text-xs text-zinc-300">
                                <motion.a href="#" className="hover:text-white transition-colors duration-200" 
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                                >
                                    Platform
                                </motion.a>
                                <motion.a href="#" className="hover:text-white transition-colors duration-200" 
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                                >
                                    Experiences
                                </motion.a>
                                <motion.a href="#" className="hover:text-white transition-colors duration-200" 
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                                >
                                    Partners
                                </motion.a>
                                <motion.a href="#" className="hover:text-white transition-colors duration-200" 
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                                >
                                    Bookings
                                </motion.a>
                                <motion.a href="#" className="hover:text-white transition-colors duration-200" 
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                                >
                                    Operations
                                </motion.a>
                            </div>
                        </div>

                        {/* Social */}
                        <div className="flex flex-col gap-5">
                            <span className="text-white">Social</span>
                            <div className="flex flex-col gap-3 text-xs text-zinc-300">
                                <motion.a href="https://www.tiktok.com/@bluepineappleboats" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200" 
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                                >
                                    TikTok
                                </motion.a>
                                <motion.a href="https://www.instagram.com/bluepineappleboats" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200" 
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                                >
                                    Instagram
                                </motion.a>
                                <motion.a href="https://www.facebook.com/Bluepineappleboats" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200" 
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                                >
                                    Facebook
                                </motion.a>
                            </div>
                        </div>

                        {/* Company */}
                        <div className="flex flex-col gap-5">
                            <span className="text-white">Company</span>
                            <div className="flex flex-col gap-3 text-xs text-zinc-300">
                                <motion.a href="#" className="hover:text-white transition-colors duration-200" 
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                                >
                                    About Us
                                </motion.a>
                                <motion.a href="#" className="hover:text-white transition-colors duration-200" 
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                                >
                                    Values
                                </motion.a>
                                <motion.a href="#" className="hover:text-white transition-colors duration-200" 
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                                >
                                    Insights
                                </motion.a>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="w-full h-px bg-zinc-800"></div>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-5 text-xs text-zinc-300">
                    <p>Copyright 2026 © Blue Pineapple Holdings. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors duration-200">Cookie Policy</a>
                    </div>
                </div>
               
            </div>
        </footer>
    );
}
