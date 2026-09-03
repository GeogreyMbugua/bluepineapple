'use client';

import { Drawer } from '@/components/admin/ui/drawer';
import {
  BookingCard,
  type AdminPartnerOption,
} from '@/app/(marketing)/trips/fort-jesus-trip/_components/BookingCard';

interface PartnerBookingDrawerProps {
  open: boolean;
  partner: AdminPartnerOption | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PartnerBookingDrawer({
  open,
  partner,
  onClose,
  onSuccess,
}: PartnerBookingDrawerProps) {
  if (!partner) return null;

  const description = [
    partner.partnerCode,
    partner.companyName,
    'Partner reward pricing',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Drawer open={open} onClose={onClose} title="Book water taxi" description={description}>
      <BookingCard
        key={partner.id}
        mode="admin-partner"
        lockedPartner={partner}
        hideMobileTrigger
        forceDesktopLayout
        embedded
        showHeader={false}
        onBookingSuccess={() => {
          onSuccess?.();
          onClose();
        }}
      />
    </Drawer>
  );
}
