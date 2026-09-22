/**
 * Safe post-login / resume path helpers (Edge- and client-safe).
 * Rejects open redirects while allowing deep links like /dashboard/exam/.../practice.
 */

const DEFAULT_POST_LOGIN_PATH = '/dashboard';

/**
 * Returns true for same-origin relative paths that are safe to resume after auth.
 * Accepts optional query/hash (e.g. /dashboard/exam/x/practice?page=2).
 */
export function isSafeRedirectPath(path: string): boolean {
  if (!path.startsWith('/') || path.startsWith('//')) return false;
  if (path.includes('..')) return false;

  const pathname = path.split(/[?#]/)[0] || '';
  if (!pathname || pathname === '/' || pathname === '/login') return false;
  if (pathname.startsWith('/login/')) return false;

  return true;
}

/**
 * Resolve a redirect candidate to a safe in-app path.
 */
export function getSafeRedirectPath(
  candidate: string | null | undefined,
  fallback: string = DEFAULT_POST_LOGIN_PATH,
): string {
  if (!candidate) return fallback;

  try {
    const decoded = decodeURIComponent(candidate);
    if (isSafeRedirectPath(decoded)) return decoded;
  } catch {
    // ignore malformed encoding
  }

  if (isSafeRedirectPath(candidate)) return candidate;
  return fallback;
}

/**
 * Build /login?redirect=... for the current (or given) in-app path.
 */
export function buildLoginUrl(returnPath?: string): string {
  const path =
    returnPath ??
    (typeof window !== 'undefined'
      ? `${window.location.pathname}${window.location.search}`
      : '');

  if (path && isSafeRedirectPath(path)) {
    return `/login?redirect=${encodeURIComponent(path)}`;
  }

  return '/login';
}
