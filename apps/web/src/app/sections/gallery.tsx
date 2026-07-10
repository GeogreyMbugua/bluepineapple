"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { publicPath } from "@/lib/paths";

export function Gallery() {
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    const images = [
        publicPath("/assets/galleryImage1.webp"), publicPath("/assets/galleryImage2.webp"), publicPath("/assets/galleryImage3.webp"), publicPath("/assets/location.webp"),
        publicPath("/assets/galleryImage1.webp"), publicPath("/assets/galleryImage2.webp"), publicPath("/assets/galleryImage3.webp"), publicPath("/assets/site.webp")
    ];

    useEffect(() => {
        const container = containerRef.current;
        const track = trackRef.current;
        if (!container || !track) return;

        const handleScroll = () => {
            const rect = container.getBoundingClientRect();
            const viewHeight = window.innerHeight;
            const totalHeight = rect.height;
            const scrolled = -rect.top;
            const maxScroll = totalHeight - viewHeight;

            if (maxScroll <= 0) return;

      
            const progress = Math.max(0, Math.min(1, scrolled / maxScroll));
            
     
            const limit = Math.max(0, track.scrollWidth - window.innerWidth);

            track.style.transform = `translateX(-${progress * limit}px)`;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        
        const timer = setTimeout(handleScroll, 100);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearTimeout(timer);
        };
    }, []);

    return (
        <section ref={containerRef} className="relative h-[180vh] w-full">
            
            <div className="sticky top-0 h-screen overflow-hidden flex items-center">
                
               
                <div ref={trackRef} className="flex gap-5 px-4 md:px-16 lg:px-24 xl:px-32 py-16 md:py-20 will-change-transform">
                    {images.map((src, index) => (
                        <Image key={index} src={src} alt={`Gallery Image ${index + 1}`} width={364} height={457} className="object-cover shrink-0 pointer-events-none" />
                    ))}
                </div>

            </div>
        </section>
    );
}