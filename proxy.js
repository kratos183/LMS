import { NextResponse } from 'next/server'

const PUBLIC_PATHS = [
  '/login-page',
  '/',
  '/blog',
  '/courses',
  '/contactPage',
  '/FAQ',
  '/template',
  '/blog-template',
  '/error',
  '/unauthorized',
  '/auth/callback',
]

const ROLE_ROUTES = {
  '/Student-Dashboard': 'student',
  '/Instructor-Dashboard': 'instructor',
  '/Admin-Dashboard': 'admin',
}

function getRoleFromPath(pathname) {
  for (const [prefix, role] of Object.entries(ROLE_ROUTES)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return { path: prefix, requiredRole: role }
    }
  }
  return null
}

export function proxy(request) {
  const { pathname } = request.nextUrl
  const url = new URL(request.url)
  const role = request.cookies.get('user_role')?.value

  if (PUBLIC_PATHS.includes(pathname)) {
    if (pathname === '/login-page' && role) {
      const dashboards = {
        student: '/Student-Dashboard',
        instructor: '/Instructor-Dashboard',
        admin: '/Admin-Dashboard',
      }
      return NextResponse.redirect(new URL(dashboards[role] || '/', url))
    }
    return NextResponse.next()
  }

  const route = getRoleFromPath(pathname)

  if (!route) {
    return NextResponse.next()
  }

  if (!role) {
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(new URL('/login-page', url))
  }

  if (route.requiredRole && route.requiredRole !== role) {
    return NextResponse.redirect(new URL(`/unauthorized?role=${role}&required=${route.requiredRole}&path=${encodeURIComponent(pathname)}`, url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
