import Redis from 'ioredis';
import { COURSE_COMPLETED_STREAM, CourseCompletedPayload } from '../lib/queue';

const STREAM_NAME = COURSE_COMPLETED_STREAM || 'stream:course_completed';
const GROUP_NAME = 'certificate_workers_group';
const CONSUMER_NAME = `worker_${process.pid}`;

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

/**
 * Initializes the Redis Consumer Group for guaranteed message delivery
 */
async function initConsumerGroup(): Promise<void> {
  try {
    await redis.xgroup('CREATE', STREAM_NAME, GROUP_NAME, '0', 'MKSTREAM');
    console.log(`\x1b[32m[Worker]\x1b[0m Created Consumer Group "${GROUP_NAME}" on stream "${STREAM_NAME}"`);
  } catch (err: any) {
    if (!err.message.includes('BUSYGROUP')) {
      console.warn('[Worker] Consumer group notice:', err.message);
    }
  }
}

/**
 * Processes a single Course Completion job asynchronously
 */
async function processJob(messageId: string, data: CourseCompletedPayload): Promise<void> {
  const startTime = Date.now();
  console.log(`\n======================================================`);
  console.log(`🚀 \x1b[35m[Worker CONSUMER]\x1b[0m Processing Job: \x1b[33m${data.jobId}\x1b[0m (Stream ID: ${messageId})`);
  console.log(`👤 Student: \x1b[1m${data.studentName}\x1b[0m (${data.studentEmail})`);
  console.log(`📚 Course: "${data.courseTitle}" (Instructor: ${data.instructorName})`);
  console.log(`⏰ Completed At: ${data.completedAt}`);
  console.log(`------------------------------------------------------`);

  // Step 1: PDF Generation simulation (e.g. Canvas / PDFKit / Puppeteer)
  console.log(`📄 \x1b[36m[Worker Step 1/3]\x1b[0m Generating High-Resolution PDF Certificate...`);
  await new Promise((r) => setTimeout(r, 1200));

  // Step 2: Cloud Storage Upload simulation
  const certificateUrl = `https://res.cloudinary.com/demo/image/upload/certificates/cert_${data.jobId}.pdf`;
  console.log(`☁️ \x1b[36m[Worker Step 2/3]\x1b[0m Uploaded to Cloud Storage: \x1b[32m${certificateUrl}\x1b[0m`);
  await new Promise((r) => setTimeout(r, 600));

  // Step 3: Notification Email Delivery simulation
  console.log(`📧 \x1b[36m[Worker Step 3/3]\x1b[0m Sending Congratulations Email to ${data.studentEmail}...`);
  await new Promise((r) => setTimeout(r, 800));

  const totalDuration = Date.now() - startTime;
  console.log(`✅ \x1b[32m[Worker SUCCESS]\x1b[0m Job ${data.jobId} completed in \x1b[1m${totalDuration}ms\x1b[0m! Certificate ready.`);
  console.log(`======================================================\n`);
}

/**
 * Continuous Event Consumer Loop
 */
async function startWorker(): Promise<void> {
  await initConsumerGroup();
  console.log(`\x1b[32m[Certificate Worker Online]\x1b[0m Listening for "COURSE_COMPLETED" events on \x1b[33m${STREAM_NAME}\x1b[0m...`);

  while (true) {
    try {
      // Read new messages using Redis XREADGROUP
      const results = (await (redis as any).xreadgroup(
        'GROUP',
        GROUP_NAME,
        CONSUMER_NAME,
        'BLOCK',
        5000,
        'COUNT',
        1,
        'STREAMS',
        STREAM_NAME,
        '>'
      )) as [string, [string, string[]][]][] | null;

      if (results && results.length > 0) {
        const [, messages] = results[0];
        for (const [messageId, rawFields] of messages) {
          const rawData: Record<string, string> = {};
          for (let i = 0; i < rawFields.length; i += 2) {
            rawData[rawFields[i]] = rawFields[i + 1];
          }

          const payload: CourseCompletedPayload = {
            jobId: rawData.jobId || `job_${Date.now()}`,
            studentEmail: rawData.studentEmail || 'student@example.com',
            studentName: rawData.studentName || 'Student',
            courseId: rawData.courseId || 'c_default',
            courseTitle: rawData.courseTitle || 'Course Title',
            instructorName: rawData.instructorName || 'Instructor',
            completedAt: rawData.completedAt || new Date().toISOString(),
          };

          // Process job and acknowledge message
          await processJob(messageId, payload);
          await redis.xack(STREAM_NAME, GROUP_NAME, messageId);
        }
      }
    } catch (err: any) {
      console.error('[Worker Error]:', err.message);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('\n[Worker] Gracefully shutting down...');
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n[Worker] Gracefully shutting down...');
  await redis.quit();
  process.exit(0);
});

startWorker();
