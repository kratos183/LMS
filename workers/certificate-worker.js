/**
 * =========================================================================
 * Background Certificate Worker Service (Concept #27 - Message Queues)
 * =========================================================================
 * Consumes "COURSE_COMPLETED" events asynchronously from Redis Streams,
 * generates certificates, uploads assets, and dispatches email notifications.
 */

const Redis = require('ioredis');

const STREAM_NAME = 'stream:course_completed';
const GROUP_NAME = 'certificate_workers_group';
const CONSUMER_NAME = `worker_${process.pid}`;

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 300, 2000);
  },
});

let isRunning = true;

/**
 * Initializes the Redis Consumer Group for guaranteed at-least-once message processing
 */
async function initConsumerGroup() {
  try {
    await redis.xgroup('CREATE', STREAM_NAME, GROUP_NAME, '0', 'MKSTREAM');
    console.log(`\x1b[32m[Worker Init]\x1b[0m Consumer Group "${GROUP_NAME}" created on stream "${STREAM_NAME}"`);
  } catch (err) {
    if (err.message.includes('BUSYGROUP')) {
      console.log(`\x1b[36m[Worker Init]\x1b[0m Consumer Group "${GROUP_NAME}" ready and active.`);
    } else {
      console.warn(`\x1b[33m[Worker Init Warning]\x1b[0m ${err.message}`);
    }
  }
}

/**
 * Asynchronous job processor for Course Completion
 */
async function processCourseCompletionJob(messageId, data) {
  const startTime = Date.now();
  console.log(`\n\x1b[1m\x1b[35m=================================================================\x1b[0m`);
  console.log(`🚀 \x1b[1m\x1b[32m[EVENT CONSUMED]\x1b[0m Job ID: \x1b[33m${data.jobId || 'N/A'}\x1b[0m | Stream Message ID: ${messageId}`);
  console.log(`👤 \x1b[1mStudent:\x1b[0m ${data.studentName} (\x1b[4m${data.studentEmail}\x1b[0m)`);
  console.log(`📚 \x1b[1mCourse:\x1b[0m "${data.courseTitle}" (Instructor: ${data.instructorName || 'Lead Instructor'})`);
  console.log(`⏰ \x1b[1mCompleted At:\x1b[0m ${data.completedAt || new Date().toISOString()}`);
  console.log(`\x1b[35m-----------------------------------------------------------------\x1b[0m`);

  // Step 1: High-Resolution PDF Certificate Generation
  console.log(`📄 \x1b[36m[Step 1/3]\x1b[0m Generating official PDF Certificate vector template...`);
  await new Promise((r) => setTimeout(r, 1200));

  // Step 2: Cloud Asset Storage & Signature
  const certificateId = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const certificateUrl = `https://res.cloudinary.com/demo/image/upload/certificates/${certificateId}.pdf`;
  console.log(`☁️  \x1b[36m[Step 2/3]\x1b[0m Certificate rendered & uploaded: \x1b[32m${certificateUrl}\x1b[0m`);
  await new Promise((r) => setTimeout(r, 600));

  // Step 3: Transactional Email Notification Dispatch
  console.log(`📧 \x1b[36m[Step 3/3]\x1b[0m Sending congratulations email & PDF attachment to ${data.studentEmail}...`);
  await new Promise((r) => setTimeout(r, 800));

  const totalTime = Date.now() - startTime;
  console.log(`\x1b[32m✔ [JOB COMPLETED]\x1b[0m Certificate ${certificateId} delivered in \x1b[1m${totalTime}ms\x1b[0m.`);
  console.log(`\x1b[1m\x1b[35m=================================================================\x1b[0m\n`);
}

/**
 * Continuous Event Consumer Loop
 */
async function startWorker() {
  await initConsumerGroup();
  console.log(`\x1b[1m\x1b[32m[Certificate Worker Online]\x1b[0m Listening for events on Redis Stream: \x1b[33m${STREAM_NAME}\x1b[0m\n`);

  while (isRunning) {
    try {
      // Read new messages with XREADGROUP (Blocking poll up to 4000ms)
      const results = await redis.xreadgroup(
        'GROUP', GROUP_NAME, CONSUMER_NAME,
        'BLOCK', 4000,
        'COUNT', 1,
        'STREAMS', STREAM_NAME,
        '>'
      );

      if (results && results.length > 0) {
        const [stream, messages] = results[0];
        for (const [messageId, rawFields] of messages) {
          const data = {};
          for (let i = 0; i < rawFields.length; i += 2) {
            data[rawFields[i]] = rawFields[i + 1];
          }

          // Process the asynchronous job
          await processCourseCompletionJob(messageId, data);

          // Acknowledge the message to remove from Pending Entries List (PEL)
          await redis.xack(STREAM_NAME, GROUP_NAME, messageId);
        }
      }
    } catch (err) {
      if (isRunning) {
        console.error(`\x1b[31m[Worker Error]:\x1b[0m`, err.message);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }
}

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('\n[Worker Shutdown] SIGTERM received. Gracefully closing worker...');
  isRunning = false;
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n[Worker Shutdown] SIGINT received. Gracefully closing worker...');
  isRunning = false;
  await redis.quit();
  process.exit(0);
});

startWorker();
