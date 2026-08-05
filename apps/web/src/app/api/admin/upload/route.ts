import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { uploadToCloudinary } from '@/lib/utils/cloudinary';

export async function POST(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'File is required' } },
        { status: 400 }
      );
    }

    const upload = await uploadToCloudinary(file);

    return Response.json({ data: upload, timestamp: new Date().toISOString() }, { status: 201 });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return Response.json(
      { error: { code: 'UPLOAD_FAILED', message: 'Failed to upload image' } },
      { status: 500 }
    );
  }
}
