'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, CheckCircle2, AlertCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { setAuthToken, getAuthToken } from '@/lib/auth';
import { getSafeRedirectPath } from '@/lib/safeRedirect';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

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

// Extend window interface for MSG91
declare global {
  interface Window {
    initSendOTP: (config: any) => void;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [widgetNotice, setWidgetNotice] = useState<string | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const [showMobileOtp, setShowMobileOtp] = useState(false);

  const getOtpWidgetConfig = (): Parameters<
    Window['initSendOTP']
  >[0] => ({
    widgetId:
      process.env.NEXT_PUBLIC_MSG91_WIDGET_ID ,
    tokenAuth:
      process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH,
    identifier: '',
    exposeMethods: false,
    success: async (data: unknown) => {
      const payload = data as { message?: string };
      console.log('MSG91 OTP verification successful:', data);
      setWidgetNotice(null);
      setIsVerifying(true);

      try {
        const accessToken = payload?.message;

        if (!accessToken) {
          console.error('Access token missing in MSG91 callback data.');
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
          body: JSON.stringify({ accessToken }),
        });

        if (!response.ok) {
          throw new Error('Backend verification failed');
        }

        const result = await response.json();
        console.log('Backend verification result:', result);

        if (result.data?.accessToken) {
          setAuthToken(result.data.accessToken);
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

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setAuthToken(token);
      router.replace(resolvePostLoginPath());
    }
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-teal-400 rounded-2xl rotate-6 blur-sm opacity-60" />
            <div className="relative w-20 h-20 bg-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Ez Prep</h1>
          <p className="text-gray-600">Start your journey to crack government exams</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
          {isVerifying ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-700 font-medium">Verifying your account...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Login or Sign Up</h2>
                <p className="text-sm text-gray-600">
                  Choose Google or your mobile number. Either one signs you into the same EzPrep account.
                </p>
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

              <div className="mb-6 space-y-4">
                <GoogleSignInButton
                  disabled={isVerifying}
                  onError={(message) => setWidgetNotice(message)}
                />

                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    or
                  </span>
                  <span className="h-px flex-1 bg-gray-200" />
                </div>

                {!showMobileOtp ? (
                  <button
                    type="button"
                    onClick={() => {
                      setWidgetNotice(null);
                      setShowMobileOtp(true);
                    }}
                    className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-teal-200 bg-teal-50 px-4 text-sm font-semibold text-teal-800 transition hover:border-teal-300 hover:bg-teal-100"
                  >
                    <Phone className="h-4 w-4" />
                    Continue with mobile number
                  </button>
                ) : (
                  <div>
                    <p className="mb-3 text-center text-sm text-gray-600">
                      We&apos;ll send a one-time code to your mobile number
                    </p>
                    <div id="msg91-otp-widget">
                      {!isScriptLoaded && (
                        <div className="py-4 text-center">
                          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-teal-500/30 border-t-teal-500" />
                          <p className="mt-2 text-sm text-gray-600">Loading...</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3 pt-6 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600">Access 1000+ mock tests</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600">Expert guidance & mentorship</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600">Track your progress & improve</p>
                </div>
              </div>

              {/* Terms */}
              <div className="text-center pt-6">
                <p className="text-xs text-gray-500 leading-relaxed">
                  By continuing, you agree to our{' '}
                  <Link href="/terms" className="text-teal-600 font-medium hover:underline">
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy-policy" className="text-teal-600 font-medium hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
