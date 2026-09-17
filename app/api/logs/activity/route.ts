import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getVerifiedUser, requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * User Activity Logging API (MongoDB Atlas - Concept #11)
 * POST: Record append-heavy, unstructured student interaction logs
 * GET: Retrieve recent activity audit logs
 */
export async function POST(req: NextRequest) {
  try {
    const verifiedUser = await getVerifiedUser(req);
    const body = await req.json();
    const { action, details, studentEmail, courseId, metadata } = body;

    const email = verifiedUser?.email || (studentEmail ? String(studentEmail).toLowerCase().trim() : 'anonymous');
    const rawIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Browser';

    const logDocument = {
      action: action ? String(action).slice(0, 50) : 'USER_ACTIVITY',
      studentEmail: email,
      courseId: courseId ? String(courseId) : null,
      details: typeof details === 'object' && details !== null ? details : {},
      metadata: typeof metadata === 'object' && metadata !== null ? metadata : {},
      ip: rawIp,
      userAgent: userAgent.slice(0, 255),
      timestamp: new Date().toISOString(),
      createdAt: new Date(),
    };

    const db = await getDatabase();
    if (db) {
      const collection = db.collection('user_activity_logs');
      await collection.insertOne(logDocument);
    }

    return NextResponse.json({
      success: true,
      message: 'Activity logged to MongoDB Atlas.',
      log: logDocument,
    });
  } catch (error: any) {
    console.error('[MongoDB Activity Log POST Error]:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { user, response } = await requireAuth(req);
    if (response) return response;

    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const queryEmail = searchParams.get('email');

    // Only admin can view logs for all or other users
    const email = (queryEmail && user!.role === 'admin') ? queryEmail.toLowerCase().trim() : (user!.role === 'admin' ? queryEmail : user!.email);

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({
        success: true,
        source: 'memory_fallback',
        count: 0,
        logs: [],
      });
    }

    const collection = db.collection('user_activity_logs');
    const query = email ? { studentEmail: email } : {};

    const logs = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      source: 'mongodb_atlas',
      count: logs.length,
      logs,
    });
  } catch (error: any) {
    console.error('[MongoDB Activity Log GET Error]:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
