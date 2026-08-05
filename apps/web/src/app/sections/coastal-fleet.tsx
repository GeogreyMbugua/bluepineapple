"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { publicPath } from "@/lib/paths";
import { useEffect, useState } from "react";

type FleetBoat = {
  name: string;
  href: string;
  image: string;
  subtitle: string;
  description: string;
  capacity: number;
  hourlyRate: string;
  dailyRate: string;
  features: string[];
};

function mapVesselToBoat(vessel: {
  name: string;
  slug: string;
  subtitle?: string | null;
  description?: string | null;
  capacity: number;
  hourlyRate?: string | null;
  dailyRate?: string | null;
  images?: string[] | null;
}): FleetBoat {
  return {
    name: vessel.name,
    href: `/boats/${vessel.slug}`,
    image: publicPath(vessel.images?.[0] || "/assets/settingsons/setting01.webp"),
    subtitle: vessel.subtitle || "",
    description: vessel.description || "",
    capacity: vessel.capacity,
    hourlyRate: vessel.hourlyRate || "",
    dailyRate: vessel.dailyRate || "",
    features: [],
  };
}

export function CoastalFleet() {
  const [boats, setBoats] = useState<FleetBoat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/fleet', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          const vessels = json.data || [];
          setBoats(vessels.map(mapVesselToBoat));
        }
      } catch {
        // Keep empty array on error
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <section id="fleet" className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[16/9] bg-slate-100 animate-pulse rounded-2xl" />
                <div className="space-y-2">
                  <div className="h-5 bg-slate-100 animate-pulse rounded w-2/3" />
                  <div className="h-4 bg-slate-100 animate-pulse rounded w-full" />
                  <div className="h-4 bg-slate-100 animate-pulse rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="fleet" className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {boats.map((boat, index) => (
            <motion.article
              key={boat.name}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.08,
                duration: 0.5,
                ease: "easeOut",
              }}
            >
              <Link href={boat.href} className="group block h-full">
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
                  <Image
                    src={boat.image}
                    alt={boat.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-cyan-700 transition-colors">
                      {boat.name}
                    </h3>
                    {boat.subtitle && (
                      <p className="text-sm text-zinc-500">{boat.subtitle}</p>
                    )}
                  </div>
                  <p className="text-sm text-zinc-600 line-clamp-2">
                    {boat.description}
                  </p>
                  <div className="flex items-center justify-between pt-2 text-xs text-zinc-500">
                    <span>Capacity: {boat.capacity}</span>
                    {boat.hourlyRate && <span>{boat.hourlyRate}</span>}
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}