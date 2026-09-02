import { requirePortalSession } from '@/lib/auth/portal-access';
import { AdminShell } from '@/components/admin/layout/admin-shell';
import { AdminBookingNotifications } from '@/components/admin/bookings/admin-booking-notifications';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePortalSession('admin');

  return (
    <AdminShell>
      {children}
      <AdminBookingNotifications />
    </AdminShell>
  );
}
