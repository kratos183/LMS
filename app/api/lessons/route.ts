import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';

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

// GET /api/lessons?courseId=xxx — get all lessons for a course
export async function GET(request: NextRequest) {
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
export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireRole(['instructor', 'admin'], request);
    if (response) return response;

    const body = await request.json();
    const { course_id, title, description, video_url, duration, sort_order, is_free } = body;

    if (!course_id || !title) {
      return NextResponse.json({ error: 'course_id and title are required' }, { status: 400 });
    }

    const db = getSupabaseClient(true);

    // Ownership check: If instructor, verify they own the course
    if (user!.role === 'instructor') {
      const { data: course } = await db.from('courses').select('instructor').eq('id', course_id).single();
      if (!course || course.instructor !== user!.email) {
        return NextResponse.json({ error: 'Forbidden: you do not own this course' }, { status: 403 });
      }
    }

    const { data, error } = await db.from('lessons').insert([{
      course_id: String(course_id),
      title: String(title).trim(),
      description: description ? String(description).trim() : '',
      video_url: video_url ? String(video_url).trim() : '',
      duration: duration || '0:00',
      sort_order: typeof sort_order === 'number' ? sort_order : 0,
      is_free: Boolean(is_free),
    }]).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, lesson: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/lessons — delete a lesson
export async function DELETE(request: NextRequest) {
  try {
    const { user, response } = await requireRole(['instructor', 'admin'], request);
    if (response) return response;

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 });

    const db = getSupabaseClient(true);

    // Ownership check: If instructor, verify lesson belongs to a course owned by them
    if (user!.role === 'instructor') {
      const { data: lesson } = await db.from('lessons').select('course_id').eq('id', id).single();
      if (lesson) {
        const { data: course } = await db.from('courses').select('instructor').eq('id', lesson.course_id).single();
        if (!course || course.instructor !== user!.email) {
          return NextResponse.json({ error: 'Forbidden: you do not own this lesson' }, { status: 403 });
        }
      }
    }

    const { error } = await db.from('lessons').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
