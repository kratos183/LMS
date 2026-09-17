import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getShardCollection, getShardForStudent, getAllShardCollections } from '@/lib/sharding';
import { getVerifiedUser, requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/logs/sharded
 * Writes a student activity log to the correct shard based on hash(studentEmail).
 */
export async function POST(req: NextRequest) {
  try {
    const verifiedUser = await getVerifiedUser(req);
    const body = await req.json();
    const { action, studentEmail, courseId, details, metadata } = body;

    const email = verifiedUser?.email || (studentEmail ? String(studentEmail).toLowerCase().trim() : 'anonymous@example.com');

    const shardIndex = getShardForStudent(email);
    const collectionName = getShardCollection(email);

    const logDocument = {
      action: action ? String(action).slice(0, 50) : 'USER_ACTIVITY',
      studentEmail: email,
      courseId: courseId ? String(courseId) : null,
      details: typeof details === 'object' && details !== null ? details : {},
      metadata: typeof metadata === 'object' && metadata !== null ? metadata : {},
      ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1',
      userAgent: (req.headers.get('user-agent') || 'Unknown').slice(0, 255),
      shardIndex,
      timestamp: new Date().toISOString(),
      createdAt: new Date(),
    };

    const db = await getDatabase();
    if (db) {
      await db.collection(collectionName).insertOne(logDocument);
    }

    return NextResponse.json({
      success: true,
      shardIndex,
      collectionName,
      concept: 'Concept #17: Hash-Based Sharding',
      log: logDocument,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET /api/logs/sharded
 * ?email=   → reads from the single correct shard (O(1) routing)
 * ?stats=true → aggregates document counts across all 4 shards
 */
export async function GET(req: NextRequest) {
  const { user, response } = await requireAuth(req);
  if (response) return response;

  const { searchParams } = new URL(req.url);
  const queryEmail = searchParams.get('email');
  const stats = searchParams.get('stats') === 'true';
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

  const db = await getDatabase();

  // --- Cross-shard stats aggregation (admin only) ---
  if (stats) {
    if (user!.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required for cross-shard statistics.' }, { status: 403 });
    }

    if (!db) return NextResponse.json({ shards: [], totalDocuments: 0 });

    const shardStats = await Promise.all(
      getAllShardCollections().map(async (name, i) => {
        const count = await db.collection(name).countDocuments();
        return { shard: i, collection: name, documentCount: count };
      })
    );

    const totalDocuments = shardStats.reduce((sum, s) => sum + s.documentCount, 0);

    return NextResponse.json({
      success: true,
      concept: 'Concept #17: Hash-Based Sharding',
      totalShards: 4,
      totalDocuments,
      shards: shardStats,
    });
  }

  // Only admin can read another student's logs
  const email = (queryEmail && user!.role === 'admin') ? queryEmail.toLowerCase().trim() : user!.email;

  const shardIndex = getShardForStudent(email);
  const collectionName = getShardCollection(email);

  if (!db) return NextResponse.json({ logs: [], shardIndex, collectionName });

  const logs = await db
    .collection(collectionName)
    .find({ studentEmail: email })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return NextResponse.json({
    success: true,
    concept: 'Concept #17: Hash-Based Sharding',
    shardIndex,
    collectionName,
    routingNote: `Hash("${email}") % 4 = ${shardIndex} → reads only from shard_${shardIndex}, not all 4 shards`,
    count: logs.length,
    logs,
  });
}
