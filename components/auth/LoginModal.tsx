'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AlertCircle, Phone, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { setAuthTokens, getAuthToken, healAuthSessionCookies } from '@/lib/auth';
import { getSafeRedirectPath } from '@/lib/safeRedirect';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

const loginButtonClass =
  'flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60';

function isOtpCancelled(error: unknown): boolean {
  const e =
    error && typeof error === 'object'
      ? (error as { closeByUser?: boolean; message?: unknown; type?: unknown })
      : null;
  if (e?.closeByUser === true) return true;
  const rawMsg = typeof e?.message === 'string' ? e.message.toLowerCase() : '';
  const typeStr = typeof e?.type === 'string' ? e.type.toLowerCase() : '';
  return rawMsg.includes('cancel') || typeStr.includes('cancel');
}

function otpErrorMessage(error: unknown): string {
  const e =
    error && typeof error === 'object'
      ? (error as { message?: unknown })
      : null;
  const rawMsg = typeof e?.message === 'string' ? e.message.trim() : '';
  return (
    rawMsg ||
    "That code didn’t match or something went wrong. Please try again."
  );
}

function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
}

function resolvePostLoginPath(): string {
  if (typeof window === 'undefined') return '/dashboard';
  return getSafeRedirectPath(
    new URLSearchParams(window.location.search).get('redirect'),
  );
}

declare global {
  interface Window {
    initSendOTP: (config: any) => void;
  }
}

export default function LoginModal() {
  const router = useRouter();
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [widgetNotice, setWidgetNotice] = useState<string | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const [showMobileOtp, setShowMobileOtp] = useState(false);

  const getOtpWidgetConfig = (): Parameters<Window['initSendOTP']>[0] => ({
    widgetId: process.env.NEXT_PUBLIC_MSG91_WIDGET_ID,
    tokenAuth: process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH,
    identifier: '',
    exposeMethods: false,
    success: async (data: unknown) => {
      const payload = data as { message?: string };
      setWidgetNotice(null);
      setIsVerifying(true);

      try {
        const accessToken = payload?.message;

        if (!accessToken) {
          setWidgetNotice(
            'We could not finish sign-in from that OTP. Please try again.',
          );
          setIsVerifying(false);
          return;
        }

        const response = await fetch(`${apiBaseUrl()}/api/v1/auth/verify-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ accessToken, client: 'web' }),
        });

        if (!response.ok) {
          throw new Error('Backend verification failed');
        }

        const result = await response.json();

        if (result.data?.accessToken) {
          setAuthTokens(result.data.accessToken, null, result.data.expiresIn);
          router.replace(resolvePostLoginPath());
        } else {
          throw new Error('No access token received from backend');
        }
      } catch (error) {
        console.error('Error during verification:', error);
        setWidgetNotice(
          'Something went wrong while completing sign-in. Please try verifying again in a moment.',
        );
        setIsVerifying(false);
      }
    },
    failure: (error: unknown) => {
      setIsVerifying(false);
      setShowMobileOtp(false);
      setWidgetNotice(isOtpCancelled(error) ? null : otpErrorMessage(error));
    },
  });

  const mountOtpWidget = () => {
    if (typeof window.initSendOTP === 'function') {
      window.initSendOTP(getOtpWidgetConfig());
    }
  };

  const mountOtpWidgetRef = useRef(mountOtpWidget);
  mountOtpWidgetRef.current = mountOtpWidget;

  const close = () => {
    router.push('/');
  };

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      healAuthSessionCookies();
      router.replace(resolvePostLoginPath());
    }
  }, [router]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [router]);

  useEffect(() => {
    if (!showMobileOtp) {
      return;
    }

    if (!scriptRef.current) {
      const script = document.createElement('script');
      script.src = 'https://verify.msg91.com/otp-provider.js';
      script.async = true;
      script.onload = () => {
        setIsScriptLoaded(true);
        mountOtpWidgetRef.current();
      };
      document.body.appendChild(script);
      scriptRef.current = script;
    } else if (typeof window.initSendOTP === 'function') {
      mountOtpWidgetRef.current();
    }

    return () => {
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current);
        scriptRef.current = null;
        setIsScriptLoaded(false);
      }
    };
  }, [showMobileOtp]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close login"
        className="absolute inset-0 bg-black/25"
        onClick={close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        className="relative z-10 w-full max-w-[400px] rounded-2xl bg-[#faf8f6] px-6 pb-6 pt-5 shadow-[0_16px_50px_rgba(15,23,42,0.18)]"
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 rounded-md p-1.5 text-neutral-500 transition hover:bg-black/5 hover:text-neutral-800"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {isVerifying ? (
          <div className="py-10 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-teal-500/30 border-t-teal-500" />
            <p className="text-sm font-medium text-neutral-700">
              Verifying your account...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex flex-col items-center pt-2">
              <div className="relative mb-2 h-14 w-40">
                <Image
                  src="/ezprep-logo-1.png"
                  alt="EzPrep"
                  fill
                  className="object-contain mix-blend-multiply"
                  priority
                />
              </div>
              <h1
                id="login-title"
                className="text-xl font-semibold tracking-tight text-neutral-900"
              >
                Log in to Ez Prep
              </h1>
            </div>

            {widgetNotice && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-sm font-semibold">
                  Could not verify
                </AlertTitle>
                <AlertDescription className="text-sm">
                  {widgetNotice}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <GoogleSignInButton
                disabled={isVerifying}
                onError={(message) => setWidgetNotice(message)}
                className={loginButtonClass}
              />
              <button
                type="button"
                onClick={() => {
                  setWidgetNotice(null);
                  setShowMobileOtp(true);
                }}
                className={loginButtonClass}
              >
                <Phone className="h-4 w-4 text-neutral-700" />
                Continue with mobile number
              </button>
            </div>

            {showMobileOtp ? (
              <div className="mt-4">
                <div id="msg91-otp-widget">
                  {!isScriptLoaded && (
                    <div className="py-3 text-center">
                      <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-teal-500/30 border-t-teal-500" />
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <p className="mt-5 text-center text-xs leading-relaxed text-neutral-500">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-teal-700 hover:underline">
                Terms
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy-policy"
                className="text-teal-700 hover:underline"
              >
                Privacy Policy
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
