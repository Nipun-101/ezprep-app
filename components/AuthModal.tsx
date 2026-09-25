'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { ArrowLeft, Phone, Shield, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthStep = 'phone' | 'otp';

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setStep('otp');
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 4) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);

    // Success - close modal, reset, and redirect to dashboard
    onClose();
    setStep('phone');
    setPhoneNumber('');
    setOtp('');
    router.push('/dashboard');
  };

  const handleBack = () => {
    setStep('phone');
    setOtp('');
  };

  const handleClose = () => {
    onClose();
    setStep('phone');
    setPhoneNumber('');
    setOtp('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95%] max-w-md mx-auto rounded-3xl border-0 shadow-2xl p-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-teal-50/30 -z-10" />

        <div className="p-8">
          <DialogHeader className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              {step === 'otp' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="h-10 w-10 rounded-full hover:bg-white/80"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              {step === 'phone' && <div className="w-10" />}
              <DialogTitle className="text-2xl font-bold text-teal-600 flex-1 text-center">
                {step === 'phone' ? 'Welcome Back' : 'Verify Code'}
              </DialogTitle>
              <div className="w-10" />
            </div>
          </DialogHeader>

          <div className="space-y-8">
            {step === 'phone' ? (
              <>
                <div className="text-center space-y-4">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 bg-teal-400 rounded-2xl rotate-6 blur-sm opacity-60" />
                    <div className="relative w-20 h-20 bg-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      Start Your Journey
                    </h3>
                    <p className="text-gray-600 text-sm max-w-xs mx-auto">
                      Enter your mobile number to access your personalized exam prep
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">
                        +91
                      </div>
                      <Input
                        type="tel"
                        placeholder="Enter mobile number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="pl-14 h-14 text-base rounded-xl border-0 shadow-sm bg-gray-50 focus:outline-none focus:ring-0 focus:bg-white focus:shadow-md"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSendOtp}
                    disabled={phoneNumber.length !== 10 || isLoading}
                    className="w-full h-14 bg-teal-500 hover:bg-teal-600 text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      'Send OTP'
                    )}
                  </Button>
                </div>

                <div className="text-center pt-2">
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
            ) : (
              <>
                <div className="text-center space-y-4">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 bg-teal-400 rounded-2xl rotate-6 blur-sm opacity-60" />
                    <div className="relative w-20 h-20 bg-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Shield className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      Enter Verification Code
                    </h3>
                    <p className="text-gray-600 text-sm">
                      We sent a 4-digit code to
                    </p>
                    <p className="text-gray-900 font-semibold">
                      +91 {phoneNumber}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col items-center">
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      Enter 4-Digit Code
                    </label>
                    <InputOTP
                      maxLength={4}
                      value={otp}
                      onChange={(value) => setOtp(value)}
                      pattern="^[0-9]*$"
                    >
                      <InputOTPGroup className="gap-3">
                        <InputOTPSlot
                          index={0}
                          className="w-16 h-16 text-2xl font-bold rounded-xl border-2 border-gray-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 bg-white shadow-sm transition-all"
                        />
                        <InputOTPSlot
                          index={1}
                          className="w-16 h-16 text-2xl font-bold rounded-xl border-2 border-gray-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 bg-white shadow-sm transition-all"
                        />
                        <InputOTPSlot
                          index={2}
                          className="w-16 h-16 text-2xl font-bold rounded-xl border-2 border-gray-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 bg-white shadow-sm transition-all"
                        />
                        <InputOTPSlot
                          index={3}
                          className="w-16 h-16 text-2xl font-bold rounded-xl border-2 border-gray-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 bg-white shadow-sm transition-all"
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <Button
                    onClick={handleVerifyOtp}
                    disabled={otp.length !== 4 || isLoading}
                    className="w-full h-14 bg-teal-500 hover:bg-teal-600 text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      'Verify & Continue'
                    )}
                  </Button>
                </div>

                <div className="text-center pt-2">
                  <p className="text-sm text-gray-600">
                    Didn't receive code?{' '}
                    <button className="text-teal-600 font-semibold hover:underline transition-colors">
                      Resend Code
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}