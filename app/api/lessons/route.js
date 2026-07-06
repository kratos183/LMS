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

// GET /api/lessons?courseId=xxx — get all lessons for a course
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');
  if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 });

  const db = getSupabaseClient(false);
  const { data, error } = await db
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lessons: data });
}

// POST /api/lessons — add a lesson to a course
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const role = cookieStore.get('user_role')?.value;
    if (role !== 'instructor' && role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { course_id, title, description, video_url, duration, sort_order, is_free } = body;

    if (!course_id || !title) {
      return NextResponse.json({ error: 'course_id and title are required' }, { status: 400 });
    }

    const db = getSupabaseClient(true);
    const { data, error } = await db.from('lessons').insert([{
      course_id,
      title,
      description: description || '',
      video_url: video_url || '',
      duration: duration || '0:00',
      sort_order: sort_order || 0,
      is_free: is_free || false,
    }]).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, lesson: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/lessons — delete a lesson
export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const role = cookieStore.get('user_role')?.value;
    if (role !== 'instructor' && role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    const db = getSupabaseClient(true);
    const { error } = await db.from('lessons').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
