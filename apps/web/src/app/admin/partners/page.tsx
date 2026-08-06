import { Suspense } from 'react';
import { getServerSession } from '@/lib/auth';
import { getAdminPartners } from '@/lib/services/admin-partners.service';
import { PartnersClient } from '@/components/admin/partners/partners-client';

export const dynamic = 'force-dynamic';

export default async function AdminPartnersPage() {
  const session = await getServerSession();
  if (!session.user) {
    return null;
  }

  // Server-side initial hydration — no client-side loading flash
  const initialPartners = await getAdminPartners();

  return (
    <div className="space-y-6">
      <Suspense fallback={
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse bg-gray-100" />
          ))}
        </div>
      }>
        <PartnersClient initialPartners={initialPartners} />
      </Suspense>
    </div>
  );
}
