'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/admin/ui/button';
import { Modal } from '@/components/admin/ui/modal';
import { PartnerBookingForm } from '@/components/partner/partner-booking-form';

interface Props {
  partnerName: string;
}

export function BookingsPageHeader({ partnerName }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark">Bookings</h1>
          <p className="text-dark-6 mt-1">Manage your bookings for {partnerName}</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Create Booking</Button>
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Booking"
      >
        <PartnerBookingForm
          onBookingCreated={() => {
            setIsModalOpen(false);
            router.push('/partner/(dashboard)/bookings');
          }}
        />
      </Modal>
    </>
  );
}
