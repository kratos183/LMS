import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

/**
 * AI Chat History API (MongoDB Atlas - Concept #11)
 * GET: Retrieve persistent AI chat conversations for a student
 * DELETE: Clear chat history
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') || 'ethan@example.com';

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({
        success: true,
        source: 'memory_fallback',
        messages: [],
      });
    }

    const collection = db.collection('ai_chat_history');
    const history = await collection
      .find({ studentEmail: email })
      .sort({ timestamp: 1 })
      .limit(100)
      .toArray();

    const formattedMessages = history.map((doc) => ({
      role: doc.role,
      text: doc.text,
      latencyMs: doc.latencyMs,
      source: doc.source,
      timestamp: doc.timestamp,
    }));

    return NextResponse.json({
      success: true,
      source: 'mongodb_atlas',
      count: formattedMessages.length,
      messages: formattedMessages,
    });
  } catch (error: any) {
    console.error('[MongoDB AI History GET Error]:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch AI chat history' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') || 'ethan@example.com';

    const db = await getDatabase();
    if (db) {
      const collection = db.collection('ai_chat_history');
      await collection.deleteMany({ studentEmail: email });
    }

    return NextResponse.json({
      success: true,
      message: 'AI chat history cleared from MongoDB.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
