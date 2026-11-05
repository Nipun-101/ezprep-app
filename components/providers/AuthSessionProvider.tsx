'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  getAuthToken,
  healAuthSessionCookies,
  isAuthenticated,
  refreshAccessToken,
  subscribeAuthChange,
  wipeLegacyAuthStorage,
} from '@/lib/auth';
import { buildLoginUrl } from '@/lib/safeRedirect';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthSessionContextValue {
  status: AuthStatus;
  isAuthenticated: boolean;
  token: string | null;
  refresh: () => void;
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

/** Mirrors middleware protected prefixes — used when marker outlives Redis session. */
const PROTECTED_PREFIXES = ['/dashboard', '/analytics', '/profile', '/test'];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** Module-level boot so React Strict Mode remount shares one hydrate. */
let bootPromise: Promise<void> | null = null;

function bootAuthSession(): Promise<void> {
  if (!bootPromise) {
    bootPromise = (async () => {
      wipeLegacyAuthStorage();
      await refreshAccessToken();
    })();
  }
  return bootPromise;
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [token, setToken] = useState<string | null>(null);
  const [bootComplete, setBootComplete] = useState(false);

  const syncFromMemory = useCallback(() => {
    healAuthSessionCookies();
    const next = getAuthToken();
    setToken(next);
    setStatus(next ? 'authenticated' : 'unauthenticated');
  }, []);

  const refresh = useCallback(() => {
    syncFromMemory();
  }, [syncFromMemory]);

  useEffect(() => {
    let cancelled = false;

    void bootAuthSession().finally(() => {
      if (!cancelled) {
        syncFromMemory();
        setBootComplete(true);
      }
    });

    return subscribeAuthChange(() => {
      if (!cancelled) syncFromMemory();
    });
  }, [syncFromMemory]);

  // Only after boot: stale marker can pass Edge, then cookie refresh proves logout.
  useEffect(() => {
    if (!bootComplete || status !== 'unauthenticated') return;
    if (typeof window === 'undefined') return;
    if (!isProtectedPath(window.location.pathname)) return;
    window.location.replace(buildLoginUrl());
  }, [bootComplete, status]);

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      status,
      isAuthenticated: status === 'authenticated' && isAuthenticated(),
      token,
      refresh,
    }),
    [status, token, refresh],
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession(): AuthSessionContextValue {
  const ctx = useContext(AuthSessionContext);
  if (!ctx) {
    throw new Error('useAuthSession must be used within AuthSessionProvider');
  }
  return ctx;
}
