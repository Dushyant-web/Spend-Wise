import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password']
const AUTH_ONLY_PATHS = ['/dashboard', '/expenses', '/budget', '/reports', '/ai-coach', '/achievements', '/settings', '/profile']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('sw_access_token')?.value

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  const isProtected = AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p))

  if (isProtected && !token) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (isPublic && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
}
