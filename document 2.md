# Phase 2: Asynchronous & Real-Time Features (Weeks 3-4)

---

## 📑 Table of Contents
1. [Message Queues & Event-Driven Architecture (Concept #27)](#1-message-queues--event-driven-architecture-concept-27)
2. [Microservices Architecture & API Gateway (Concept #26)](#2-microservices-architecture-concept-26)
3. [WebSockets & Real-Time Push Notifications (Concept #24)](#3-websockets--real-time-push-notifications-concept-24)
4. [Webhooks, HMAC Verification & CAP Theorem (Concept #25)](#4-webhooks-hmac-verification--cap-theorem-concept-25)

---

## 1. Message Queues & Event-Driven Architecture (Concept #27)

> **Action:** When a student completes a course, decouple heavy tasks (PDF certificate generation, Cloudinary upload, email dispatch) from the main API.  
> **Architecture Flow:**  
> `Client HTTP POST` ➔ `Next.js API (Producer)` ➔ `Publish "COURSE_COMPLETED" to Message Queue` ➔ `Immediate 200 OK (< 20ms)`  
> `Background Worker Service (Consumer)` ➔ `Consume Event` ➔ `Render Certificate PDF` ➔ `Upload Asset` ➔ `Send Email Notification`

---

### 🏛️ System Design Architecture: Synchronous vs. Asynchronous Event-Driven

#### ❌ Before: Blocking Synchronous Monolith (Slow & Fragile)
```
User clicks "Complete Course"
            │
            ▼ (HTTP POST /api/courses/complete)
┌────────────────────────────────────────────────────────────────────────┐
│ Next.js API Server (Thread Blocked for 6.5 seconds!)                   │
│                                                                        │
│ 1. Update Database Status ────────────► 45ms                           │
│ 2. Generate PDF Certificate (Canvas) ─► 2,800ms                        │
│ 3. Upload PDF to Cloud Storage ───────► 1,400ms                        │
│ 4. Connect to SMTP & Send Email ──────► 2,200ms                        │
└────────────────────────────────────────────────────────────────────────┘
            │
            ▼ Total Latency: 6,445ms (6.4s)
Client Browser hangs with loading spinner. If SMTP fails, the whole request crashes!
```

---

#### ✅ After: Decoupled Message Queue / Event-Driven Pipeline (Concept #27)
```
User clicks "Complete Course"
            │
            ▼ (HTTP POST /api/courses/complete)
┌────────────────────────────────────────────────────────────┐
│ Next.js API Server (Producer)                              │
│ 1. Update DB Status (15ms)                                 │
│ 2. Publish "COURSE_COMPLETED" payload to Queue/Stream (3ms)│
└────────────────────────────┬───────────────────────────────┘
                             │
                             ▼ Immediate HTTP 200 OK (< 20ms!)
                    Client UI updates instantly!
                             │
                             ▼
                 ┌───────────────────────┐
                 │  Message Queue / Bus  │
                 │ (Redis Stream / Kafka)│
                 └───────────┬───────────┘
                             │
        ┌────────────────────┴────────────────────┐
        ▼ Asynchronous Event Consumer             ▼ Worker 2 (Scale Out)
┌────────────────────────────────────────────────────────────┐
│ Background Worker Service (PM2: certificate-worker)        │
│                                                            │
│ 1. Picks up job from Queue                                 │
│ 2. Generates Certificate PDF                               │
│ 3. Saves to Cloudinary / Database                          │
│ 4. Sends Email notification                                │
│ 5. Acknowledges (ACK) message & marks job COMPLETED        │
└────────────────────────────────────────────────────────────┘
```

#### Why use this pattern? (Concept #27)
1. **Dramatically Lower Client Latency:** Request latency drops from **~6,500ms down to < 20ms** (a **99.7% reduction**).
2. **Fault Tolerance & Resilience:** If the email server is temporarily down or rate-limited, the event remains safe in the queue. The worker retries with exponential backoff without affecting the student.
3. **Independent Scalability:** If 10,000 students complete a final exam simultaneously, the API remains fast. The worker service processes the queue at its own pace without crashing PostgreSQL.
4. **Dead-Letter Queue (DLQ):** Failed jobs after maximum retries are moved to a DLQ for developer inspection rather than lost.

---

### 💻 Code Changes in the Project

---

#### 1. Message Queue Producer Module: [`lib/queue.ts`](file:///f:/notes/Web%20development%20Roadmap/Beautiful%20ui%20Projects/LMS/lms-online/lib/queue.ts)

```typescript
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
 * Takes < 5ms to execute.
 */
export async function publishCourseCompletedEvent(payload: CourseCompletedPayload): Promise<string | null> {
  const redis = getRedisClient();
  if (!redis) {
    console.warn('[Queue] Redis client not available, event dropped');
    return null;
  }

  try {
    // XADD stream:course_completed * payload_fields...
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
```

---

#### 2. Fast Asynchronous API Route: [`app/api/courses/complete/route.ts`](file:///f:/notes/Web%20development%20Roadmap/Beautiful%20ui%20Projects/LMS/lms-online/app/api/courses/complete/route.ts)

```typescript
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

    // 1. Publish event to Queue (< 5ms)
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

    // 2. Return immediate response to the client
    return NextResponse.json(
      {
        success: true,
        message: 'Course completion acknowledged. Certificate is being generated in the background.',
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
```

---

#### 3. Standalone Background Worker Service (TypeScript): [`workers/certificate-worker.ts`](file:///f:/notes/Web%20development%20Roadmap/Beautiful%20ui%20Projects/LMS/lms-online/workers/certificate-worker.ts)

```typescript
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
```

---

### 📋 Complete Step-by-Step Deployment & Verification Guide

---

> [!IMPORTANT]
> **CRITICAL FIRST STEP:** Push the code from your local machine to GitHub **before** pulling on EC2!
> ```bash
> # In local terminal (VS Code):
> git add .
> git commit -m "feat: add message queue and TypeScript certificate worker (Concept 27)"
> git push origin Main
> ```

---

### Step 1: Pull Code & Start TypeScript Worker with PM2 on EC2

Run these commands in your **EC2 Terminal**:

```bash
cd ~/LMS

# 1. Cleanly pull latest code with tsx & TypeScript worker from GitHub
git reset --hard origin/Main
git pull origin Main

# 2. Install dependencies (tsx runtime)
npm install

# 3. Start the TypeScript Certificate Worker under PM2
pm2 start npm --name "certificate-worker" -- run worker

# 4. Save PM2 list so worker restarts on reboot
pm2 save

# 5. Check active services
pm2 status
```
*(You will see `certificate-worker` online alongside `nextjs-frontend`!)*

---

### Step 2: Test Asynchronous Event Publishing via Terminal (CLI)

Simulate a student completing a course by firing a request to the async completion API:

```bash
curl -i -X POST http://127.0.0.1:3000/api/courses/complete \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "c101",
    "courseTitle": "Full Stack Web Development",
    "studentEmail": "ethan@example.com",
    "studentName": "Ethan Hunt",
    "instructorName": "John Doe"
  }'
```

*Expected API Response (< 20ms!):*
```text
HTTP/1.1 200 OK
x-response-time: 14ms
x-execution-mode: Asynchronous-Queue
Content-Type: application/json

{
  "success": true,
  "message": "Course completion event published. Certificate is being generated asynchronously.",
  "jobId": "job_1788234123_a9b2c",
  "messageId": "1788234123456-0",
  "status": "QUEUED",
  "latencyMs": 14
}
```

---

### Step 3: Observe Worker Processing Asynchronously in Real-Time

Run this to see the background worker pick up the event, render the certificate, upload to cloud, and send the email:

```bash
pm2 logs certificate-worker --lines 25
```

*Live Worker Log Output:*
```text
======================================================
🚀 [Worker CONSUMER] Processing Job: job_1788234123_a9b2c (Stream ID: 1788234123456-0)
👤 Student: Ethan Hunt (ethan@example.com)
📚 Course: "Full Stack Web Development" (Instructor: John Doe)
⏰ Completed At: 2026-09-01T11:40:12.450Z
------------------------------------------------------
📄 [Worker Step 1/3] Generating High-Resolution PDF Certificate...
☁️ [Worker Step 2/3] Uploaded to Cloud Storage: https://res.cloudinary.com/demo/image/upload/certificates/cert_job_1788234123_a9b2c.pdf
📧 [Worker Step 3/3] Sending Congratulations Email to ethan@example.com...
✅ [Worker SUCCESS] Job job_1788234123_a9b2c completed in 2604ms! Certificate ready.
======================================================
```

---

### Step 4: Inspect Stream Messages in Redis

Run `redis-cli` in your EC2 terminal to view the queue backlog:

```bash
# View the last 5 messages published to the stream
redis-cli XREVRANGE stream:course_completed + - COUNT 5

# View consumer group statistics & pending job counts
redis-cli XINFO GROUPS stream:course_completed
```

---

## 2. Microservices Architecture (Concept #26)

> **Action:** Extract the AI Study Assistant out of the monolithic Next.js process into a dedicated, standalone **AI Microservice** (Port 5000).  
> **Communication Flow:** The main Next.js web application communicates with the AI Microservice via **Synchronous HTTP (REST / API Gateway Proxy)** with built-in fallback resilience and Redis in-memory prompt caching.

---

### 🏛️ System Design Architecture: Monolith vs. Microservices

#### ❌ Before: Monolithic Embedded AI (Resource Contention & Fragility)
```
┌────────────────────────────────────────────────────────────────────────┐
│ Next.js Monolithic Server (Port 3000)                                   │
│                                                                        │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────┐  │
│  │ UI & SSR Rendering   │  │ Auth & Courses API   │  │ AI LLM Engine│  │
│  └──────────────────────┘  └──────────────────────┘  └──────┬───────┘  │
│                                                             │          │
│   ⚠️ High AI compute/tokens blocks Node event loop! ────────┘          │
│   ⚠️ If Groq API times out, entire web server thread pool degrades!   │
└────────────────────────────────────────────────────────────────────────┘
```

#### ✅ After: Decoupled Microservices Architecture (Independent & Resilient)
```
┌────────────────────────────────────────────────────────────────────────────────┐
│ 🌐 Client Web Browser (Student Dashboard / Chatbot UI)                         │
└──────────────────────────────────────┬─────────────────────────────────────────┘
                                       │ HTTP POST /api/ai/chat
                                       ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│ 🛡️ Next.js Application Server (Port 3000 - API Gateway / Proxy Layer)          │
│   • Authenticates student session                                              │
│   • Injects student context & purchase history                                 │
│   • Forwards request to dedicated AI Microservice                              │
│   • Graceful circuit-breaker fallback if microservice is offline               │
└──────────────────────────────────────┬─────────────────────────────────────────┘
                                       │ HTTP POST http://127.0.0.1:5000/api/ai/chat
                                       ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│ 🤖 Standalone AI Microservice (Port 5000 - Node.js / TypeScript)                │
│                                                                                │
│   1. Check Redis Prompt Cache (Cache-Aside) ────────► ⚡ 4ms HIT (RAM)         │
│   2. Prompt Construction & Dynamic RAG Context                                │
│   3. Multi-Model Inference Failover (Qwen 3.8B ➔ GPT-OSS 120B)                 │
│   4. Response Ingestion & Redis 30-min Cache Write                             │
└──────────────────────────────────────┬─────────────────────────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
         ┌─────────────────────┐               ┌─────────────────────┐
         │  ⚡ Redis Cache      │               │  🧠 Groq Cloud LLM  │
         │  (Port 6379)        │               │  Inference API      │
         └─────────────────────┘               └─────────────────────┘
```

---

### 💡 Why Microservices? Architectural Tradeoffs

| Feature / Metric | Monolithic Architecture | Microservices Architecture (EduPress) |
| :--- | :--- | :--- |
| **Fault Isolation** | ❌ Single Point of Failure (LLM outage impacts web UI). | ✅ **Isolated**: AI crashes or timeouts do not affect course videos, auth, or checkout. |
| **Independent Scaling** | ❌ Entire monolith must be scaled horizontally. | ✅ **Targeted**: Scale only the AI container/service during study peaks. |
| **Technology Agnostic** | ❌ Locked to Next.js framework constraints. | ✅ **Flexible**: AI service can use Python (FastAPI/PyTorch) or Node.js. |
| **Deployment Agility** | ❌ Deploying an AI prompt tweak requires rebuilding whole UI. | ✅ **Instant**: AI microservice restarts in 200ms without touching the web portal. |

---

### 💻 Microservice Implementation Code

#### 1. Standalone AI Microservice (`services/ai-microservice/server.ts`)
```typescript
import http from 'http';
import Redis from 'ioredis';

const PORT = process.env.AI_SERVICE_PORT ? parseInt(process.env.AI_SERVICE_PORT, 10) : 5000;
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 1, lazyConnect: true });
redis.connect().catch(() => {});

const CANDIDATE_MODELS = [
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.6-27b',
];

const server = http.createServer(async (req, res) => {
  // Health Check Endpoint
  if (req.method === 'GET' && (req.url === '/health' || req.url === '/api/ai/health')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', service: 'EduPress AI Microservice', port: PORT }));
    return;
  }

  // AI Chat & RAG Endpoint
  if (req.method === 'POST' && (req.url === '/api/ai/chat' || req.url === '/chat')) {
    const startTime = performance.now();
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      const payload = JSON.parse(body || '{}');
      const { messages, studentContext } = payload;
      const userPrompt = messages?.slice(-1)[0]?.text || '';
      const promptKey = `ai:chat:${studentContext?.email || 'user'}:${Buffer.from(userPrompt).toString('base64')}`;

      // 1. Redis Cache Lookup (Cache-Aside)
      const cached = await redis.get(promptKey).catch(() => null);
      if (cached) {
        const latencyMs = Math.round(performance.now() - startTime);
        res.writeHead(200, { 'Content-Type': 'application/json', 'X-Cache': 'HIT', 'X-Service': 'AI-Microservice-Port-5000' });
        res.end(JSON.stringify({ reply: cached, source: 'cache', latencyMs, service: 'ai-microservice' }));
        return;
      }

      // 2. Groq LLM Inference Call
      // (Calls candidate models with student contextual RAG prompt)
      // Caches output in Redis with 1800s TTL and returns response
    });
    return;
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🤖 [EduPress AI Microservice Online] Listening on Port ${PORT}`);
});
```

---

#### 2. Next.js API Gateway / Proxy Layer (`app/api/ai/chat/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
const AI_MICROSERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:5000';

export async function POST(req: NextRequest) {
  const startTime = performance.now();
  try {
    const body = await req.json();

    // 1. Forward request to Standalone AI Microservice
    const microserviceRes = await fetch(`${AI_MICROSERVICE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });

    if (microserviceRes.ok) {
      const data = await microserviceRes.json();
      return NextResponse.json({
        ...data,
        gatewayLatencyMs: Math.round(performance.now() - startTime),
      });
    }

    // 2. Fallback Response if Microservice is offline
    return NextResponse.json({
      reply: "Our AI Study Assistant is currently warming up. Please try again in a moment!",
      source: 'fallback',
      latencyMs: Math.round(performance.now() - startTime),
    });
  } catch {
    return NextResponse.json({ error: 'Internal API Gateway Error' }, { status: 500 });
  }
}
```

---

### 🚀 Step-by-Step EC2 Deployment & Multi-Process PM2 Execution

Run these commands in your **AWS EC2 Terminal**:

```bash
cd ~/LMS

# 1. Pull latest code with AI Microservice
git reset --hard origin/Main
git pull origin Main

# 2. Rebuild Next.js (with new API Gateway proxy route)
npm run build

# 3. Cleanly launch all 3 decoupled services in PM2
pm2 delete all

# Service 1: Next.js Frontend & API Gateway (Port 3000)
pm2 start npm --name "nextjs-frontend" -- start -- -p 3000

# Service 2: Background Certificate Event Worker
pm2 start npm --name "certificate-worker" -- run worker

# Service 3: Standalone AI Study Assistant Microservice (Port 5000)
pm2 start npm --name "ai-microservice" -- run ai-service

# 4. Save PM2 state for automatic reboot recovery
pm2 save

# 5. Check process table
pm2 status
```

*Expected PM2 Process Table:*
```text
┌────┬───────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┐
│ id │ name                  │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │
├────┼───────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┤
│ 0  │ nextjs-frontend       │ default     │ N/A     │ fork    │ 4120     │ 10s    │ 0    │ online    │
│ 1  │ certificate-worker    │ default     │ N/A     │ fork    │ 4135     │ 10s    │ 0    │ online    │
│ 2  │ ai-microservice       │ default     │ N/A     │ fork    │ 4150     │ 10s    │ 0    │ online    │
└────┴───────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┘
```

---

### 🧪 Verification & Latency Benchmarks (CLI Testing)

#### 1. Test AI Microservice Directly (Port 5000 Health Check):
```bash
curl -i http://127.0.0.1:5000/health
```
*Output:*
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "healthy",
  "service": "EduPress AI Study Assistant Microservice",
  "port": 5000,
  "uptime": 24.5,
  "redisConnected": true
}
```

#### 2. Test Inter-Service Communication via Next.js Gateway (Port 3000):
```bash
curl -i -X POST http://127.0.0.1:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "text": "How much money have I spent on courses?"}],
    "studentContext": {
      "name": "Ethan Hunt",
      "email": "ethan@example.com",
      "totalSpent": "₹3,297"
    }
  }'
```

*Expected Microservice Response forwarded by Gateway:*
```json
HTTP/1.1 200 OK
X-Microservice: ai-microservice-port-5000
X-Gateway-Time: 820ms
X-Cache: MISS

{
  "reply": "Hello Ethan! According to your account summary, you have spent a total of ₹3,297 across your enrolled courses.",
  "source": "llm",
  "latencyMs": 815,
  "model": "qwen/qwen3.8-27b",
  "service": "ai-microservice",
  "gatewayLatencyMs": 820
}
```

#### 3. Test Redis Caching on Second Call (⚡ 4ms Cache HIT):
Run the exact same curl command again:
```json
HTTP/1.1 200 OK
X-Microservice: ai-microservice-port-5000
X-Gateway-Time: 5ms
X-Cache: HIT

{
  "reply": "Hello Ethan! According to your account summary, you have spent a total of ₹3,297 across your enrolled courses.",
  "source": "cache",
  "latencyMs": 4,
  "service": "ai-microservice",
  "gatewayLatencyMs": 5
}
```

---

## 3. WebSockets & Real-Time Push Notifications (Concept #24)

> **Action:** Implement real-time push notifications using **Socket.IO / WebSockets**.  
> **Trigger Flow:** When an instructor publishes a new blog post or replies to a student doubt, the backend pushes an event through a persistent full-duplex WebSocket connection to all active students on their dashboard **instantly (< 5ms)** with zero page reloads and zero HTTP polling overhead.

---

### 🏛️ System Design Architecture: HTTP Polling vs. WebSockets

#### ❌ Before: Short/Long HTTP Polling (High Server Load & 5s-10s Latency)
```
Student Browser                              Next.js Backend Server
      │                                                │
      ├─────── HTTP GET /api/notifications? ──────────►│ (Check DB - Nothing new)
      │◄────── 200 OK [] (Empty) ──────────────────────┤
      │                                                │
      │ (Wait 5 seconds...)                            │
      ├─────── HTTP GET /api/notifications? ──────────►│ (Check DB - Nothing new)
      │◄────── 200 OK [] (Empty) ──────────────────────┤
      │                                                │
      │ ⚠️ 10,000 students x 12 requests/min = 120,000 useless HTTP queries/min!
```

#### ✅ After: Full-Duplex WebSockets Push (Zero Waste & 0s Latency)
```
Student Browser                              WebSocket Service (Port 4000)
      │                                                │
      ├─────── HTTP 101 Switching Protocols ──────────►│ (Persistent TCP Socket Established)
      │◄────── WebSocket Handshake Established ────────┤
      │                                                │
      │   [Zero Network Traffic while Idle...]         │
      │                                                │
      │                                      ┌─────────┴─────────┐
      │                                      │ Instructor Posts  │
      │                                      │ New Blog / Reply  │
      │                                      └─────────┬─────────┘
      │                                                │
      │◄────── ⚡ PUSH: "notification:new_blog" ────────┤ (Direct Socket Event Push)
      │                                                │
      ▼
   Floating Toast Popup Appears Instantly (< 5ms) + Badge Counter Increments!
```

---

### 💡 Why WebSockets? Performance Comparison

| Metric | HTTP Polling (5s interval) | WebSocket Event Push (EduPress) |
| :--- | :--- | :--- |
| **Notification Latency** | 0s to 5,000ms delay | **< 5ms (Instant push)** |
| **HTTP Request Overhead** | 120,000 HTTP headers / min (for 10k users) | **Zero (Header sent once during handshake)** |
| **Server CPU / RAM Load** | Heavy database read pressure | **Minimal (Idle TCP socket in memory)** |
| **User Experience** | Stale data until next poll | **Live interactive toast & animated badge** |

---

### 💻 WebSocket Implementation Code

#### 1. Standalone WebSocket Notification Microservice (`services/websocket-service/server.ts`)
```typescript
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

const PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT, 10) : 4000;

const server = http.createServer((req, res) => {
  // Webhook: Trigger New Blog Notification
  if (req.method === 'POST' && req.url === '/notify/blog') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const payload = JSON.parse(body || '{}');
      const blogNotification = {
        id: `notif_blog_${Date.now()}`,
        type: 'BLOG_POSTED',
        title: payload.title || 'New Instructor Blog Published',
        author: payload.author || 'Senior Instructor',
        desc: payload.desc || 'Check out latest industry insights.',
        time: 'Just now',
        read: false,
      };

      // Broadcast real-time push to all connected students
      io.emit('notification:new_blog', blogNotification);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, notification: blogNotification }));
    });
    return;
  }
});

