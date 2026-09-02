import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { AddPayoutAccountSchema, partnerService } from '@blue-pineapple/iam';
import { z } from 'zod';

const AddPayoutAccountBodySchema = AddPayoutAccountSchema.omit({ partnerId: true });
const SetDefaultPayoutAccountSchema = z.object({
  action: z.literal('set-default'),
  accountId: z.string().uuid(),
});

function maskSensitiveValue(value: string | null): string | null {
  if (!value) return null;
  return `••••${value.slice(-4)}`;
}

function formatPayoutAccount(account: {
  id: string;
  partnerId: string;
  accountName: string;
  accountNumber: string;
  bankName: string | null;
  mpesaNumber: string | null;
  isDefault: boolean;
}) {
  return {
    ...account,
    accountNumber: maskSensitiveValue(account.accountNumber),
    mpesaNumber: maskSensitiveValue(account.mpesaNumber),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  const { id } = await params;
  if (!id) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Partner ID is required' } },
      { status: 400 }
    );
  }

  try {
    const partner = await partnerService.findById(id);
    if (!partner) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'Partner not found' } },
        { status: 404 },
      );
    }

    return Response.json({
      data: partner.payoutAccounts.map(formatPayoutAccount),
      timestamp: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch payout accounts' } },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  const { id } = await params;
  if (!id) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Partner ID is required' } },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const defaultRequest = SetDefaultPayoutAccountSchema.safeParse(body);
    if (defaultRequest.success) {
      const partner = await partnerService.setDefaultPayoutAccount(
        defaultRequest.data.accountId,
        id,
      );
      const account = partner?.payoutAccounts.find(
        (item) => item.id === defaultRequest.data.accountId,
      );
      return Response.json({
        data: account ? formatPayoutAccount(account) : null,
        timestamp: new Date().toISOString(),
      });
    }

    const validated = AddPayoutAccountBodySchema.parse(body);
    const account = await partnerService.addPayoutAccount({
      partnerId: id,
      ...validated,
    });

    return Response.json(
      { data: formatPayoutAccount(account), timestamp: new Date().toISOString() },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: error.issues[0]?.message ?? 'Invalid payout account' } },
        { status: 400 },
      );
    }
    return Response.json(
      { error: { code: 'OPERATION_FAILED', message: error instanceof Error ? error.message : 'Failed to save payout account' } },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  const { id } = await params;
  const accountId = new URL(request.url).searchParams.get('accountId');
  const parsedAccountId = z.string().uuid().safeParse(accountId);
  if (!id || !parsedAccountId.success) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Partner ID and account ID are required' } },
      { status: 400 },
    );
  }

  try {
    await partnerService.removePayoutAccount(parsedAccountId.data, id);
    return Response.json({ data: { success: true }, timestamp: new Date().toISOString() });
  } catch (error) {
    return Response.json(
      { error: { code: 'OPERATION_FAILED', message: error instanceof Error ? error.message : 'Failed to remove payout account' } },
      { status: 400 },
    );
  }
}
