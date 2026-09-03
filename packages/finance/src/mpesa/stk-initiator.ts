import { Prisma } from '@prisma/client';
import { prisma } from '@blue-pineapple/database';
import { paymentIntentRepository } from '@blue-pineapple/database';
import { eventBus } from '@blue-pineapple/iam';
import { PaymentProviderFactory } from '../payment-providers';
import { normalizeMsisdn, truncateAccountReference } from '../daraja';
import { IntentService } from '../services/payment-intent.service';
import type { PaymentFailedEvent } from '../events';

export interface InitiateStkInput {
  bookingId?: string;
  amount: number;
  currency?: string;
  phone: string;
  accountReference: string;
  transactionDesc?: string;
  customerId?: string;
  partnerId?: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
}

export interface InitiateStkResult {
  intentId: string;
  intentReference: string;
  paymentId: string;
  paymentReference: string;
  checkoutRequestId: string;
  merchantRequestId: string;
  status: 'PENDING';
  customerMessage?: string;
}

function mapExistingPending(
  intent: {
    id: string;
    intentReference: string;
    status: string;
  },
  payment: {
    id: string;
    paymentReference: string;
    providerPaymentId: string | null;
    authorizationCode: string | null;
  },
): InitiateStkResult | null {
  if (intent.status === 'CAPTURED') {
    throw new Error('Booking payment already completed');
  }
  if (payment.providerPaymentId && intent.status === 'PENDING') {
    return {
      intentId: intent.id,
      intentReference: intent.intentReference,
      paymentId: payment.id,
      paymentReference: payment.paymentReference,
      checkoutRequestId: payment.providerPaymentId,
      merchantRequestId: payment.authorizationCode ?? '',
      status: 'PENDING',
      customerMessage: 'STK Push already initiated',
    };
  }
  return null;
}

/**
 * Creates intent + fires STK Push + records Payment with CheckoutRequestID.
 */
export class MpesaStkInitiator {
  constructor(private readonly intents = new IntentService()) {}

  async initiate(input: InitiateStkInput, actorId?: string): Promise<InitiateStkResult> {
    const phone = normalizeMsisdn(input.phone);
    const amount = Math.round(Number(input.amount));
    if (!Number.isFinite(amount) || amount < 1) {
      throw new Error('Amount must be a whole number of KES >= 1');
    }

    const accountReference = truncateAccountReference(input.accountReference);

    if (input.idempotencyKey) {
      const existing = await prisma.paymentIntent.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        include: { payments: true },
      });
      if (existing) {
        const payment = existing.payments[0];
        if (payment) {
          const mapped = mapExistingPending(existing, payment);
          if (mapped) return mapped;
        }
        if (existing.status === 'CAPTURED') {
          throw new Error('Booking payment already completed');
        }
        if (existing.status === 'FAILED' || existing.status === 'CANCELLED') {
          // Release key so the guest can tap "Pay" again after cancel/fail.
          await prisma.paymentIntent.update({
            where: { id: existing.id },
            data: { idempotencyKey: null },
          });
        }
      }
    }

    let created: { id: string; intentReference: string };
    try {
      created = await this.intents.create(
        {
          bookingId: input.bookingId,
          customerId: input.customerId,
          partnerId: input.partnerId,
          amount,
          currency: input.currency ?? 'KES',
          paymentMethod: 'MPESA',
          providerType: 'MPESA',
          idempotencyKey: input.idempotencyKey,
          metadata: {
            ...input.metadata,
            phone,
            accountReference,
            transactionDesc: input.transactionDesc ?? 'Payment',
          },
        },
        actorId,
      );
    } catch (error) {
      // Concurrent initiate with same idempotency key.
      if (
        input.idempotencyKey &&
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const raced = await prisma.paymentIntent.findUnique({
          where: { idempotencyKey: input.idempotencyKey },
          include: { payments: true },
        });
        if (raced?.payments[0]) {
          const mapped = mapExistingPending(raced, raced.payments[0]);
          if (mapped) return mapped;
        }
      }
      throw error;
    }

    const intent = await paymentIntentRepository.findById(created.id);
    if (!intent) throw new Error('Payment intent not found after create');

    // If IntentService returned existing intent (same idempotency), avoid double STK.
    if (intent.payments?.length) {
      const payment = intent.payments[0];
      if (payment) {
        const mapped = mapExistingPending(intent, payment);
        if (mapped) return mapped;
      }
    }

    const provider = PaymentProviderFactory.create('MPESA');
    const authResult = await provider.authorize({
      intent,
      metadata: {
        phone,
        accountReference,
        transactionDesc: input.transactionDesc ?? 'Payment',
      },
    });

    if (!authResult.success || !authResult.providerPaymentId) {
      await prisma.paymentIntent.update({
        where: { id: intent.id },
        data: {
          status: 'FAILED',
          failedAt: new Date(),
          failureReason: authResult.errorMessage ?? 'STK Push failed',
        },
      });

      eventBus.emit('payment.failed', {
        intentId: intent.id,
        reason: authResult.errorMessage ?? 'STK Push failed',
        failureCode: authResult.errorCode,
        providerType: 'MPESA',
      } as PaymentFailedEvent);

      throw new Error(authResult.errorMessage ?? 'STK Push failed');
    }

    try {
      const payment = await prisma.payment.create({
        data: {
          paymentReference: `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          intentId: intent.id,
          amount: intent.amount,
          currency: intent.currency,
          status: 'PENDING',
          paymentMethod: 'MPESA',
          providerType: 'MPESA',
          providerPaymentId: authResult.providerPaymentId,
          authorizationCode: authResult.authorizationCode,
          providerResponse: authResult.response as object,
          metadata: {
            phone,
            accountReference,
            merchantRequestId: authResult.authorizationCode,
            checkoutRequestId: authResult.providerPaymentId,
          },
        },
      });

      return {
        intentId: intent.id,
        intentReference: intent.intentReference,
        paymentId: payment.id,
        paymentReference: payment.paymentReference,
        checkoutRequestId: authResult.providerPaymentId,
        merchantRequestId: authResult.authorizationCode ?? '',
        status: 'PENDING',
        customerMessage:
          (authResult.response as { CustomerMessage?: string } | undefined)?.CustomerMessage,
      };
    } catch (error) {
      // Unique CheckoutRequestID: concurrent initiate — return existing payment.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const existing = await prisma.payment.findUnique({
          where: { providerPaymentId: authResult.providerPaymentId },
        });
        if (existing) {
          return {
            intentId: existing.intentId,
            intentReference: intent.intentReference,
            paymentId: existing.id,
            paymentReference: existing.paymentReference,
            checkoutRequestId: authResult.providerPaymentId,
            merchantRequestId: authResult.authorizationCode ?? '',
            status: 'PENDING',
            customerMessage: 'STK Push already initiated',
          };
        }
      }
      throw error;
    }
  }
}

export const mpesaStkInitiator = new MpesaStkInitiator();
