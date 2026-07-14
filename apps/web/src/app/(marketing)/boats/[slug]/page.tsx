import { BoatDetailClient } from './boat-detail-client';
import Link from "next/link";

const fleet = [
  {
    name: "Setting Sons",
    slug: "setting-sons",
    subtitle: "Luxury Coastal Cruiser",
    capacity: "Up to 35 Guests",
    hourly: "Ksh 8,000/hr",
    daily: "Ksh 32,000/day",
    images: [
      "/assets/setting.webp",
      "/assets/settings.webp",
      "/assets/24setting.webp",
    ],
    features: [
      "Private Charter",
      "Corporate Events",
      "Harbour Cruises",
    ],
    description: "Experience the Kenyan coastline aboard Setting Sons, a luxury coastal cruiser designed for comfort, safety, and unforgettable moments on the water. Perfect for corporate events, private celebrations, and large group charters.",
    heroImage: "/assets/setting.webp",
  },
  {
    name: "Hunky Dory",
    slug: "hunky-dory",
    subtitle: "Glass Bottom Boat",
    capacity: "Up to 14 Guests",
    hourly: "Ksh 5,000/hr",
    daily: "Ksh 20,000/day",
    images: [
      "/assets/hunky11.webp",
      "/assets/hunky04.webp",
      "/assets/galleryImage3.webp",
    ],
    features: [
      "Glass Bottom",
      "Family Friendly",
      "Marine Viewing",
    ],
    description: "Discover the underwater world aboard Hunky Dory, a glass-bottom boat offering a unique perspective of the Kenyan coast. Ideal for families, marine viewing, and intimate coastal adventures.",
    heroImage: "/assets/hunky11.webp",
  },
];

function getBoat(slug: string) {
  return fleet.find((boat) => boat.slug === slug);
}

export function generateStaticParams() {
  return fleet.map((boat) => ({
    slug: boat.slug,
  }));
}

export default async function BoatDetailPage({ params }: { readonly params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const boat = getBoat(slug);

  if (!boat) {
    return (
      <main className="bg-background text-foreground flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-semibold text-zinc-900 mb-4">Boat Not Found</h1>
          <p className="text-zinc-500 mb-8">The vessel you are looking for does not exist.</p>
          <Link href="/boats" className="inline-flex items-center gap-2 rounded-full bg-cyan-950 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-cyan-900">
            Back to Fleet
          </Link>
        </div>
      </main>
    );
  }

  return <BoatDetailClient boat={boat} />;
}