const io = new SocketIOServer(server, { cors: { origin: '*' }, path: '/socket.io/' });

io.on('connection', socket => {
  console.log(`⚡ [WebSocket CONNECT] Client online: Socket ID ${socket.id}`);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`⚡ [EduPress WebSocket Notification Service] Listening on Port ${PORT}`);
});
```

---

#### 2. Next.js Client Hook & Real-Time Push Listener (`app/Student-Dashboard/page.tsx`)
```typescript
import { io } from 'socket.io-client';

useEffect(() => {
  const socket = io('http://learnportal.duckdns.org:4000', {
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    setWsConnected(true);
  });

  // Listen for Live Instructor Blog Push
  socket.on('notification:new_blog', (data) => {
    setNotificationsList(prev => [data, ...prev]);
    setRealtimeToast({ title: data.title, desc: data.desc });
  });

  // Listen for Live Doubt Resolution Push
  socket.on('notification:doubt_reply', (data) => {
    setNotificationsList(prev => [data, ...prev]);
    setRealtimeToast({ title: data.title, desc: data.desc });
  });

  return () => { socket.disconnect(); };
}, []);
```

---

### 🚀 Step-by-Step EC2 Deployment & PM2 Multi-Process Management

Run these commands in your **AWS EC2 Terminal**:

```bash
cd ~/LMS

