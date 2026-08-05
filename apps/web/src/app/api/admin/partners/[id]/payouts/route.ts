import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { partnerService } from '@blue-pineapple/iam';

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

  const partner = await partnerService.findById(id);
  if (!partner) {
    return Response.json(
      { error: { code: 'NOT_FOUND', message: 'Partner not found' } },
      { status: 404 }
    );
  }

  return Response.json({ data: partner.payoutAccounts || [], timestamp: new Date().toISOString() });
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

  const body = await request.json();
  const { accountName, accountNumber, bankName, mpesaNumber, isDefault } = body;

  const account = await partnerService.addPayoutAccount({
    partnerId: id,
    accountName,
    accountNumber,
    bankName,
    mpesaNumber,
    isDefault,
  });

  return Response.json({ data: account, timestamp: new Date().toISOString() }, { status: 201 });
}
