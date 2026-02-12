'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setAuthToken, getAuthToken } from '@/lib/auth';

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
  const scriptRef = useRef<HTMLScriptElement | null>(null);

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
        initializeWidget();
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

  const initializeWidget = () => {
    const configuration = {
      widgetId: process.env.NEXT_PUBLIC_MSG91_WIDGET_ID || "356978705467343332303532",
      tokenAuth: process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH || "470606TKO40Abg68d4221dP1",
      identifier: "",
      exposeMethods: false,
      success: async (data: any) => {
        console.log('MSG91 OTP verification successful:', data);
        setIsVerifying(true);

        try {
          // Extract the access token from MSG91 response
          const accessToken = data?.message;
          
          if (!accessToken) {
            console.error('Access token missing in MSG91 callback data.');
            alert('Verification failed. Please try again.');
            setIsVerifying(false);
            return;
          }

          // Send token to backend for verification
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
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

          // Store JWT token
          if (result.data?.accessToken) {
            // Store in both localStorage and cookie
            setAuthToken(result.data.accessToken);

            // Route user based on account status
            if (result.data.isNewUser) {
             // router.push('/complete-profile');
             router.push('/dashboard');
            } else {
              router.push('/dashboard');
            }
          } else {
            throw new Error('No access token received from backend');
          }
        } catch (error) {
          console.error('Error during verification:', error);
          alert('Verification failed. Please try again.');
          setIsVerifying(false);
        }
      },
      failure: (error: any) => {
        console.error('MSG91 OTP verification failed:', error);
        alert('OTP verification failed. Please try again.');
        setIsVerifying(false);
      },
    };

    if (window.initSendOTP) {
      window.initSendOTP(configuration);
    }
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