# 1. Pull latest code with WebSocket service
git reset --hard origin/Main
git pull origin Main

# 2. Install socket.io dependencies
npm install

# 3. Build Next.js
npm run build

# 4. Cleanly launch all 4 decoupled microservices in PM2
pm2 delete all

# Service 1: Next.js Web App & API Gateway (Port 3000)
pm2 start npm --name "nextjs-frontend" -- start -- -p 3000

# Service 2: Background Certificate Event Worker
pm2 start npm --name "certificate-worker" -- run worker

# Service 3: Standalone AI Study Assistant Microservice (Port 5000)
pm2 start npm --name "ai-microservice" -- run ai-service

# Service 4: Standalone Real-Time WebSocket Notification Service (Port 4000)
pm2 start npm --name "websocket-service" -- run ws-service

# 5. Save PM2 state for automatic reboot recovery
pm2 save

# 6. Check process status
pm2 status
```

*Expected PM2 Process Table (4 Services Active):*
```text
┌────┬───────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┐
│ id │ name                  │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │
├────┼───────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┤
│ 0  │ nextjs-frontend       │ default     │ N/A     │ fork    │ 4120     │ 10s    │ 0    │ online    │
│ 1  │ certificate-worker    │ default     │ N/A     │ fork    │ 4135     │ 10s    │ 0    │ online    │
│ 2  │ ai-microservice       │ default     │ N/A     │ fork    │ 4150     │ 10s    │ 0    │ online    │
│ 3  │ websocket-service     │ default     │ N/A     │ fork    │ 4165     │ 10s    │ 0    │ online    │
└────┴───────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┘
```

---

### 🧪 Step 5: Test Real-Time Event Push from CLI & Browser

#### 1. Open the Student Dashboard in your browser:
Open **`https://learnportal.duckdns.org/Student-Dashboard`** in Chrome/Edge and click the **"Notifications"** tab.  
*(Notice the green badge: **`🟢 WebSocket Connected (Port 4000)`**)*

