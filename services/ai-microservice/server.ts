import http from 'http';
import fs from 'fs';
import path from 'path';
import Redis from 'ioredis';

// Automatically load .env.local and .env
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...rest] = trimmed.split('=');
          const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = val;
          }
        }
      });
    }
  }
}
loadEnv();

const PORT = process.env.AI_SERVICE_PORT ? parseInt(process.env.AI_SERVICE_PORT, 10) : 5000;
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

// Initialize Redis Client for In-Memory Prompt Caching
const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 1,
  lazyConnect: true,
  retryStrategy(times) {
    if (times > 3) return null;
    return Math.min(times * 100, 2000);
  },
});

redis.connect().catch((err) => {
  console.warn('\x1b[33m[AI Microservice] Redis connection warning (caching disabled):\x1b[0m', err.message);
});

const CANDIDATE_MODELS = [
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.6-27b',
];

/**
 * Creates deterministic cache hash for prompt deduplication
 */
function createPromptHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Route 1: Health Check Endpoint
  if (req.method === 'GET' && (req.url === '/health' || req.url === '/api/ai/health')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'healthy',
        service: 'EduPress AI Study Assistant Microservice',
        port: PORT,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        redisConnected: redis.status === 'ready',
      })
    );
    return;
  }

  // Route 2: AI Chat & RAG Processing Endpoint
  if (req.method === 'POST' && (req.url === '/api/ai/chat' || req.url === '/chat')) {
    const startTime = performance.now();

    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { messages, studentContext } = payload;

        const apiKey = process.env.GROQ_API_KEY || GROQ_API_KEY;
        if (!apiKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'GROQ_API_KEY is not configured on the AI Microservice.' }));
          return;
        }

        const lastUserMessage = [...(messages || [])].reverse().find((m: any) => m.role === 'user');
        const userPrompt = lastUserMessage?.text?.trim() || '';
        const studentEmail = studentContext?.email || 'default_student';

        const promptKey = `ai:chat:${studentEmail}:${createPromptHash(userPrompt.toLowerCase())}`;

        // 1. Redis Cache Lookup (Cache-Aside Pattern)
        if (redis.status === 'ready' && userPrompt) {
          try {
            const cachedReply = await redis.get(promptKey);
            if (cachedReply) {
              const latencyMs = Math.round(performance.now() - startTime);
              console.log(
                `\x1b[32m[AI Microservice] [CACHE HIT]\x1b[0m Prompt: "${userPrompt.slice(0, 35)}..." | Latency: \x1b[1m\x1b[32m${latencyMs}ms\x1b[0m`
              );

              res.writeHead(200, {
                'Content-Type': 'application/json',
                'X-Cache': 'HIT',
                'X-Response-Time': `${latencyMs}ms`,
                'X-Service': 'AI-Microservice-Port-5000',
              });
              res.end(
                JSON.stringify({
                  reply: cachedReply,
                  source: 'cache',
                  latencyMs,
                  service: 'ai-microservice',
                })
              );
              return;
            }
          } catch (err: any) {
            console.warn('[AI Microservice] Redis read warning:', err.message);
          }
        }

        // 2. Cache MISS -> Call LLM Inference Engine
        const contextPrompt = `
You are the official AI Learning Assistant for "EduPress LMS" (Support: support@edupress.com, Contact Page: /contactPage, FAQs: /FAQ).
You are speaking directly with the currently authenticated student. You have real-time access to their personalized student record below.

=== CURRENT STUDENT PROFILE ===
Name: ${studentContext?.name || 'Ethan Hunt'}
Email: ${studentContext?.email || 'ethan@example.com'}
Enrolled Since: ${studentContext?.enrolledSince || 'January 2024'}

=== ENROLLED COURSES & PROGRESS ===
${JSON.stringify(
  studentContext?.courses || [
    { title: "React Masterclass", progress: "78%", completedLessons: 12, totalLessons: 16, instructor: "John Doe" },
    { title: "Next.js Fundamentals", progress: "100%", completedLessons: 20, totalLessons: 20, instructor: "Jane Smith" },
    { title: "Python Data Science", progress: "30%", completedLessons: 6, totalLessons: 20, instructor: "Alex Rivera" },
  ],
  null,
  2
)}

=== FINANCIAL SUMMARY ===
Total Amount Spent: ${studentContext?.totalSpent || '₹3,297'}

=== INSTRUCTIONS ===
1. Be warm, polite, encouraging, and concise.
2. If asked about money spent, quote exact amounts.
3. If asked about certificates, explain that 100% completion unlocks it automatically in the Certificates tab.
`;

        const systemMessage = { role: 'system', content: contextPrompt };
        const formattedMessages = [
          systemMessage,
          ...(messages || []).map((m: { role: 'ai' | 'user'; text: string }) => ({
            role: m.role === 'ai' ? 'assistant' : 'user',
            content: m.text,
          })),
        ];

        let lastError = '';
        let selectedModel = '';

        for (const model of CANDIDATE_MODELS) {
          try {
            const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model,
                messages: formattedMessages,
                temperature: 0.6,
                max_tokens: 1024,
              }),
            });

            const groqData = await groqRes.json();
            if (groqData.error) {
              lastError = groqData.error.message;
              continue;
            }

            const reply = groqData.choices?.[0]?.message?.content;
            if (reply) {
              selectedModel = model;
              const latencyMs = Math.round(performance.now() - startTime);

              // Cache reply for 30 minutes (1800s)
              if (redis.status === 'ready' && userPrompt) {
                await redis.setex(promptKey, 1800, reply).catch(() => {});
              }

              console.log(
                `\x1b[33m[AI Microservice] [LLM CALL]\x1b[0m Prompt: "${userPrompt.slice(0, 35)}..." | Latency: \x1b[1m\x1b[33m${latencyMs}ms\x1b[0m | Model: ${model}`
              );

              res.writeHead(200, {
                'Content-Type': 'application/json',
                'X-Cache': 'MISS',
                'X-Response-Time': `${latencyMs}ms`,
                'X-Model': selectedModel,
                'X-Service': 'AI-Microservice-Port-5000',
              });
              res.end(
                JSON.stringify({
                  reply,
                  source: 'llm',
                  latencyMs,
                  model: selectedModel,
                  service: 'ai-microservice',
                })
              );
              return;
            }
          } catch (err: any) {
            lastError = err.message;
          }
        }

        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: lastError || 'All AI models failed to respond.' }));
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || 'Internal Microservice Error' }));
      }
    });
    return;
  }

  // 404 Route
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint Not Found on AI Microservice' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🤖 [EduPress AI Microservice Online] Listening on Port ${PORT}`);
  console.log(`📡 Health Check: http://127.0.0.1:${PORT}/health`);
  console.log(`💬 Chat Endpoint: http://127.0.0.1:${PORT}/api/ai/chat`);
  console.log(`======================================================\n`);
});
