import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/Student-Dashboard'
  const origin = requestUrl.origin

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data?.session) {
      const user = data.session.user
      let role = 'student'

      if (user.user_metadata?.role) {
        role = user.user_metadata.role
      } else if (user.email) {
        const domain = user.email.split('@')[1]
        if (domain === 'instructor.edupress.com') role = 'instructor'
        else if (domain === 'admin.edupress.com') role = 'admin'
      }

      const response = NextResponse.redirect(new URL(next, origin))
      response.cookies.set('user_role', role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
      return response
    }

    const reason = encodeURIComponent(error?.message || 'unknown_error')
    return NextResponse.redirect(new URL(`/login-page?error=auth_failed&reason=${reason}`, origin))
  }

  return NextResponse.redirect(new URL('/login-page?error=auth_failed', origin))
}
