import { NextRequest, NextResponse } from 'next/server';
import { getCloudinaryUploadURL } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { filename, contentType } = body;

    const folder = 'lms/uploads';
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
