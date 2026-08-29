import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Auth check — only instructors/admins can upload
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
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'video'; // 'video' | 'image'
    const folder = (formData.get('folder') as string) || 'lms/videos';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert File to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: type === 'video' ? 'video' : 'image',
          folder,
          // For videos: auto quality + format for best compression
          ...(type === 'video' && {
            eager: [{ quality: 'auto', fetch_format: 'auto' }],
            eager_async: true,
          }),
          // For images: auto optimize
          ...(type === 'image' && {
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          }),
        },
        (error, res) => {
          if (error) reject(error);
          else resolve(res);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      duration: result.duration, // seconds, for videos
      width: result.width,
      height: result.height,
    });
  } catch (err: any) {
    console.error('Cloudinary upload error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
