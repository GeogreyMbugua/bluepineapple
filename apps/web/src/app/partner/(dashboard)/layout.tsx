import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { PartnerLayout } from '@/components/partner/partner-layout';

export default async function PartnerDashboardLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session.user) {
    redirect('/sign-in');
  }

  if (!session.user.roles.includes('PARTNER')) {
    redirect('/unauthorized');
  }

  return <PartnerLayout>{children}</PartnerLayout>;
}
