import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { prisma } from '@blue-pineapple/database';
import { createClerkClient } from '@clerk/backend';

export async function POST(_request: NextRequest) {
  const result = await requireAdminAuth(_request);
  if (result instanceof Response) return result;

  try {
    const partners = await prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: 'PARTNER',
            },
          },
        },
        clerkUserId: null,
      },
      include: {
        partnerProfile: true,
      },
    });

    const results: Array<{
      userId: string;
      partnerCode: string;
      email: string | null;
      status: 'success' | 'error';
      message: string;
    }> = [];

    for (const partner of partners) {
      try {
        if (!partner.email) {
          results.push({
            userId: partner.id,
            partnerCode: partner.partnerProfile?.partnerCode ?? 'N/A',
            email: null,
            status: 'error',
            message: 'No email address',
          });
          continue;
        }

        const clerk = createClerkClient({
          secretKey: process.env.CLERK_SECRET_KEY!,
        });

        const clerkUser = await clerk.users.createUser({
          emailAddress: [partner.email],
          firstName: partner.firstName ?? 'Partner',
          lastName: partner.lastName ?? '',
          skipPasswordRequirement: true,
          skipLegalChecks: true,
        });

        await prisma.user.update({
          where: { id: partner.id },
          data: {
            clerkUserId: clerkUser.id,
            status: 'ACTIVE',
          },
        });

        results.push({
          userId: partner.id,
          partnerCode: partner.partnerProfile?.partnerCode ?? 'N/A',
          email: partner.email,
          status: 'success',
          message: 'Clerk account created',
        });
      } catch (error) {
        results.push({
          userId: partner.id,
          partnerCode: partner.partnerProfile?.partnerCode ?? 'N/A',
          email: partner.email,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const errorCount = results.filter((r) => r.status === 'error').length;

    return Response.json({
      data: {
        summary: {
          total: results.length,
          success: successCount,
          failed: errorCount,
        },
        results,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to sync partners',
        },
      },
      { status: 500 }
    );
  }
}
