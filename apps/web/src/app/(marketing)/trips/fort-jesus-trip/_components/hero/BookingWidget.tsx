'use client';

import {
  BookingCard,
  type AdminPartnerOption,
} from '../BookingCard';

type BookingWidgetProps = {
  readonly mode?: 'public' | 'admin-partner';
  readonly partners?: AdminPartnerOption[];
  readonly defaultPartnerId?: string;
  readonly lockedPartner?: AdminPartnerOption;
  readonly onBookingSuccess?: () => void;
  readonly embedded?: boolean;
};

/**
 * Hero booking panel — always uses the compact desktop form layout
 * so mobile can stack copy → flyer → form without a separate sheet.
 */
export function BookingWidget(props: BookingWidgetProps = {}) {
  return (
    <BookingCard
      {...props}
      forceDesktopLayout
      showHeader
      hideMobileTrigger
    />
  );
}
