import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limiter';

function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    serviceKey,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    { auth: { persistSession: false } }
  );
}

function setCookieAuth(response: NextResponse, role: string, email: string, userId?: string, accessToken?: string) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  };
  // UI-readable cookies
  response.cookies.set('user_role', role, cookieOptions);
  response.cookies.set('user_email', email.toLowerCase(), cookieOptions);
  if (userId) response.cookies.set('user_id', userId, cookieOptions);
  // Supabase JWT — used by getVerifiedUser() for server-side auth verification
  if (accessToken) response.cookies.set('sb-access-token', accessToken, cookieOptions);
}

export async function POST(request: NextRequest) {
  try {
    const rawIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || '127.0.0.1';
    
    // Rate limit auth requests (15 requests per minute per IP to mitigate brute force)
    const rateLimit = await checkRateLimit(`auth:${rawIp}`, 15, 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many authentication attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.resetInSeconds) } }
      );
    }

    const { email, password, mode, username } = await request.json();

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Valid email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const supabase = createServerClient();

    // REGISTER
    if (mode === 'register') {
      if (!username || typeof username !== 'string' || username.trim().length === 0) {
        return NextResponse.json({ error: 'Username is required' }, { status: 400 });
      }

      const cleanUsername = username.trim().slice(0, 50);

      const { data: regData, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { username: cleanUsername, role: 'student' },
        },
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      const accessToken = regData?.session?.access_token;
      const response = NextResponse.json({ success: true, role: 'student', email: cleanEmail });
      setCookieAuth(response, 'student', cleanEmail, regData?.user?.id, accessToken);
      return response;
    }

    // LOGIN
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (loginError || !loginData?.session) {
      return NextResponse.json({ error: loginError?.message || 'Invalid credentials' }, { status: 401 });
    }

    const userId = loginData.user.id;
    let role = 'student';

    // 1. app_metadata.role (authoritative)
    const adminClient = createAdminClient();
    if (adminClient) {
      try {
        const { data: adminUser } = await adminClient.auth.admin.getUserById(userId);
        if (adminUser?.user?.app_metadata?.role && ['student', 'instructor', 'admin'].includes(adminUser.user.app_metadata.role)) {
          role = adminUser.user.app_metadata.role;
        }
      } catch {}
    }

    // 2. user_metadata.role fallback (only if permitted)
    if (role === 'student' && loginData.user.user_metadata?.role && ['student', 'instructor', 'admin'].includes(loginData.user.user_metadata.role)) {
      role = loginData.user.user_metadata.role;
    }

    const accessToken = loginData.session.access_token;
    const response = NextResponse.json({ success: true, role, email: cleanEmail, userId });
    setCookieAuth(response, role, cleanEmail, userId, accessToken);
    return response;

  } catch (err: any) {
    console.error('Auth error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
