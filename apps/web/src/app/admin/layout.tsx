import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { AdminShell } from '@/components/admin/layout/admin-shell';
import { AdminBookingNotifications } from '@/components/admin/bookings/admin-booking-notifications';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session.user) {
    redirect('/sign-in');
  }

  if (!session.user.roles.includes('ADMIN' as never) && !session.user.roles.includes('SUPER_ADMIN' as never)) {
    redirect('/unauthorized');
  }

  return (
    <AdminShell>
      {children}
      <AdminBookingNotifications />
    </AdminShell>
  );
}
