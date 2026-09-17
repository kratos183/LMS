import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Auth check — only verified instructors/admins can upload
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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'video'; // 'video' | 'image'
    const folder = (formData.get('folder') as string) || 'lms/videos';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Max 100MB for direct multipart upload to prevent memory exhaustion
    const MAX_DIRECT_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_DIRECT_SIZE) {
      return NextResponse.json({ error: 'File exceeds maximum direct upload size limit (100MB).' }, { status: 413 });
    }

    // Convert File to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: type === 'video' ? 'video' : 'image',
          folder: folder.replace(/[^a-zA-Z0-9_\-/]/g, ''),
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
