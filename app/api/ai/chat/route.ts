import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export const dynamic = 'force-dynamic';

const CANDIDATE_MODELS = [
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.6-27b',
];

/**
 * Creates a deterministic cache key based on user email and their prompt
 */
function createPromptHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

export async function POST(req: NextRequest) {
  const startTime = performance.now();

  try {
    const { messages, studentContext } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not configured in .env.local. Please add your Groq API key to continue.' },
        { status: 500 }
      );
    }

    // Extract latest user prompt
    const lastUserMessage = [...(messages || [])].reverse().find((m: any) => m.role === 'user');
    const userPrompt = lastUserMessage?.text?.trim() || '';
    const studentEmail = studentContext?.email || 'default_student';

    // Generate cache key for prompt
    const promptKey = `ai:chat:${studentEmail}:${createPromptHash(userPrompt.toLowerCase())}`;
    const redis = getRedisClient();

    // =========================================================================
    // 1. REDIS CACHE LOOKUP (Cache-Aside Pattern)
    // =========================================================================
    if (redis && userPrompt) {
      try {
        const cachedReply = await redis.get(promptKey);
        if (cachedReply) {
          const latencyMs = Math.round(performance.now() - startTime);
          console.log(
            `\x1b[32m[Latency Benchmark] [CACHE HIT]\x1b[0m Prompt: "${userPrompt.slice(0, 40)}..." | ` +
            `Latency: \x1b[1m\x1b[32m${latencyMs}ms\x1b[0m | Source: Redis RAM`
          );

          return NextResponse.json(
            {
              reply: cachedReply,
              source: 'cache',
              latencyMs,
            },
            {
              headers: {
                'X-Cache': 'HIT',
                'X-Response-Time': `${latencyMs}ms`,
              },
            }
          );
        }
      } catch (err: any) {
        console.warn('[Redis] Cache read warning in AI route:', err.message);
      }
    }

    // =========================================================================
    // 2. CACHE MISS -> CALL GROQ LLM API
    // =========================================================================
    const contextPrompt = `
You are the official AI Learning Assistant for "EduPress LMS" (Website: EduPress LMS, Support: support@edupress.com, Contact Page: /contactPage, FAQs: /FAQ).
You are speaking directly with the currently authenticated student. You have real-time access to their personalized student record below.

Use this authentic data to accurately answer any questions regarding their enrolled courses, progress, remaining lessons, certificates, money spent, purchases, and platform support.

=== CURRENT STUDENT PROFILE ===
Name: ${studentContext?.name || 'Ethan Hunt'}
Email: ${studentContext?.email || 'ethan@example.com'}
Enrolled Since: ${studentContext?.enrolledSince || 'January 2024'}

=== ENROLLED COURSES & PROGRESS ===
${JSON.stringify(
  studentContext?.courses || [
    {
      title: "React Masterclass",
      progress: "75%",
      completedLessons: 12,
      totalLessons: 16,
      remainingLessons: 4,
      instructor: "John Doe",
      status: "In Progress",
      certificateEarned: false,
    },
    {
      title: "Next.js Fundamentals",
      progress: "100%",
      completedLessons: 20,
      totalLessons: 20,
      remainingLessons: 0,
      instructor: "Jane Smith",
      status: "Completed",
      certificateEarned: true,
    },
    {
      title: "Python Data Science",
      progress: "30%",
      completedLessons: 6,
      totalLessons: 20,
      remainingLessons: 14,
      instructor: "Alex Rivera",
      status: "In Progress",
      certificateEarned: false,
    },
  ],
  null,
  2
)}

=== FINANCIAL & PURCHASE SUMMARY ===
Total Amount Spent: ${studentContext?.totalSpent || '₹3,297'}
Purchase History & Invoices:
${JSON.stringify(
  studentContext?.purchases || [
    { course: "React Masterclass", price: "₹999", date: "Jan 15, 2024", invoiceId: "INV-2024-001", status: "Paid" },
    { course: "Next.js Fundamentals", price: "₹1,499", date: "Jan 28, 2024", invoiceId: "INV-2024-002", status: "Paid" },
    { course: "Python Data Science", price: "₹799", date: "Feb 02, 2024", invoiceId: "INV-2024-003", status: "Paid" },
  ],
  null,
  2
)}

=== CERTIFICATE RULES & STATUS ===
- A certificate is earned automatically the moment a course reaches 100% completion.
- Available certificates can be viewed, downloaded, or shared from the "Certificates" tab in the student dashboard.
- Active Certificates: Next.js Fundamentals Certificate (Ready for download).
- Pending Certificates: React Masterclass (Needs 4 more lessons), Python Data Science (Needs 14 more lessons).

=== WEBSITE & SUPPORT CONTACTS ===
- Website Name: EduPress LMS
- Support Email: support@edupress.com
- Contact Form: /contactPage
- FAQs Page: /FAQ

=== INSTRUCTIONS & TONE ===
1. Be warm, enthusiastic, polite, and encouraging in every reply.
2. When asked about money spent, quote the exact total (₹3,297) and breakdown of courses if helpful.
3. When asked when they will get a certificate, explain clearly how many lessons remain and that reaching 100% automatically unlocks it.
4. When asked about contact or support, mention support@edupress.com and the /contactPage link.
5. If the user just wants to chat or ask programming/coding questions, answer warmly, clearly, and concisely.
`;

    const systemMessage = {
      role: 'system',
      content: contextPrompt,
    };

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
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: formattedMessages,
            temperature: 0.6,
            max_tokens: 1024,
          }),
        });

        const data = await response.json();
        if (data.error) {
          lastError = data.error.message;
          continue;
        }

        const reply = data.choices?.[0]?.message?.content;
        if (reply) {
          selectedModel = model;
          const latencyMs = Math.round(performance.now() - startTime);

          // Save response to Redis (TTL: 1800 seconds = 30 minutes)
          if (redis && userPrompt) {
            try {
              await redis.setex(promptKey, 1800, reply);
            } catch (err: any) {
              console.warn('[Redis] Failed to cache AI reply:', err.message);
            }
          }

          console.log(
            `\x1b[33m[Latency Benchmark] [CACHE MISS / LLM CALL]\x1b[0m Prompt: "${userPrompt.slice(0, 40)}..." | ` +
            `Latency: \x1b[1m\x1b[33m${latencyMs}ms\x1b[0m | Model: ${model}`
          );

          return NextResponse.json(
            {
              reply,
              source: 'llm',
              latencyMs,
              model: selectedModel,
            },
            {
              headers: {
                'X-Cache': 'MISS',
                'X-Response-Time': `${latencyMs}ms`,
                'X-Model': selectedModel,
              },
            }
          );
        }
      } catch (err: any) {
        lastError = err.message;
      }
    }

    return NextResponse.json(
      { error: lastError || 'Failed to generate AI response from available models.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
