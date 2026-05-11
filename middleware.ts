import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_TOKEN_COOKIE, LOGOUT_RESUME_PATH_COOKIE } from '@/lib/authCookieNames';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/complete-profile'];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login'];

/** Public home / marketing route — authenticated users skip it */
const landingPath = '/';

function isSafeResumePath(pathname: string): boolean {
  if (!pathname.startsWith('/') || pathname.startsWith('//')) return false;
  if (pathname.includes('..')) return false;
  // Don't loop into auth-only or public home via resume
  if (pathname === landingPath || pathname === '/login') return false;
  return true;
}

function redirectAuthenticatedUser(request: NextRequest): NextResponse {
  const raw = request.cookies.get(LOGOUT_RESUME_PATH_COOKIE)?.value;
  let targetPath = '/dashboard';
  if (raw && isSafeResumePath(raw)) {
    targetPath = raw;
  }
  const res = NextResponse.redirect(new URL(targetPath, request.url));
  res.cookies.set(LOGOUT_RESUME_PATH_COOKIE, '', {
    maxAge: 0,
    path: '/',
  });
  return res;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  const isLanding = pathname === landingPath;

  // Redirect to login if trying to access protected route without token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated users cannot use the marketing home or login — go to dashboard or last logout path
  if (token && (isLanding || isAuthRoute)) {
    return redirectAuthenticatedUser(request);
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
