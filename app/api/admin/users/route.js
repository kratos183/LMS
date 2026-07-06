import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const callerRole = cookieStore.get('user_role')?.value
    if (callerRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKey,
      { auth: { persistSession: false, autoRefreshToken: false } }
    )

    const { data, error } = await adminClient.auth.admin.listUsers({ perPage: 100 })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    const users = data.users.map(u => ({
      id: u.id,
      email: u.email,
      username: u.user_metadata?.username || '-',
      role: u.app_metadata?.role || u.user_metadata?.role || 'student',
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at,
    }))

    return NextResponse.json({ users })
  } catch (err) {
    console.error('List users error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
