'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { setAuthToken, getAuthToken } from '@/lib/auth';

type WidgetNotice =
  | { kind: 'dismissed'; message: string }
  | { kind: 'error'; message: string };

function normalizeMsg91Failure(error: unknown): WidgetNotice {
  const e =
    error && typeof error === 'object'
      ? (error as {
          closeByUser?: boolean;
          message?: unknown;
          type?: unknown;
        })
      : null;

  const rawMsg =
    typeof e?.message === 'string' ? e.message.trim() : '';

  if (e?.closeByUser === true) {
    return {
      kind: 'dismissed',
      message:
        rawMsg ||
        'You closed verification. Continue below whenever you’re ready.',
    };
  }

  const typeStr = typeof e?.type === 'string' ? e.type.toLowerCase() : '';
  if (rawMsg.toLowerCase().includes('cancel') || typeStr.includes('cancel')) {
    return {
      kind: 'dismissed',
      message:
        rawMsg ||
        'You closed verification. Continue below whenever you’re ready.',
    };
  }

  if (rawMsg) {
    return { kind: 'error', message: rawMsg };
  }

  return {
    kind: 'error',
    message:
      "That OTP doesn’t match or something went wrong. Please try again, or tap resend if you didn’t receive a code.",
  };
}

const VERIFY_CLOSED_REDIRECT_SECONDS = 30;

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
  const [widgetNotice, setWidgetNotice] = useState<WidgetNotice | null>(null);
  const [redirectSecondsLeft, setRedirectSecondsLeft] = useState<number | null>(
    null,
  );
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  const getOtpWidgetConfig = (): Parameters<
    Window['initSendOTP']
  >[0] => ({
    widgetId:
      process.env.NEXT_PUBLIC_MSG91_WIDGET_ID || '356978705467343332303532',
    tokenAuth:
      process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH || '470606TKO40Abg68d4221dP1',
    identifier: '',
    exposeMethods: false,
    success: async (data: unknown) => {
      const payload = data as { message?: string };
      console.log('MSG91 OTP verification successful:', data);
      setWidgetNotice(null);
      setRedirectSecondsLeft(null);
      setIsVerifying(true);

      try {
        const accessToken = payload?.message;

        if (!accessToken) {
          console.error('Access token missing in MSG91 callback data.');
          setWidgetNotice({
            kind: 'error',
            message:
              'We could not finish sign-in from that OTP. Please try again.',
          });
          setIsVerifying(false);
          return;
        }

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/v1/auth/verify-otp`, {
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

          if (result.data.isNewUser) {
            router.push('/dashboard');
          } else {
            router.push('/dashboard');
          }
        } else {
          throw new Error('No access token received from backend');
        }
      } catch (error) {
        console.error('Error during verification:', error);
        setWidgetNotice({
          kind: 'error',
          message:
            'Something went wrong while completing sign-in. Please try verifying again in a moment.',
        });
        setIsVerifying(false);
      }
    },
    failure: (error: unknown) => {
      console.error('MSG91 OTP verification failed:', error);
      setWidgetNotice(normalizeMsg91Failure(error));
      setIsVerifying(false);
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
    // Check if user is already logged in
    const token = getAuthToken();
    if (token) {
      router.push('/dashboard');
      return;
    }

    // Load MSG91 widget script
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
    }

    return () => {
      // Cleanup script on unmount
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
  }, [router]);

  useEffect(() => {
    if (widgetNotice?.kind !== 'dismissed') {
      setRedirectSecondsLeft(null);
      return;
    }

    setRedirectSecondsLeft(VERIFY_CLOSED_REDIRECT_SECONDS);
    let remaining = VERIFY_CLOSED_REDIRECT_SECONDS;

    const id = window.setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        window.clearInterval(id);
        setRedirectSecondsLeft(null);
        setWidgetNotice(null);
        router.push('/');
        return;
      }
      setRedirectSecondsLeft(remaining);
    }, 1000);

    return () => window.clearInterval(id);
  }, [widgetNotice, router]);

  const handleBackToVerification = () => {
    setWidgetNotice(null);
    setRedirectSecondsLeft(null);
    mountOtpWidget();
  };

  const handleBackToHomeFromBanner = () => {
    setWidgetNotice(null);
    setRedirectSecondsLeft(null);
    router.push('/');
  };

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
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {isVerifying ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-700 font-medium">Verifying your account...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Login or Sign Up</h2>
                <p className="text-sm text-gray-600">We'll send you an OTP for verification</p>
              </div>

              {widgetNotice && (
                <Alert
                  variant={widgetNotice.kind === 'error' ? 'destructive' : 'default'}
                  className={
                    widgetNotice.kind === 'dismissed'
                      ? 'border-teal-200/80 bg-teal-50/60 text-teal-900 [&>svg]:text-teal-700'
                      : undefined
                  }
                >
                  {widgetNotice.kind === 'error' ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <Info className="h-4 w-4" />
                  )}
                  <div className="flex flex-1 flex-col gap-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1 space-y-1">
                        <AlertTitle className="text-sm font-semibold">
                          {widgetNotice.kind === 'error'
                            ? 'Could not verify'
                            : widgetNotice.message.toLowerCase().includes(
                                  'magic link',
                                )
                              ? 'Magic link sent'
                              : 'OTP verification window closed'}
                        </AlertTitle>
                        <AlertDescription className="text-sm opacity-95">
                          {widgetNotice.message}
                        </AlertDescription>
                        {widgetNotice.kind === 'dismissed' && (
                          <p className="text-xs text-teal-800/85 pt-1">
                            Going to home in{' '}
                            <span className="font-semibold tabular-nums">
                              {redirectSecondsLeft ?? VERIFY_CLOSED_REDIRECT_SECONDS}
                            </span>{' '}
                            {(redirectSecondsLeft ?? VERIFY_CLOSED_REDIRECT_SECONDS) ===
                            1
                              ? 'second'
                              : 'seconds'}
                            …
                          </p>
                        )}
                      </div>
                      {widgetNotice.kind === 'error' && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 shrink-0 self-start text-xs sm:self-center"
                          onClick={() => setWidgetNotice(null)}
                        >
                          Dismiss
                        </Button>
                      )}
                    </div>
                    {widgetNotice.kind === 'dismissed' && (
                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        <Button
                          type="button"
                          size="sm"
                          className="w-full sm:w-auto bg-teal-600 text-white hover:bg-teal-700"
                          onClick={handleBackToVerification}
                        >
                          Back to verification
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto border-teal-300 text-teal-900 hover:bg-teal-100/60"
                          onClick={handleBackToHomeFromBanner}
                        >
                          Back to home
                        </Button>
                      </div>
                    )}
                  </div>
                </Alert>
              )}

              {/* MSG91 Widget Container */}
              <div id="msg91-otp-widget" className="mb-6">
                {!isScriptLoaded && (
                  <div className="text-center py-4">
                    <div className="w-8 h-8 border-3 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-gray-600 mt-2">Loading...</p>
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
                  <button className="text-teal-600 font-medium hover:underline">
                    Terms
                  </button>{' '}
                  and{' '}
                  <button className="text-teal-600 font-medium hover:underline">
                    Privacy Policy
                  </button>
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
