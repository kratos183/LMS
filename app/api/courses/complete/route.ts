import { NextRequest, NextResponse } from 'next/server';
import { publishCourseCompletedEvent } from '@/lib/queue';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const startTime = performance.now();

  try {
    const { user, response } = await requireAuth(req);
    if (response) return response;

    const body = await req.json();
    const { courseId, courseTitle, studentEmail, studentName, instructorName } = body;

    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
    }

    // Bind studentEmail to verified user session unless admin
    const email = (studentEmail && user!.role === 'admin') ? String(studentEmail).toLowerCase().trim() : user!.email;
    const name = studentName ? String(studentName).trim().slice(0, 80) : email.split('@')[0];

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const completedAt = new Date().toISOString();

    // Publish event to Queue (< 5ms)
    const messageId = await publishCourseCompletedEvent({
      jobId,
      studentEmail: email,
      studentName: name,
      courseId: String(courseId),
      courseTitle: courseTitle ? String(courseTitle).trim() : 'Full Stack Web Development',
      instructorName: instructorName ? String(instructorName).trim() : 'Instructor',
      completedAt,
    });

    const latencyMs = Math.round(performance.now() - startTime);

    return NextResponse.json(
      {
        success: true,
        message: 'Course completion event published. Certificate is being generated asynchronously.',
        jobId,
        messageId,
        status: 'QUEUED',
        latencyMs,
      },
      {
        headers: {
          'X-Response-Time': `${latencyMs}ms`,
          'X-Execution-Mode': 'Asynchronous-Queue',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