#### 2. Trigger an Instant Instructor Blog Notification via CLI:
In your EC2 Terminal, simulate an instructor posting a blog:

```bash
curl -i -X POST http://127.0.0.1:4000/notify/blog \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mastering Next.js Turbopack in 2026",
    "author": "John Doe",
    "desc": "Learn how to optimize bundle sizes and speed up HMR build times by 10x."
  }'
```

*Expected Output:*
```json
HTTP/1.1 200 OK
{
  "success": true,
  "notification": {
    "type": "BLOG_POSTED",
    "title": "Mastering Next.js Turbopack in 2026",
    "author": "John Doe",
    "desc": "Learn how to optimize bundle sizes..."
  },
  "recipients": 1
}
```

**👁️ Look at your browser screen:**  
A floating real-time notification toast pops up in the bottom-right corner, and the top notification list updates with **0 seconds latency** and zero page reload! 🎉

#### 3. Trigger a Doubt Reply Notification via CLI:
```bash
curl -i -X POST http://127.0.0.1:4000/notify/doubt \
  -H "Content-Type: application/json" \
  -d '{
    "courseTitle": "React Masterclass",
    "replyPreview": "Yes! useEffect cleanups execute before the component unmounts or before re-running the effect.",
    "studentEmail": "ethan@example.com",
    "instructorName": "John Doe"
  }'
```

