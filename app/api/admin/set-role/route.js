import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

export async function POST(request) {
  try {
    // Only admins can call this
    const cookieStore = await cookies()
    const callerRole = cookieStore.get('user_role')?.value
    if (callerRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured in .env.local' }, { status: 500 })
    }

    const { userId, role } = await request.json()
    if (!userId || !['student', 'instructor', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid userId or role' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient.auth.admin.updateUserById(userId, {
      app_metadata: { role },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, user: data.user.email, role })
  } catch (err) {
    console.error('Set role error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
