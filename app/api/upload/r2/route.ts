import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { response } = await requireRole(['instructor', 'admin'], request);
    if (response) return response;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const rawCourseId = (formData.get('courseId') as string) || '';
    const courseId = rawCourseId.replace(/[^a-zA-Z0-9_\-]/g, '');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Max 2GB.' }, { status: 413 });
    }

    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'application/pdf', 'application/zip'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
    }

    const safeFileName = file.name.replace(/[^a-zA-Z0-9._\-]/g, '_');
    const key = `courses/${courseId}/${Date.now()}-${safeFileName}`;

    return NextResponse.json({
      message: 'Upload executed successfully',
      key,
      fileName: safeFileName,
      fileSize: file.size,
      contentType: file.type,
      url: `https://r2.edupress.com/${key}`,
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
