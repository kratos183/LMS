const Redis = require('ioredis');

const STREAM_NAME = 'stream:course_completed';
const GROUP_NAME = 'certificate_workers_group';
const CONSUMER_NAME = `worker_${process.pid}`;

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

async function initConsumerGroup() {
  try {
    await redis.xgroup('CREATE', STREAM_NAME, GROUP_NAME, '0', 'MKSTREAM');
    console.log(`[Worker] Created Consumer Group "${GROUP_NAME}" on stream "${STREAM_NAME}"`);
  } catch (err) {
    if (!err.message.includes('BUSYGROUP')) {
      console.warn('[Worker] Consumer group notice:', err.message);
    }
  }
}

async function processJob(messageId, data) {
  console.log(`\n======================================================`);
  console.log(`🚀 [Worker CONSUMER] Processing Job: ${data.jobId}`);
  console.log(`👤 Student: ${data.studentName} (${data.studentEmail})`);
  console.log(`📚 Course: "${data.courseTitle}"`);
  console.log(`⏰ Completed At: ${data.completedAt}`);
  console.log(`------------------------------------------------------`);

  // Step 1: PDF Generation simulation
  console.log(`📄 [Worker Step 1/3] Generating High-Resolution PDF Certificate...`);
  await new Promise((r) => setTimeout(r, 1200));

  // Step 2: Cloud Storage Upload simulation
  const certificateUrl = `https://res.cloudinary.com/demo/image/upload/certificates/cert_${data.jobId}.pdf`;
  console.log(`☁️ [Worker Step 2/3] Uploaded to Cloud Storage: ${certificateUrl}`);
  await new Promise((r) => setTimeout(r, 600));

  // Step 3: Notification Email Delivery simulation
  console.log(`📧 [Worker Step 3/3] Sending Congratulations Email to ${data.studentEmail}...`);
  await new Promise((r) => setTimeout(r, 800));

  console.log(`✅ [Worker SUCCESS] Job ${data.jobId} fully completed! Certificate ready.`);
  console.log(`======================================================\n`);
}

async function startWorker() {
  await initConsumerGroup();
  console.log(`[Worker] Listening for "COURSE_COMPLETED" events on ${STREAM_NAME}...`);

  while (true) {
    try {
      const results = await redis.xreadgroup(
        'GROUP', GROUP_NAME, CONSUMER_NAME,
        'BLOCK', 5000,
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

          await processJob(messageId, data);
          await redis.xack(STREAM_NAME, GROUP_NAME, messageId);
        }
      }
    } catch (err) {
      console.error('[Worker Error]:', err.message);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

startWorker();
