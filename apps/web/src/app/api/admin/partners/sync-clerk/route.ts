import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { prisma } from '@blue-pineapple/database';
import { createClerkClient } from '@clerk/backend';

export async function POST(_request: NextRequest) {
  const result = await requireAdminAuth(_request);
  if (result instanceof Response) return result;

  try {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      return Response.json(
        { error: { code: 'CONFIGURATION_ERROR', message: 'Clerk synchronization is not configured' } },
        { status: 503 },
      );
    }
    const clerk = createClerkClient({ secretKey });
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
        partnerProfile: { isNot: null },
      },
      include: {
        partnerProfile: true,
        roles: {
          include: { role: { select: { name: true } } },
        },
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

        const matchingClerkUsers = await clerk.users.getUserList({
          emailAddress: [partner.email],
          limit: 10,
        });
        if (matchingClerkUsers.data.length > 1) {
          throw new Error('Multiple Clerk accounts match this email; link manually');
        }

        const clerkUser = matchingClerkUsers.data[0] ?? await clerk.users.createUser({
          emailAddress: [partner.email],
          firstName: partner.firstName ?? 'Partner',
          lastName: partner.lastName ?? '',
          skipPasswordRequirement: true,
          skipLegalChecks: true,
        });

        const linkedUser = await prisma.user.findFirst({
          where: { clerkUserId: clerkUser.id },
          select: { id: true },
        });
        if (linkedUser && linkedUser.id !== partner.id) {
          throw new Error('Clerk account is already linked to another database user');
        }

        const linked = await prisma.user.updateMany({
          where: { id: partner.id, clerkUserId: null },
          data: {
            clerkUserId: clerkUser.id,
            status: 'ACTIVE',
          },
        });
        if (linked.count !== 1) {
          throw new Error('User was linked by another synchronization attempt');
        }

        let metadataSynced = true;
        try {
          await clerk.users.updateUser(clerkUser.id, {
            publicMetadata: {
              roles: partner.roles.map((userRole) => userRole.role.name),
            },
          });
        } catch {
          metadataSynced = false;
        }

        results.push({
          userId: partner.id,
          partnerCode: partner.partnerProfile?.partnerCode ?? 'N/A',
          email: partner.email,
          status: metadataSynced ? 'success' : 'error',
          message: metadataSynced
            ? matchingClerkUsers.data[0]
              ? 'Existing Clerk account linked'
              : 'Clerk account created and linked'
            : 'Database linked, but Clerk role metadata could not be synchronized',
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
