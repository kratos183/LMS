import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const WS_SERVICE_URL = process.env.WS_SERVICE_URL || 'http://127.0.0.1:4000';

/**
 * Publishes real-time push notification events via the WebSocket microservice
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, payload } = body;

    let endpoint = `${WS_SERVICE_URL}/notify/blog`;
    if (type === 'DOUBT') {
      endpoint = `${WS_SERVICE_URL}/notify/doubt`;
    }

    const wsRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {}),
      signal: AbortSignal.timeout(5000),
    });

    if (!wsRes.ok) {
      return NextResponse.json({ error: 'WebSocket service rejected notification' }, { status: 502 });
    }

    const data = await wsRes.json();
    return NextResponse.json({
      success: true,
      message: 'Real-time notification pushed to all connected clients via WebSocket.',
      data,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to reach WebSocket service' }, { status: 500 });
  }
}
