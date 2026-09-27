'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { isAuthenticated } from '@/lib/auth';
import { startGoogleSignIn } from '@/lib/googleAuth';

const DISMISS_KEY = 'ezprep.google.prompt.dismissed';

function GoogleMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.7 7.1l6.3 5.3C37.4 38.4 44 33 44 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}

export default function GoogleSignInPrompt() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pathname !== '/') return;
    if (isAuthenticated()) return;
    if (sessionStorage.getItem(DISMISS_KEY) === '1') return;

    const timer = window.setTimeout(() => setOpen(true), 700);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!open) return null;

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setOpen(false);
  };

  const continueWithGoogle = async () => {
    setError(null);
    setPending(true);
    try {
      await startGoogleSignIn('/dashboard');
    } catch {
      setPending(false);
      setError('Google sign-in could not be started. Try again in a moment.');
    }
  };

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-[340px]">
      <div className="relative rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.22)]">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-2 top-2 rounded-md p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
          aria-label="Dismiss Google sign-in"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3 pr-6">
          <GoogleMark />
          <p className="text-sm font-medium leading-snug text-neutral-900">
            Sign in to Ez Prep with Google
          </p>
        </div>
        {error ? (
          <p className="mt-3 text-xs text-red-600">{error}</p>
        ) : null}
        <button
          type="button"
          onClick={() => void continueWithGoogle()}
          disabled={pending}
          className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-[#1a73e8] text-sm font-medium text-white transition hover:bg-[#1765cc] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? 'Continuing…' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
