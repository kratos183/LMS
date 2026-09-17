import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { supabase } from '@/lib/supabase';
import { getVerifiedUser, requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Course Enrollment API
 * Strictly verifies whether the specific authenticated user has purchased/enrolled in a course.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const queryEmail = searchParams.get('email');

    if (!courseId) {
      return NextResponse.json({ error: 'courseId query parameter is required' }, { status: 400 });
    }

    const verifiedUser = await getVerifiedUser(request);

    // Unauthenticated guest user
    if (!verifiedUser) {
      return NextResponse.json({
        isEnrolled: false,
        email: null,
        role: null,
        courseId,
        message: 'No authenticated user session found',
      });
    }

    // Only admin can inspect another student's enrollment
    const email = (queryEmail && verifiedUser.role === 'admin')
      ? queryEmail.toLowerCase().trim()
      : verifiedUser.email;

    let isEnrolled = false;
    let enrollmentData: any = null;

    // 1. Check MongoDB Atlas course_enrollments collection
    try {
      const db = await getDatabase();
      if (db) {
        const doc = await db.collection('course_enrollments').findOne({
          studentEmail: email,
          courseId: String(courseId),
        });

        if (doc) {
          isEnrolled = true;
          enrollmentData = {
            id: doc._id,
            courseId: doc.courseId,
            studentEmail: doc.studentEmail,
            enrolledAt: doc.enrolledAt || doc.createdAt,
            invoiceId: doc.invoiceId,
            paymentId: doc.paymentId,
          };
        }
      }
    } catch (err: any) {
      console.warn('[MongoDB Enrollment Check Warn]:', err.message);
    }

    // 2. Fallback / Cross-check with PostgreSQL Supabase enrollments table
    if (!isEnrolled) {
      try {
        const { data, error } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_email', email)
          .eq('course_id', String(courseId))
          .maybeSingle();

        if (!error && data) {
          isEnrolled = true;
          enrollmentData = data;
        }
      } catch (err: any) {
        console.warn('[Supabase Enrollment Check Warn]:', err.message);
      }
    }

    return NextResponse.json({
      isEnrolled,
      email,
      role: verifiedUser.role,
      courseId,
      enrollment: enrollmentData,
    });
  } catch (error: any) {
    console.error('[Enrollments API GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Direct manual enrollment creation requires admin privileges
    const { user, response } = await requireRole('admin', request);
    if (response) return response;

    const body = await request.json();
    const { courseId, courseTitle, studentEmail, paymentId, invoiceId, amount } = body;

    const email = studentEmail ? String(studentEmail).toLowerCase().trim() : user!.email;

    if (!courseId || !email) {
      return NextResponse.json(
        { error: 'courseId and studentEmail are required' },
        { status: 400 }
      );
    }

    const enrollmentRecord = {
      courseId: String(courseId),
      courseTitle: courseTitle || 'Course Masterclass',
      studentEmail: email,
      paymentId: paymentId || `pay_admin_${Date.now()}`,
      invoiceId: invoiceId || `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: typeof amount === 'number' ? amount : 19999,
      status: 'active',
      enrolledAt: new Date().toISOString(),
      createdAt: new Date(),
    };

    // 1. Insert into MongoDB Atlas
    try {
      const db = await getDatabase();
      if (db) {
        await db.collection('course_enrollments').updateOne(
          { studentEmail: email, courseId: String(courseId) },
          { $set: enrollmentRecord },
          { upsert: true }
        );
      }
    } catch (err: any) {
      console.warn('[MongoDB Enrollment Insert Warn]:', err.message);
    }

    // 2. Insert into Supabase PostgreSQL enrollments table
    try {
      await supabase
        .from('enrollments')
        .upsert(
          {
            user_email: email,
            course_id: String(courseId),
            enrolled_at: new Date().toISOString(),
          },
          { onConflict: 'user_email,course_id' }
        );
    } catch (err: any) {
      console.warn('[Supabase Enrollment Insert Warn]:', err.message);
    }

    return NextResponse.json({
      success: true,
      isEnrolled: true,
      message: 'Course enrollment registered successfully.',
      enrollment: enrollmentRecord,
    });
  } catch (error: any) {
    console.error('[Enrollments API POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
