import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_TOKEN_COOKIE, LOGOUT_RESUME_PATH_COOKIE } from '@/lib/authCookieNames';
import { getSafeRedirectPath, isSafeRedirectPath } from '@/lib/safeRedirect';

// Routes that require authentication
const protectedRoutes = ['/dashboard'];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login'];

/** Public home / marketing route — authenticated users skip it */
const landingPath = '/';

function redirectAuthenticatedUser(request: NextRequest): NextResponse {
  const fromQuery = request.nextUrl.searchParams.get('redirect');
  const fromCookie = request.cookies.get(LOGOUT_RESUME_PATH_COOKIE)?.value;

  let targetPath = '/dashboard';
  if (fromQuery && isSafeRedirectPath(fromQuery)) {
    targetPath = getSafeRedirectPath(fromQuery);
  } else if (fromCookie && isSafeRedirectPath(fromCookie)) {
    targetPath = getSafeRedirectPath(fromCookie);
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

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  const isLanding = pathname === landingPath;

  // Unauthenticated users hitting protected routes → login, then back here
  if (isProtectedRoute && !token) {
    const returnTo = `${pathname}${request.nextUrl.search}`;
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', returnTo);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated users cannot use marketing home or login
  if (token && (isLanding || isAuthRoute)) {
    return redirectAuthenticatedUser(request);
  }

  return NextResponse.next();
}

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
