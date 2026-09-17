import { NextRequest, NextResponse } from 'next/server';
import { getCloudinaryUploadURL } from '@/lib/cloudinary';
import { requireRole } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { response } = await requireRole(['instructor', 'admin'], req);
    if (response) return response;

    const body = await req.json();
    const folder = (body?.folder ? String(body.folder) : 'lms/uploads').replace(/[^a-zA-Z0-9_\-/]/g, '');
    const uploadURL = getCloudinaryUploadURL(folder);

    return NextResponse.json({
      success: true,
      uploadURL,
      folder,
      resource_type: 'auto',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate presigned URL' }, { status: 500 });
  }
}
