'use client';

interface PaymentBadgeProps {
  status: string;
}

export function PaymentBadge({ status }: PaymentBadgeProps) {
  const isPaid = status === 'PAID';
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded ${
        isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
      }`}
    >
      {status}
    </span>
  );
}
