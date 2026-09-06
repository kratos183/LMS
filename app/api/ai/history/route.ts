import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

/**
 * AI Chat Conversations History API (MongoDB Atlas - Concept #11)
 * GET:
 *   - If ?conversationId=xxx: Retrieves full message history for that specific conversation
 *   - Otherwise: Retrieves list of all past conversations for the student with titles & timestamps
 * DELETE:
 *   - If ?conversationId=xxx: Deletes the specific conversation
 *   - If ?all=true: Clears all conversations for the student
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') || 'ethan@example.com';
    const conversationId = searchParams.get('conversationId');

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({
        success: true,
        source: 'memory_fallback',
        conversations: [],
        messages: [],
      });
    }

    const collection = db.collection('ai_conversations');

    // 1. Fetch single conversation by conversationId
    if (conversationId) {
      const conv = await collection.findOne({
        studentEmail: email,
        conversationId,
      });

      if (!conv) {
        return NextResponse.json(
          { success: false, error: 'Conversation not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        source: 'mongodb_atlas',
        conversation: {
          conversationId: conv.conversationId,
          title: conv.title || 'Untitled Conversation',
          messages: conv.messages || [],
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        },
      });
    }

    // 2. Fetch list of all conversations for student (like ChatGPT sidebar)
    const rawConversations = await collection
      .find({ studentEmail: email })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(50)
      .toArray();

    const conversations = rawConversations.map((c) => ({
      conversationId: c.conversationId,
      title: c.title || 'Untitled Chat',
      messageCount: (c.messages || []).length,
      lastMessage: c.messages?.[c.messages.length - 1]?.text || '',
      updatedAt: c.updatedAt || c.createdAt,
      createdAt: c.createdAt,
    }));

    return NextResponse.json({
      success: true,
      source: 'mongodb_atlas',
      count: conversations.length,
      conversations,
    });
  } catch (error: any) {
    console.error('[MongoDB AI History GET Error]:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') || 'ethan@example.com';
    const conversationId = searchParams.get('conversationId');
    const deleteAll = searchParams.get('all') === 'true';

    const db = await getDatabase();
    if (db) {
      const collection = db.collection('ai_conversations');
      if (conversationId) {
        await collection.deleteOne({ studentEmail: email, conversationId });
      } else if (deleteAll) {
        await collection.deleteMany({ studentEmail: email });
      }
    }

    return NextResponse.json({
      success: true,
      message: conversationId
        ? `Conversation ${conversationId} deleted.`
        : 'All AI conversations cleared.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