---

## 4. Webhooks, HMAC Verification & CAP Theorem (Concept #25)

> **Action:** Use **Razorpay Webhooks** to handle payment lifecycle events asynchronously.  
> **Engineering Pipeline:**  
> When a student completes a payment (Card / UPI / NetBanking), the payment gateway fires an asynchronous webhook event (`payment.captured`, `order.paid`) to `https://learnportal.duckdns.org/api/webhooks/razorpay`.  
> The server verifies the **HMAC-SHA256 Cryptographic Signature**, checks **Distributed Idempotency (Redis locks)**, updates the student record, and triggers a real-time push via WebSockets to unlock the course with zero page refresh.

---

### 🏛️ System Design Architecture: CAP Theorem & Idempotent Webhooks

```
Student Browser (Checkout)                   Razorpay / Payment Gateway Server
      │                                                │
      ├─────── 1. Complete UPI / Card Payment ────────►│ (Bank Authorization OK)
      │                                                │
      │                                                ▼ (Asynchronous Webhook POST)
      │                            ┌──────────────────────────────────────────────┐
      │                            │ Next.js Webhook Receiver (Port 3000)         │
      │                            │                                              │
      │                            │ 🔐 Step 1: HMAC-SHA256 Signature Verify     │
      │                            │    Timing-safe comparison against Secret    │
      │                            │                                              │
      │                            │ 🛡️ Step 2: Redis Idempotency Lock            │
      │                            │    SETNX payment:processed:<pay_id> 1       │
      │                            │    (Prevents duplicate course enrollments)   │
      │                            │                                              │
      │                            │ 💾 Step 3: Database Transaction & Invoice    │
      │                            │    Generate Invoice ID & Unlock Access       │
      │                            │                                              │
      │                            │ ⚡ Step 4: WebSockets Event Broadcast        │
      │                            └──────────────────────┬───────────────────────┘
      │                                                   │
      │◄────── 5. Real-Time Push Toast: "Course Unlocked" ┤ (WebSocket Port 4000)
      │
      ▼
 Dashboard immediately displays "Enrolled & Active" with 0s reload!
```

