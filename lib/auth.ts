/**
 * Authentication utility functions — student web sessions.
 * Access JWT lives in memory; refresh is HttpOnly cookie (ezprep_rt) on the API.
 */

import {
  AUTH_SESSION_COOKIE,
  AUTH_TOKEN_COOKIE,
  LOGOUT_RESUME_PATH_COOKIE,
} from '@/lib/authCookieNames';
import { isSafeRedirectPath } from '@/lib/safeRedirect';

const ACCESS_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'authRefreshToken';
/** Absolute web session length — middleware marker must match this, not the 15m access JWT. */
const SESSION_DAYS = 7;
const SESSION_MARKER_TTL_SEC = SESSION_DAYS * 24 * 60 * 60;

type AuthListener = () => void;
const listeners = new Set<AuthListener>();

/** In-memory access token (never written to localStorage). */
let memoryAccessToken: string | null = null;
let legacyStorageWiped = false;

/**
 * One in-flight cookie refresh for the whole tab.
 * Critical: Redis rotates refresh tokens; parallel refresh (React Strict Mode
 * remount + axios 401 during boot) looks like theft and revokes the session.
 */
let refreshFlight: Promise<string | null> | null = null;

function notifyAuthListeners(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore listener errors
    }
  });
}

/** Subscribe to login/logout/token changes (client only). */
export function subscribeAuthChange(listener: AuthListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setCookie(
  name: string,
  value: string,
  maxAgeSec: number = SESSION_DAYS * 24 * 60 * 60,
): void {
  if (typeof window === 'undefined') return;
  const secure =
    window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${value}; path=/; max-age=${Math.max(1, Math.floor(maxAgeSec))}; SameSite=Lax${secure}`;
}

function removeCookie(name: string): void {
  if (typeof window === 'undefined') return;
  const secure =
    window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${secure}`;
}

function hasSessionMarkerCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie
    .split(';')
    .some((part) => {
      const trimmed = part.trim();
      return (
        trimmed.startsWith(`${AUTH_SESSION_COOKIE}=`) ||
        trimmed.startsWith(`${AUTH_TOKEN_COOKIE}=`)
      );
    });
}

/**
 * Middleware presence marker (never stores the JWT).
 * Must outlive idle gaps up to the Redis session (7d): Edge middleware cannot
 * see the API HttpOnly refresh cookie, and axios interceptors never run on a
 * hard navigation before middleware redirects.
 */
function writeSessionMarkerCookie(
  maxAgeSec: number = SESSION_MARKER_TTL_SEC,
): void {
  setCookie(AUTH_SESSION_COOKIE, '1', maxAgeSec);
  // Drop legacy JWT cookie so the token is not duplicated in document.cookie.
  removeCookie(AUTH_TOKEN_COOKIE);
}

/**
 * One-time cutover: remove XSS-readable legacy tokens so old sessions cannot linger.
 */
export function wipeLegacyAuthStorage(): void {
  if (typeof window === 'undefined' || legacyStorageWiped) return;
  legacyStorageWiped = true;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // ignore
  }
  removeCookie(AUTH_TOKEN_COOKIE);
}

/**
 * Get access token from memory
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return memoryAccessToken;
}

/**
 * Refresh is HttpOnly on the API — always null in JS (kept for call-site compat).
 */
export function getRefreshToken(): string | null {
  return null;
}

/**
 * Store access token in memory and renew the 7d middleware presence marker.
 * `refreshToken` / `expiresInSec` (access TTL) do not shorten the marker —
 * access expiry is enforced by the API + silent cookie refresh, not Edge.
 */
export function setAuthTokens(
  accessToken: string,
  _refreshToken?: string | null,
  _expiresInSec?: number,
): void {
  if (typeof window === 'undefined') return;
  wipeLegacyAuthStorage();
  memoryAccessToken = accessToken;
  writeSessionMarkerCookie(SESSION_MARKER_TTL_SEC);
  notifyAuthListeners();
}

/**
 * @deprecated Prefer setAuthTokens. Kept for call-site compatibility.
 */
export function setAuthToken(
  token: string,
  refreshToken?: string | null,
  expiresInSec?: number,
): void {
  setAuthTokens(token, refreshToken, expiresInSec);
}

/**
 * Remove auth tokens and session cookies
 */
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  memoryAccessToken = null;
  wipeLegacyAuthStorage();
  removeCookie(AUTH_TOKEN_COOKIE);
  removeCookie(AUTH_SESSION_COOKIE);
  notifyAuthListeners();
}

/**
 * Align marker with memory access after boot refresh.
 * Clears orphan markers when there is no access token — but never while a
 * cookie refresh is in flight (marker is the only Edge signal until hydrate).
 */
export function healAuthSessionCookies(): void {
  if (typeof window === 'undefined') return;
  wipeLegacyAuthStorage();
  if (memoryAccessToken && !hasSessionMarkerCookie()) {
    writeSessionMarkerCookie();
    return;
  }
  if (!memoryAccessToken && hasSessionMarkerCookie() && !refreshFlight) {
    removeCookie(AUTH_TOKEN_COOKIE);
    removeCookie(AUTH_SESSION_COOKIE);
  }
}

/** True while a silent cookie refresh is running (boot or 401 recovery). */
export function isAuthRefreshInFlight(): boolean {
  return refreshFlight !== null;
}

/**
 * Check if user is authenticated (token presence only)
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Clear in-progress attempt caches so a shared browser cannot leak them.
 */
function clearAttemptSessionCaches(): void {
  if (typeof window === 'undefined') return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i);
      if (key && (key.includes('attempt') || key.startsWith('ezprep.'))) {
        keys.push(key);
      }
    }
    keys.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // ignore
  }
}

function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
}

/**
 * Best-effort server logout, then clear local session and hard-navigate home.
 */
export async function logout(): Promise<void> {
  if (typeof window !== 'undefined') {
    const path = `${window.location.pathname || ''}${window.location.search || ''}`;
    if (isSafeRedirectPath(path)) {
      setCookie(LOGOUT_RESUME_PATH_COOKIE, path, SESSION_DAYS * 24 * 60 * 60);
    }

    const token = getAuthToken();
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      await fetch(`${apiBaseUrl()}/api/v1/auth/logout`, {
        method: 'POST',
        headers,
        credentials: 'include',
      });
    } catch {
      // best-effort
    }
  }

  clearAttemptSessionCaches();
  removeAuthToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}

/**
 * Silent refresh via HttpOnly cookie. Single-flight across boot + axios 401.
 * Returns null when no session cookie / failure.
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  if (refreshFlight) {
    return refreshFlight;
  }

  refreshFlight = (async () => {
    try {
      const response = await fetch(`${apiBaseUrl()}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: '{}',
      });
      if (!response.ok) {
        if (response.status === 401) {
          // Do not wipe a token another caller may have just set; single-flight
          // normally prevents this, but keep the guard for safety.
          if (!memoryAccessToken) {
            removeCookie(AUTH_TOKEN_COOKIE);
            removeCookie(AUTH_SESSION_COOKIE);
            notifyAuthListeners();
          }
        }
        return memoryAccessToken;
      }
      const body = await response.json();
      const accessToken = body?.data?.accessToken as string | undefined;
      const expiresIn = body?.data?.expiresIn as number | undefined;
      if (!accessToken) return memoryAccessToken;
      setAuthTokens(accessToken, null, expiresIn);
      return accessToken;
    } catch {
      return memoryAccessToken;
    } finally {
      refreshFlight = null;
    }
  })();

  return refreshFlight;
}
