import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { createClerkClient } from '@clerk/backend';
import {
  importPartnersFromWorkbookSheets,
  type PartnerImportClerkAdapter,
} from '@blue-pineapple/iam';
import { readPartnerImportWorkbook } from '@/lib/partners/read-partner-workbook';

function getClerkAdapter(): PartnerImportClerkAdapter | null {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;

  const clerk = createClerkClient({ secretKey });

  return {
    async createUser(email, firstName, lastName) {
      try {
        const matches = await clerk.users.getUserList({ emailAddress: [email], limit: 10 });
        if (matches.data.length > 1) {
          throw new Error('Multiple Clerk accounts match this email');
        }
        if (matches.data[0]) {
          return matches.data[0].id;
        }
        const clerkUser = await clerk.users.createUser({
          emailAddress: [email],
          firstName,
          lastName,
          skipPasswordRequirement: true,
          skipLegalChecks: true,
        });
        return clerkUser.id;
      } catch {
        return null;
      }
    },
    async syncPartnerMetadata(clerkUserId) {
      try {
        await clerk.users.updateUser(clerkUserId, {
          publicMetadata: { roles: ['PARTNER'] },
        });
        return true;
      } catch {
        return false;
      }
    },
  };
}

export async function POST(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const approvedRowsRaw = formData.get('approvedRowNumbers');

    if (!file) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Excel file is required' } },
        { status: 400 },
      );
    }

    if (!approvedRowsRaw || typeof approvedRowsRaw !== 'string') {
      return Response.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Preview and row approval are required before importing partners',
          },
        },
        { status: 400 },
      );
    }

    let approvedRowNumbers: number[];
    try {
      const parsed = JSON.parse(approvedRowsRaw);
      if (!Array.isArray(parsed) || parsed.some((value) => typeof value !== 'number')) {
        throw new Error('Invalid approval payload');
      }
      approvedRowNumbers = parsed;
    } catch {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid approved row selection' } },
        { status: 400 },
      );
    }

    if (approvedRowNumbers.length === 0) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Select at least one row to import' } },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sheets = readPartnerImportWorkbook(buffer);

    if (sheets.length === 0) {
      return Response.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message:
              'Could not find a partner header row. Expected columns like "Unique code" and "NAME".',
          },
        },
        { status: 400 },
      );
    }

    const importResult = await importPartnersFromWorkbookSheets(sheets, {
      actorId: result.id,
      clerk: getClerkAdapter(),
      approvedRowNumbers,
    });

    return Response.json({
      data: importResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'No approved rows selected for import') {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: error.message } },
        { status: 400 },
      );
    }
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to process Excel file' } },
      { status: 500 },
    );
  }
}
