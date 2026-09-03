import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { bookingRepository } from '@blue-pineapple/database';
import { mpesaStkService } from '@blue-pineapple/finance';

const bodySchema = z.object({
  bookingId: z.string().uuid(),
  phone: z.string().min(9).max(16),
  amount: z.number().positive().optional(),
  transactionDesc: z.string().max(13).optional(),
});

/**
 * Initiate M-Pesa Express STK Push for a booking.
 * Body: { bookingId, phone, amount?, transactionDesc? }
 */
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const body = bodySchema.parse(json);

    const booking = await bookingRepository.findById(body.bookingId);
    if (!booking) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Booking not found' } },
        { status: 404 },
      );
    }

    if (booking.paymentStatus === 'PAID') {
      return NextResponse.json(
        { error: { code: 'ALREADY_PAID', message: 'Booking is already paid' } },
        { status: 409 },
      );
    }

    const amount = Math.round(Number(body.amount ?? booking.totalAmount));
    if (!Number.isFinite(amount) || amount < 1) {
      return NextResponse.json(
        { error: { code: 'INVALID_AMOUNT', message: 'Amount must be at least KES 1' } },
        { status: 400 },
      );
    }

    const result = await mpesaStkService.initiate({
      bookingId: booking.id,
      amount,
      currency: booking.currency || 'KES',
      phone: body.phone,
      accountReference: booking.bookingReference,
      transactionDesc: body.transactionDesc ?? 'Booking',
      partnerId: booking.partnerId ?? undefined,
      idempotencyKey: `stk:${booking.id}:${amount}:${body.phone}`,
      metadata: {
        bookingReference: booking.bookingReference,
      },
    });

    return NextResponse.json(
      {
        data: result,
        timestamp: new Date().toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: error.issues[0]?.message ?? 'Validation failed',
          },
        },
        { status: 400 },
      );
    }

    const message = error instanceof Error ? error.message : 'Failed to initiate STK Push';
    const isConfig = message.includes('Missing required env');
    return NextResponse.json(
      {
        error: {
          code: isConfig ? 'DARAJA_NOT_CONFIGURED' : 'STK_FAILED',
          message,
        },
      },
      { status: isConfig ? 503 : 400 },
    );
  }
}
