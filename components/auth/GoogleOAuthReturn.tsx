'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { setAuthToken } from '@/lib/auth';
import { completeGoogleSession } from '@/lib/googleAuth';

export default function GoogleOAuthReturn() {
  const router = useRouter();
  const [message, setMessage] = useState('Signing you in with Google…');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    completeGoogleSession().then((result) => {
      if (!active) return;
      if (!result.ok) {
        setFailed(true);
        setMessage(result.message);
        return;
      }
      setAuthToken(result.accessToken);
      router.replace(result.nextPath);
    });

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-8">
        {!failed ? (
          <>
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-teal-500/30 border-t-teal-500" />
            <p className="font-medium text-gray-700">{message}</p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-gray-900">Could not sign in</h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{message}</p>
            <Link
              href="/login"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-teal-500 px-5 text-sm font-semibold text-white hover:bg-teal-600"
            >
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
