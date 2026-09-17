import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawPublicId = searchParams.get('publicId');

  if (!rawPublicId) {
    return NextResponse.json({ error: 'publicId is required' }, { status: 400 });
  }

  // Sanitize publicId against path traversal
  const publicId = rawPublicId.replace(/(\.\.[\/\\])+/g, '').replace(/[^a-zA-Z0-9_\-./]/g, '');
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'demo';
  const downloadURL = `https://res.cloudinary.com/${cloudName}/image/upload/${encodeURIComponent(publicId).replace(/%2F/g, '/')}`;

  return NextResponse.json({
    success: true,
    downloadURL,
    publicId,
  });
}
