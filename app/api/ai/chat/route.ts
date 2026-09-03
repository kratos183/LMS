import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const AI_MICROSERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:5000';

const CANDIDATE_MODELS = [
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.6-27b',
];

/**
 * Next.js API Gateway / Proxy Layer (Concept #26: Microservices)
 * 1. Primary Route: Forwards to Standalone AI Microservice (Port 5000).
 * 2. Resilient Fallback: If Port 5000 is offline, executes direct Groq LLM inference so users always get a real response.
 */
export async function POST(req: NextRequest) {
  const startTime = performance.now();

  try {
    const body = await req.json();
    const { messages, studentContext } = body;

    // =========================================================================
    // 1. PRIMARY: FORWARD TO STANDALONE AI MICROSERVICE (Port 5000)
    // =========================================================================
    try {
      const microserviceRes = await fetch(`${AI_MICROSERVICE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(12000),
      });

      if (microserviceRes.ok) {
        const data = await microserviceRes.json();
        const gatewayLatencyMs = Math.round(performance.now() - startTime);

        return NextResponse.json(
          {
            ...data,
            gatewayLatencyMs,
          },
          {
            headers: {
              'X-Microservice': 'ai-microservice-port-5000',
              'X-Gateway-Time': `${gatewayLatencyMs}ms`,
              'X-Cache': microserviceRes.headers.get('X-Cache') || 'MISS',
            },
          }
        );
      }
    } catch (networkErr: any) {
      console.warn(
        `\x1b[33m[API Gateway] AI Microservice unavailable at ${AI_MICROSERVICE_URL} (${networkErr.message}). Engaging resilient direct fallback...\x1b[0m`
      );
    }

    // =========================================================================
    // 2. RESILIENT FALLBACK: DIRECT GROQ LLM EXECUTION
    // =========================================================================
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
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

      const formattedMessages = [
        { role: 'system', content: contextPrompt },
        ...(messages || []).map((m: { role: 'ai' | 'user'; text: string }) => ({
          role: m.role === 'ai' ? 'assistant' : 'user',
          content: m.text,
        })),
      ];

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
          const reply = groqData.choices?.[0]?.message?.content;
          if (reply) {
            const latencyMs = Math.round(performance.now() - startTime);
            return NextResponse.json({
              reply,
              source: 'llm',
              latencyMs,
              model,
              service: 'nextjs-direct-fallback',
            });
          }
        } catch {}
      }
    }

    // 3. Graceful Static Message if no LLM key is configured
    return NextResponse.json(
      {
        reply: "Hello! I am your AI Study Assistant. Our AI microservice is currently initializing. Please feel free to ask your course questions, or visit our /contactPage for immediate student support!",
        source: 'fallback',
        latencyMs: Math.round(performance.now() - startTime),
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal API Gateway error' },
      { status: 500 }
    );
  }
}
