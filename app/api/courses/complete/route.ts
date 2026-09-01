import { NextRequest, NextResponse } from 'next/server';
import { publishCourseCompletedEvent } from '@/lib/queue';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const startTime = performance.now();

  try {
    const body = await req.json();
    const { courseId, courseTitle, studentEmail, studentName, instructorName } = body;

    if (!courseId || !studentEmail) {
      return NextResponse.json({ error: 'courseId and studentEmail are required' }, { status: 400 });
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const completedAt = new Date().toISOString();

    // Publish event to Queue (< 5ms)
    const messageId = await publishCourseCompletedEvent({
      jobId,
      studentEmail,
      studentName: studentName || 'Ethan Hunt',
      courseId,
      courseTitle: courseTitle || 'Full Stack Web Development',
      instructorName: instructorName || 'John Doe',
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
