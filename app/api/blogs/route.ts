import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getOrSetCache, invalidateCache } from '@/lib/redis';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper to choose the right client (anonymous vs admin service-role)
function getSupabaseClient(useAdmin = false) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = useAdmin && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
  
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

// GET /api/blogs — Fetch all blog posts using Redis Cache-Aside Pattern (TTL: 3600 seconds)
export async function GET() {
  try {
    const cacheKey = 'blogs:all:feed';
    const { data, source } = await getOrSetCache(cacheKey, 3600, async () => {
      const db = getSupabaseClient(false);
      const { data: blogs, error } = await db
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return blogs;
    });

    return NextResponse.json(
      { blogs: data, source },
      {
        headers: {
          'X-Cache': source === 'cache' ? 'HIT' : 'MISS',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/blogs — Create a new blog post (admin only)
export async function POST(request: NextRequest) {
  try {
    const { response } = await requireRole('admin', request);
    if (response) return response;

    const body = await request.json();
    const { title, author, category, excerpt, image, content, tags } = body;

    if (!title || !author) {
      return NextResponse.json({ error: 'Title and Author are required.' }, { status: 400 });
    }

    const db = getSupabaseClient(true);
    const { data, error } = await db.from('blogs').insert([{
      title: String(title).trim(),
      author: String(author || 'Admin').trim(),
      category: String(category || 'General').trim(),
      excerpt: String(excerpt || '').trim(),
      image: String(image || '').trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      content: Array.isArray(content) ? content : [],
      tags: Array.isArray(tags) ? tags : [],
      comments: [],
      comments_count: 0,
    }]).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Cache Invalidation: Purge blog feed cache
    await invalidateCache('blogs:all:feed');

    return NextResponse.json({ success: true, blog: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/blogs — Delete a blog post (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { response } = await requireRole('admin', request);
    if (response) return response;

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Blog ID is required.' }, { status: 400 });

    const db = getSupabaseClient(true);
    const { error } = await db.from('blogs').delete().eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Cache Invalidation: Purge blog feed cache & individual post cache
    await invalidateCache('blogs:all:feed', `blog:${id}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
