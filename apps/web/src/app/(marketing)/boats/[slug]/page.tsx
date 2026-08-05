import { BoatDetailClient } from './boat-detail-client';
import Link from "next/link";
import { headers } from "next/headers";

async function getBaseUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

async function getVessel(slug: string) {
  try {
    const base = await getBaseUrl();
    const res = await fetch(`${base}/api/fleet/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error('[BoatDetailPage] Fetch error:', error);
    return null;
  }
}

async function getAllVessels() {
  try {
    const base = await getBaseUrl();
    const res = await fetch(`${base}/api/fleet`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
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
