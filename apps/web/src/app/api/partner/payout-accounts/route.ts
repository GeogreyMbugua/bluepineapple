import { NextRequest } from 'next/server';
import { requirePartnerAuth } from '@/lib/api/partner-helpers';
import { partnerService } from '@blue-pineapple/iam';
import { z } from 'zod';

const AddPayoutAccountSchema = z.object({
  accountName: z.string().min(1),
  accountNumber: z.string().min(1),
  bankName: z.string().optional().nullable(),
  mpesaNumber: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const result = await requirePartnerAuth(request);
  if (result instanceof Response) return result;

  try {
    const user = result;
    const partner = await partnerService.findByUserId(user.id);

    if (!partner) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'Partner profile not found' } },
        { status: 404 }
      );
    }

    return Response.json({ data: partner.payoutAccounts, timestamp: new Date().toISOString() });
  } catch {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch payout accounts' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const result = await requirePartnerAuth(request);
  if (result instanceof Response) return result;

  try {
    const user = result;
    const partner = await partnerService.findByUserId(user.id);

    if (!partner) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'Partner profile not found' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = AddPayoutAccountSchema.parse(body);

    const payoutAccount = await partnerService.addPayoutAccount({
      partnerId: partner.id,
      accountName: validated.accountName,
      accountNumber: validated.accountNumber,
      bankName: validated.bankName ?? null,
      mpesaNumber: validated.mpesaNumber ?? null,
    });

    return Response.json({ data: payoutAccount, timestamp: new Date().toISOString() }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues?.[0]?.message || error.message || 'Validation failed';
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message } },
        { status: 400 }
      );
    }
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to add payout account' } },
      { status: 500 }
    );
  }
}
