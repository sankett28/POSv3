import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get token from cookie or localStorage (via header)
  const token = request.cookies.get('access_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')
  
  const pathname = request.nextUrl.pathname
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup']
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  
  // Onboarding requires authentication
  if (pathname === '/onboarding' || pathname.startsWith('/onboarding/')) {
    if (!token) {
      // Redirect to signup if not authenticated
      return NextResponse.redirect(new URL('/signup', request.url))
    }
    // Allow authenticated users to access onboarding
    return NextResponse.next()
  }
  
  // Protect all other routes except public routes and static assets
  if (!isPublicRoute) {
    if (!token) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  // If on login/signup page and already authenticated
  // Don't redirect - let the page handle the redirect based on onboarding status
  // The login/signup pages will redirect to /onboarding or /orders as appropriate
  if ((pathname === '/login' || pathname === '/signup') && token) {
    // Allow the page to handle the redirect
    return NextResponse.next()
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
