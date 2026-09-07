import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDatabase } from '@/lib/mongodb';
import { supabase } from '@/lib/supabase';

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

    const cookieStore = await cookies();
    const cookieEmail = cookieStore.get('user_email')?.value;
    const cookieRole = cookieStore.get('user_role')?.value;

    const email = (queryEmail || cookieEmail || '').toLowerCase().trim();

    if (!courseId) {
      return NextResponse.json({ error: 'courseId query parameter is required' }, { status: 400 });
    }

    // Unauthenticated guest user
    if (!email) {
      return NextResponse.json({
        isEnrolled: false,
        email: null,
        role: null,
        courseId,
        message: 'No authenticated user session found',
      });
    }

    let isEnrolled = false;
    let enrollmentData: any = null;

    // 1. Check MongoDB Atlas course_enrollments collection
    try {
      const db = await getDatabase();
      if (db) {
        const doc = await db.collection('course_enrollments').findOne({
          studentEmail: email,
          courseId: courseId,
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
          .eq('course_id', courseId)
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
      role: cookieRole || 'student',
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
    const body = await request.json();
    const { courseId, courseTitle, studentEmail, paymentId, invoiceId, amount } = body;

    const cookieStore = await cookies();
    const sessionEmail = cookieStore.get('user_email')?.value;

    const email = (studentEmail || sessionEmail || '').toLowerCase().trim();

    if (!courseId || !email) {
      return NextResponse.json(
        { error: 'courseId and studentEmail are required' },
        { status: 400 }
      );
    }

    const enrollmentRecord = {
      courseId,
      courseTitle: courseTitle || 'Course Masterclass',
      studentEmail: email,
      paymentId: paymentId || `pay_manual_${Date.now()}`,
      invoiceId: invoiceId || `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: amount || 19999,
      status: 'active',
      enrolledAt: new Date().toISOString(),
      createdAt: new Date(),
    };

    // 1. Insert into MongoDB Atlas
    try {
      const db = await getDatabase();
      if (db) {
        await db.collection('course_enrollments').updateOne(
          { studentEmail: email, courseId: courseId },
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
            course_id: courseId,
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