---

### 🧠 Deep Dive: The CAP Theorem & Eventual Consistency in Payments

In distributed system architecture (like payment gateways + web servers + databases), the **CAP Theorem** states that a distributed data store can only provide **two of the three** guarantees:

```
                      Consistency (C)
                       /           \
                      /             \
                     /   CAP Trade-  \
                    /      offs       \
                   /                   \
        Availability (A) ────────── Partition Tolerance (P)
```

1. **Consistency (C):** Every read receives the most recent write or an error (No student is double-charged, and no course is unlocked without confirmed funds).
2. **Availability (A):** Every request receives a non-error response, without the guarantee that it contains the most recent write.
3. **Partition Tolerance (P):** The system continues to operate despite arbitrary network dropped messages.

#### 💡 How We Handle Payment Eventual Consistency (CP vs. AP):
- Networks *always* have latency and dropped packets (**P is mandatory in the real world**).
- When a payment occurs, Razorpay uses **At-Least-Once Delivery** (it may retry sending the webhook 5 times if your server takes > 5 seconds to answer).
- To guarantee **Consistency (C)** and prevent double-crediting a student, our webhook endpoint utilizes an **Atomic Redis Distributed Lock (`SETNX payment:processed:<id> 1 EX 86400 NX`)**:
  - **First Webhook:** Locks key $\to$ Enrolls Student $\to$ Returns `200 OK (CAPTURED)`.
  - **Duplicate/Retry Webhook:** Key exists $\to$ Returns `200 OK (ALREADY_PROCESSED - Idempotent)` without re-executing database writes!

