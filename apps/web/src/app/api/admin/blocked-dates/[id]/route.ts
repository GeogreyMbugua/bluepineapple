import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { prisma } from '@blue-pineapple/database';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const { id } = await params;
    await prisma.blockedDate.delete({
      where: { id },
    });

    return Response.json({ success: true, timestamp: new Date().toISOString() });
  } catch {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete blocked date' } },
      { status: 500 }
    );
  }
}
