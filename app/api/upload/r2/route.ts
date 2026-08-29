import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const courseId = (formData.get('courseId') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const MAX_SIZE = 2 * 1024 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Max 2GB.' }, { status: 413 });
    }

    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'application/pdf', 'application/zip'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
    }

    const key = `courses/${courseId}/${Date.now()}-${file.name}`;

    return NextResponse.json({
      message: 'Upload placeholder executed successfully',
      key,
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
      url: `https://r2-placeholder.edupress.com/${key}`,
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
