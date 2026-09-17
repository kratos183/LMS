import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

/**
 * Verifies the Supabase session JWT from the sb-access-token cookie.
 * Returns the verified user from Supabase — cannot be faked by editing cookies.
 * Use this in every protected API route instead of reading user_role cookie directly.
 */
export async function getVerifiedUser(req?: NextRequest): Promise<AuthUser | null> {
  try {
    let accessToken: string | undefined;

    // 1. Check Authorization: Bearer <token> header first
    if (req) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7).trim();
      }
    }

    // 2. Check cookies
    if (!accessToken) {
      try {
        const cookieStore = await cookies();
        accessToken = cookieStore.get('sb-access-token')?.value;
      } catch {
        // Ignored if outside request store
      }
    }

    if (!accessToken && req) {
      accessToken = req.cookies.get('sb-access-token')?.value;
    }

    if (!accessToken) return null;

    // Verify the token with Supabase — cryptographic server-side validation
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user || !user.email) return null;

    // Role comes from app_metadata (server-controlled, not editable by user)
    // Only fall back to user_metadata if app_metadata is unset and matches permitted roles
    const rawRole = user.app_metadata?.role || user.user_metadata?.role || 'student';
    const role = ['student', 'instructor', 'admin'].includes(rawRole) ? rawRole : 'student';

    return { id: user.id, email: user.email.toLowerCase().trim(), role };
  } catch {
    return null;
  }
}

/**
 * Requires a verified session. Returns 401 JSON if not authenticated.
 * Usage: const { user, response } = await requireAuth(req);
 *        if (response) return response;
 */
export async function requireAuth(req?: NextRequest): Promise<{ user: AuthUser | null; response: Response | null }> {
  const user = await getVerifiedUser(req);
  if (!user) {
    return {
      user: null,
      response: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }
  return { user, response: null };
}

/**
 * Requires a specific role. Returns 403 if role doesn't match.
 */
export async function requireRole(
  requiredRole: string | string[],
  req?: NextRequest
): Promise<{ user: AuthUser | null; response: Response | null }> {
  const { user, response } = await requireAuth(req);
  if (response) return { user: null, response };

  const allowed = Array.isArray(requiredRole)
    ? requiredRole.includes(user!.role)
    : user!.role === requiredRole;

  if (!allowed) {
    return {
      user: null,
      response: new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }
  return { user, response: null };
}
