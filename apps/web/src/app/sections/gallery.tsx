"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export function Gallery() {
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    const images = [
        "/bluepineapple/assets/galleryImage1.png", "/bluepineapple/assets/galleryImage2.png", "/bluepineapple/assets/galleryImage3.png", "/bluepineapple/assets/galleryImage4.png",
        "/bluepineapple/assets/galleryImage1.png", "/bluepineapple/assets/galleryImage2.png", "/bluepineapple/assets/galleryImage3.png", "/bluepineapple/assets/galleryImage4.png"
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
        window.addEventListener("resize", handleScroll);
        
       
        const timer = setTimeout(handleScroll, 100);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
            clearTimeout(timer);
        };
    }, []);

    return (
        <section ref={containerRef} className="relative h-[180vh] w-full">
            
            <div className="sticky top-0 h-screen overflow-hidden flex items-center">
                
               
                <div ref={trackRef} className="flex gap-5 px-4 md:px-16 lg:px-24 xl:px-32 py-16 md:py-20 will-change-transform transition-transform duration-300 ease-out">
                    {images.map((src, index) => (
                        <Image key={index} src={src} alt={`Gallery Image ${index + 1}`} width={364} height={457} className="object-cover shrink-0 pointer-events-none" />
                    ))}
                </div>

            </div>
        </section>
    );
}