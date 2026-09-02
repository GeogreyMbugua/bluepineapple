import { requirePortalSession } from '@/lib/auth/portal-access';
import { PartnerLayout } from '@/components/partner/partner-layout';

export default async function PartnerDashboardLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  await requirePortalSession('partner');

  return <PartnerLayout>{children}</PartnerLayout>;
}
