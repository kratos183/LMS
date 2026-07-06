import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Admin client — can read/write app_metadata (only set by you, not by users)
function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return null
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

// Regular client — for login/register with user credentials
function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  )
}

function setCookieRole(response, role) {
  response.cookies.set('user_role', role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function POST(request) {
  try {
    const { email, password, mode, username } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = createServerClient()

    // ── REGISTER ──────────────────────────────────────────────────────────────
    if (mode === 'register') {
      if (!username) {
        return NextResponse.json({ error: 'Username is required' }, { status: 400 })
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username, role: 'student' },
        },
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      const response = NextResponse.json({ success: true, role: 'student' })
      setCookieRole(response, 'student')
      return response
    }

    // ── LOGIN ─────────────────────────────────────────────────────────────────
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError || !loginData?.session) {
      return NextResponse.json({ error: loginError?.message || 'Invalid credentials' }, { status: 401 })
    }

    const userId = loginData.user.id
    let role = 'student'

    // 1️⃣  app_metadata.role — set by YOU in Supabase dashboard (highest priority)
    //     This is what gets used when you manually change a user's role in Supabase
    const adminClient = createAdminClient()
    if (adminClient) {
      const { data: adminUser } = await adminClient.auth.admin.getUserById(userId)
      if (adminUser?.user?.app_metadata?.role) {
        role = adminUser.user.app_metadata.role
      }
    }

    // 2️⃣  user_metadata.role — fallback (set automatically at registration)
    if (role === 'student' && loginData.user.user_metadata?.role) {
      role = loginData.user.user_metadata.role
    }

    const response = NextResponse.json({ success: true, role })
    setCookieRole(response, role)
    return response

  } catch (err) {
    console.error('Auth error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
