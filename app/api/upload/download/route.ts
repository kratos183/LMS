import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const publicId = searchParams.get('publicId');

  if (!publicId) {
    return NextResponse.json({ error: 'publicId is required' }, { status: 400 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const downloadURL = `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;

  return NextResponse.json({
    success: true,
    downloadURL,
    publicId,
  });
}
