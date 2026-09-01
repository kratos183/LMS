import { getRedisClient } from './redis';

export interface CourseCompletedPayload {
  jobId: string;
  studentEmail: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  completedAt: string;
}

export const COURSE_COMPLETED_STREAM = 'stream:course_completed';

/**
 * Publishes a COURSE_COMPLETED event to the message queue (Redis Streams).
 * Execution completes in under 5ms.
 */
export async function publishCourseCompletedEvent(payload: CourseCompletedPayload): Promise<string | null> {
  const redis = getRedisClient();
  if (!redis) {
    console.warn('[Queue] Redis client not available, event dropped');
    return null;
  }

  try {
    const messageId = await redis.xadd(
      COURSE_COMPLETED_STREAM,
      '*',
      'jobId', payload.jobId,
      'studentEmail', payload.studentEmail,
      'studentName', payload.studentName,
      'courseId', payload.courseId,
      'courseTitle', payload.courseTitle,
      'instructorName', payload.instructorName,
      'completedAt', payload.completedAt
    );

    console.log(`\x1b[32m[Queue PRODUCER]\x1b[0m Published "COURSE_COMPLETED" Event [Message ID: ${messageId}] for student: ${payload.studentEmail}`);
    return messageId;
  } catch (error: any) {
    console.error('[Queue PRODUCER Error] Failed to publish event:', error.message);
    return null;
  }
}
