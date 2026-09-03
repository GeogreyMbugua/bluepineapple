import { requirePortalSession } from '@/lib/auth/portal-access';
import { PartnerLayout } from '@/components/partner/partner-layout';
import { SessionHydrator } from '@/components/auth/session-hydrator';

export default async function PartnerDashboardLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const user = await requirePortalSession('partner');

  return (
    <PartnerLayout>
      <SessionHydrator user={user} />
      {children}
    </PartnerLayout>
  );
}
