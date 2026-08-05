import { BoatDetailClient } from './boat-detail-client';
import Link from "next/link";
import { vesselService } from '@blue-pineapple/iam';

async function getVessel(slug: string) {
  try {
    const vessels = await vesselService.listActiveVessels();
    const decodedSlug = decodeURIComponent(slug).toLowerCase();
    const vessel = vessels.find((v) => v.slug && v.slug.toLowerCase() === decodedSlug);
    if (!vessel) return null;

    return {
      name: vessel.name,
      slug: vessel.slug,
      subtitle: vessel.subtitle || vessel.type || 'Luxury Vessel',
      capacity: vessel.capacity,
      hourlyRate: vessel.hourlyRate ? `KES ${vessel.hourlyRate.toLocaleString()}/hr` : 'Contact for pricing',
      dailyRate: vessel.dailyRate ? `KES ${vessel.dailyRate.toLocaleString()}/day` : 'Contact for pricing',
      images: Array.isArray(vessel.images) && vessel.images.length > 0 ? (vessel.images as string[]) : [vessel.heroImage || '/images/boats/default.jpg'],
      features: Array.isArray(vessel.features) ? (vessel.features as string[]) : [],
      description: vessel.description || '',
      heroImage: vessel.heroImage || '/images/boats/default.jpg',
    };
  } catch (error) {
    console.error('[BoatDetailPage] Error:', error);
    return null;
  }
}

async function getAllVessels() {
  try {
    return await vesselService.listActiveVessels();
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  const vessels = await getAllVessels();
  return vessels.map((vessel: { slug: string }) => ({
    slug: vessel.slug,
  }));
}

export default async function BoatDetailPage({ params }: { readonly params: Promise<{ slug: string }> }) {
  const resolved = await params;
  const rawSlug = typeof resolved.slug === 'string' ? resolved.slug : Array.isArray(resolved.slug) ? resolved.slug[0] : '';
  const slug = rawSlug.trim();
  const boat = await getVessel(slug);

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