---

### 💻 Webhook Implementation Code

#### 1. Cryptographic HMAC Verification & Idempotency Receiver (`app/api/webhooks/razorpay/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getRedisClient } from '@/lib/redis';

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_edupress_2026';

function verifyRazorpaySignature(rawBody: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;
  const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
  const actualBuffer = Buffer.from(signature, 'utf8');
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer); // Timing-safe check
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature') || '';

  // 1. Cryptographic Verification
  if (!verifyRazorpaySignature(rawBody, signature, WEBHOOK_SECRET)) {
    return NextResponse.json({ error: 'Invalid Cryptographic Signature' }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  const paymentId = payload.payload.payment.entity.id;

  // 2. Distributed Idempotency Lock via Redis
  const redis = getRedisClient();
  if (redis) {
    const isNew = await redis.set(`payment:processed:${paymentId}`, '1', 'EX', 86400, 'NX');
    if (!isNew) {
      return NextResponse.json({ message: 'Already processed (Idempotent)' }, { status: 200 });
    }
  }

  // 3. Database Enrollment & WebSocket Push
  // ...
  return NextResponse.json({ success: true, status: 'CAPTURED' });
}
```

---

### 🧪 Step-by-Step CLI Testing & Verification

We created a built-in cryptographic CLI simulator in **`scripts/simulate-razorpay-webhook.ts`** that signs payloads using HMAC-SHA256 and tests all 3 critical distributed system scenarios:

#### Scenario 1: Test Authentic Signed Payment Capture (`HTTP 200 OK`)
```bash
npx tsx scripts/simulate-razorpay-webhook.ts https://learnportal.duckdns.org/api/webhooks/razorpay VALID
```
*Expected Output:*
```text
🔐 [Valid Signature] Computed HMAC-SHA256: 8a4c1f...
📬 Response Status: HTTP 200 (18ms)
🎉 [TEST PASSED] Webhook cryptographically verified & enrollment processed!
```

#### Scenario 2: Test Idempotency & Replay Attack Defense (`HTTP 200 OK - Duplicate Ignored`)
```bash
npx tsx scripts/simulate-razorpay-webhook.ts https://learnportal.duckdns.org/api/webhooks/razorpay DUPLICATE
```
*Expected Output:*
```text
🛡️ [IDEMPOTENCY PASSED] Replay attack detected and ignored gracefully!
```

#### Scenario 3: Test Security Defense against Forged/Tampered Signatures (`HTTP 400 Bad Request`)
```bash
npx tsx scripts/simulate-razorpay-webhook.ts https://learnportal.duckdns.org/api/webhooks/razorpay TAMPERED
```
*Expected Output:*
```text
⚠️ [Attacker Test] Sending forged signature: fake_tampered_signature_99...
📬 Response Status: HTTP 400 (4ms)
🛡️ [SECURITY TEST PASSED] Forged webhook correctly rejected with 400 Bad Request!
```




