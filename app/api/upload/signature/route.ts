import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Auth check — only instructors/admins can request upload signature
    const cookieStore = await cookies();
    const role = cookieStore.get('user_role')?.value;
    if (!role || (role !== 'instructor' && role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Configure cloudinary inside handler to avoid module-level env issues
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const body = await request.json();
    const { folder } = body;

    const timestamp = Math.round((new Date()).getTime() / 1000);

    // Generate signed signature for secure client upload
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET || ''
    );

    return NextResponse.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (err: any) {
    console.error('Signature generation error:', err);
    return NextResponse.json({ error: err.message || 'Signature failed' }, { status: 500 });
  }
}
