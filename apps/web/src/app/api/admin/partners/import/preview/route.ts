import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { previewPartnersFromWorkbookSheets } from '@blue-pineapple/iam';
import { readPartnerImportWorkbook } from '@/lib/partners/read-partner-workbook';

export async function POST(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Excel file is required' } },
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

    const preview = await previewPartnersFromWorkbookSheets(sheets);

    return Response.json({
      data: preview,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to preview Excel file' } },
      { status: 500 },
    );
  }
}
