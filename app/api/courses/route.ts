import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getOrSetCache, invalidateCache } from '@/lib/redis';
import { requireRole, getVerifiedUser } from '@/lib/auth';

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

// GET /api/courses — list all published courses (public) or instructor's own courses
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mine = searchParams.get('mine'); 

  // If instructor requesting private "mine" courses, query DB directly (authenticated)
  if (mine === 'true') {
    const { user, response } = await requireRole(['instructor', 'admin'], request);
    if (response) return response;

    const db = getSupabaseClient(false);
    let query = db.from('courses').select('*').order('created_at', { ascending: false });
    
    // If instructor, only return their own courses; admin sees all
    if (user!.role === 'instructor') {
      query = query.eq('instructor', user!.email);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ courses: data }, { headers: { 'X-Cache': 'BYPASS' } });
  }

  // Public Course Catalog — Cache-Aside Pattern with Redis (TTL: 3600 seconds = 1 hour)
  try {
    const cacheKey = 'courses:published:catalog';
    const { data, source } = await getOrSetCache(cacheKey, 3600, async () => {
      const db = getSupabaseClient(false);
      const { data: courses, error } = await db
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return courses;
    });

    return NextResponse.json(
      { courses: data, source },
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

// POST /api/courses — create a new course (instructor only)
export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireRole(['instructor', 'admin'], request);
    if (response) return response;

    const body = await request.json();
    const {
      title, description, category, price, level,
      instructor, thumbnail_url, status, what_you_learn, requirements,
      instructor_name, instructor_title, instructor_bio, instructor_image, faqs,
      original_price,
    } = body;

    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    const instructorEmail = user!.role === 'admin' ? (instructor || user!.email) : user!.email;
    const displayName = instructor_name || instructor || user!.email.split('@')[0];

    const db = getSupabaseClient(true);
    const { data, error } = await db.from('courses').insert([{
      title: String(title).trim(),
      description: description || '',
      category: category || 'Development',
      price: parseFloat(price) || 0,
      level: level || 'Beginner',
      instructor: instructorEmail,
      thumbnail_url: thumbnail_url || '',
      status: status || 'draft',
      what_you_learn: Array.isArray(what_you_learn) ? what_you_learn : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      rating: 5.0,
      students: 0,
      original_price: original_price ?? null,
      instructor_name: displayName,
      instructor_title: instructor_title || '',
      instructor_bio: instructor_bio || '',
      instructor_image: instructor_image || '',
      faqs: Array.isArray(faqs) ? faqs : [],
    }]).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Cache Invalidation: Purge stale course catalog cache
    await invalidateCache('courses:published:catalog');

    return NextResponse.json({ success: true, course: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/courses — update course status or details
export async function PATCH(request: NextRequest) {
  try {
    const { user, response } = await requireRole(['instructor', 'admin'], request);
    if (response) return response;

    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'Course id required' }, { status: 400 });

    const db = getSupabaseClient(true);

    // Ownership check: instructors can only edit their own courses
    if (user!.role === 'instructor') {
      const { data: existing } = await db.from('courses').select('instructor').eq('id', id).single();
      if (!existing || existing.instructor !== user!.email) {
        return NextResponse.json({ error: 'Forbidden: you do not own this course' }, { status: 403 });
      }
    }

    const { data, error } = await db.from('courses').update(updates).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Cache Invalidation: Purge stale catalog and course caches
    await invalidateCache('courses:published:catalog', `course:${id}`);

    return NextResponse.json({ success: true, course: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/courses — delete a course
export async function DELETE(request: NextRequest) {
  try {
    const { user, response } = await requireRole(['instructor', 'admin'], request);
    if (response) return response;

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Course id required' }, { status: 400 });

    const db = getSupabaseClient(true);

    // Ownership check: instructors can only delete their own courses
    if (user!.role === 'instructor') {
      const { data: existing } = await db.from('courses').select('instructor').eq('id', id).single();
      if (!existing || existing.instructor !== user!.email) {
        return NextResponse.json({ error: 'Forbidden: you do not own this course' }, { status: 403 });
      }
    }

    const { error } = await db.from('courses').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Cache Invalidation: Purge stale catalog and course caches
    await invalidateCache('courses:published:catalog', `course:${id}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
