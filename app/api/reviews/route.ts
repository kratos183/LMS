import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// Seed initial denormalized reviews dataset for instant O(1) demonstration
const SEED_DENORMALIZED_REVIEWS = [
  {
    id: 'rev_101',
    course_id: 'react-masterclass',
    course_title: 'React Masterclass & Enterprise Patterns',
    instructor_name: 'John Doe',
    student_name: 'Ethan Hunt',
    student_email: 'ethan@example.com',
    student_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    rating: 5,
    text: 'Amazing course! The instructor explains complex concepts (Custom Hooks, Concurrent Features) very clearly with practical real-world examples.',
    date: '2 days ago',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rev_102',
    course_id: 'nextjs-fundamentals',
    course_title: 'Full Stack Next.js & System Architecture',
    instructor_name: 'Jane Smith',
    student_name: 'Sarah Connor',
    student_email: 'sarah@example.com',
    student_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rating: 5,
    text: 'The architectural insights into caching, microservices, and server actions are unmatched. Best course on Next.js hands down.',
    date: '3 days ago',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rev_103',
    course_id: 'python-data-science',
    course_title: 'Python for Data Science & Machine Learning',
    instructor_name: 'Alex Rivera',
    student_name: 'David Miller',
    student_email: 'david@example.com',
    student_avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop',
    rating: 4,
    text: 'Very comprehensive curriculum covering Pandas, NumPy, and Scikit-Learn. Highly recommended for beginners.',
    date: '1 week ago',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Concept #20: Database Denormalization API
 * Stores `instructor_name`, `course_title`, `student_name`, `student_avatar` directly in the review record
 * to eliminate 3-table relational SQL JOINs on high-throughput course and dashboard read queries.
 */
export async function GET(req: NextRequest) {
  const startTime = performance.now();

  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const instructorName = searchParams.get('instructorName');
    const email = searchParams.get('email');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const db = await getDatabase();
    let reviews: any[] = [];

    if (db) {
      const collection = db.collection('course_reviews');
      const query: any = {};
      if (courseId) query.course_id = courseId;
      if (instructorName) query.instructor_name = instructorName;
      if (email) query.student_email = email;

      reviews = await collection
        .find(query)
        .sort({ created_at: -1 })
        .limit(limit)
        .toArray();

      // If collection is empty, seed initial records
      if (reviews.length === 0 && !courseId && !instructorName && !email) {
        await collection.insertMany(SEED_DENORMALIZED_REVIEWS as any);
        reviews = SEED_DENORMALIZED_REVIEWS;
      }
    } else {
      // Memory fallback
      reviews = SEED_DENORMALIZED_REVIEWS.filter((r) => {
        if (courseId && r.course_id !== courseId) return false;
        if (instructorName && r.instructor_name !== instructorName) return false;
        if (email && r.student_email !== email) return false;
        return true;
      });
    }

    const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;

    return NextResponse.json(
      {
        success: true,
        count: reviews.length,
        concept: 'Concept #20: Database Denormalization',
        architecture: {
          strategy: 'Denormalized Single Table / Document Scan',
          joinsAvoided: ['JOIN users (student)', 'JOIN courses', 'JOIN users (instructor)'],
          readComplexity: 'O(1) Direct Indexed Scan',
        },
        latencyMs,
        reviews,
      },
      {
        headers: {
          'X-Denormalized': 'true',
          'X-Joins-Avoided': '3',
          'X-Query-Latency': `${latencyMs}ms`,
        },
      }
    );
  } catch (error: any) {
    console.error('[Denormalized Reviews GET Error]:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const startTime = performance.now();

  try {
    const body = await req.json();
    const {
      course_id,
      course_title,
      instructor_name,
      student_name,
      student_email,
      student_avatar,
      rating,
      text,
    } = body;

    if (!course_id || !text) {
      return NextResponse.json(
        { success: false, error: 'course_id and text are required.' },
        { status: 400 }
      );
    }

    // Denormalized Record: Redundantly store instructor_name, course_title, and student_name directly
    const newReview = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      course_id: String(course_id),
      course_title: course_title || 'Full Stack Web Development',
      instructor_name: instructor_name || 'John Doe',
      student_name: student_name || 'Ethan Hunt',
      student_email: student_email || 'ethan@example.com',
      student_avatar:
        student_avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      rating: Number(rating) || 5,
      text: String(text).trim(),
      date: 'Just now',
      created_at: new Date().toISOString(),
    };

    const db = await getDatabase();
    if (db) {
      const collection = db.collection('course_reviews');
      await collection.insertOne(newReview);

      // Also log activity
      try {
        const logsColl = db.collection('user_activity_logs');
        await logsColl.insertOne({
          action: 'POST_REVIEW',
          studentEmail: newReview.student_email,
          courseId: newReview.course_id,
          details: {
            reviewId: newReview.id,
            instructorName: newReview.instructor_name,
            courseTitle: newReview.course_title,
            rating: newReview.rating,
          },
          timestamp: new Date().toISOString(),
          createdAt: new Date(),
        });
      } catch {}
    }

    const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;

    return NextResponse.json(
      {
        success: true,
        message: 'Review saved with denormalized instructor_name & course metadata.',
        concept: 'Concept #20: Database Denormalization',
        latencyMs,
        review: newReview,
      },
      {
        status: 201,
        headers: {
          'X-Denormalized-Write': 'true',
        },
      }
    );
  } catch (error: any) {
    console.error('[Denormalized Reviews POST Error]:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
