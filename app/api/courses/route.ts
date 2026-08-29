import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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

// GET /api/courses — list all published courses (public) or instructor's own courses
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mine = searchParams.get('mine'); 

  // Read operations use the standard public client
  const db = getSupabaseClient(false);

  let query = db.from('courses').select('*').order('created_at', { ascending: false });

  if (mine === 'true') {
    const cookieStore = await cookies();
    const role = cookieStore.get('user_role')?.value;
    if (role !== 'instructor' && role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else {
    query = query.eq('status', 'published');
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ courses: data });
}

// POST /api/courses — create a new course (instructor only)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const role = cookieStore.get('user_role')?.value;
    if (role !== 'instructor' && role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title, description, category, price, level,
      instructor, thumbnail_url, status, what_you_learn, requirements,
      instructor_name, instructor_title, instructor_bio, instructor_image, faqs,
      original_price,
    } = body;

    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    const db = getSupabaseClient(true);
    const { data, error } = await db.from('courses').insert([{
      title,
      description: description || '',
      category: category || 'Development',
      price: parseFloat(price) || 0,
      level: level || 'Beginner',
      instructor: instructor || instructor_name || 'Instructor',
      thumbnail_url: thumbnail_url || '',
      status: status || 'draft',
      what_you_learn: what_you_learn || [],
      requirements: requirements || [],
      rating: 5.0,
      students: 0,
      original_price: original_price ?? null,
      instructor_name: instructor_name || instructor || 'Instructor',
      instructor_title: instructor_title || '',
      instructor_bio: instructor_bio || '',
      instructor_image: instructor_image || '',
      faqs: faqs || [],
    }]).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, course: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/courses — update course status or details
export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const role = cookieStore.get('user_role')?.value;
    if (role !== 'instructor' && role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'Course id required' }, { status: 400 });

    const db = getSupabaseClient(true);
    const { data, error } = await db.from('courses').update(updates).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, course: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/courses — delete a course
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const role = cookieStore.get('user_role')?.value;
    if (role !== 'instructor' && role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    const db = getSupabaseClient(true);
    const { error } = await db.from('courses').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
