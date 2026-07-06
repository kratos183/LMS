import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Helper to choose the right client (anonymous vs admin service-role)
function getSupabaseClient(useAdmin = false) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = useAdmin && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

// GET /api/blogs — Fetch all blog posts
export async function GET() {
  const db = getSupabaseClient(false);
  const { data, error } = await db
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ blogs: data });
}

// POST /api/blogs — Create a new blog post (admin only)
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const role = cookieStore.get('user_role')?.value;
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await request.json();
    const { title, author, category, excerpt, image, content, tags } = body;

    if (!title || !author) {
      return NextResponse.json({ error: 'Title and Author are required.' }, { status: 400 });
    }

    const db = getSupabaseClient(true);
    const { data, error } = await db.from('blogs').insert([{
      title,
      author: author || 'Admin',
      category: category || 'General',
      excerpt: excerpt || '',
      image: image || '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), // e.g. "Jul 5, 2026"
      content: content || [],
      tags: tags || [],
      comments: [],
      comments_count: 0,
    }]).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, blog: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/blogs — Delete a blog post (admin only)
export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const role = cookieStore.get('user_role')?.value;
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Blog ID is required.' }, { status: 400 });

    const db = getSupabaseClient(true);
    const { error } = await db.from('blogs').delete().eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
