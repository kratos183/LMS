import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Auth check — only verified instructors/admins can request upload signature
    const { response } = await requireRole(['instructor', 'admin'], request);
    if (response) return response;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Cloudinary credentials not configured' }, { status: 500 });
    }

    // Configure cloudinary inside handler
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    const body = await request.json();
    const folder = (body?.folder ? String(body.folder) : 'lms/uploads').replace(/[^a-zA-Z0-9_\-/]/g, '');

    const timestamp = Math.round((new Date()).getTime() / 1000);

    // Generate signed signature for secure client upload
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      apiSecret
    );

    return NextResponse.json({
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    });
  } catch (err: any) {
    console.error('Signature generation error:', err);
    return NextResponse.json({ error: err.message || 'Signature failed' }, { status: 500 });
  }
}
