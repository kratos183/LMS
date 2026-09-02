import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const AI_MICROSERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:5000';

/**
 * Next.js API Gateway / Proxy Layer (Concept #26: Microservices)
 * Forwards AI assistant chat requests to the standalone AI Microservice (Port 5000).
 */
export async function POST(req: NextRequest) {
  const startTime = performance.now();

  try {
    const body = await req.json();

    // 1. Forward to Standalone AI Microservice via HTTP
    try {
      const microserviceRes = await fetch(`${AI_MICROSERVICE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000), // 15s timeout
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
        `\x1b[33m[API Gateway] AI Microservice unavailable at ${AI_MICROSERVICE_URL} (${networkErr.message}). Engaging fallback...\x1b[0m`
      );
    }

    // 2. Fallback Response if Microservice is offline
    return NextResponse.json(
      {
        reply: "Hello! I am your AI Study Assistant. Our dedicated AI microservice is currently warming up. Please try asking again in a moment, or visit our /contactPage for immediate student assistance!",
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
