'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Phone, Shield } from 'lucide-react';

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
    if (otp.length !== 6) return;

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
      <DialogContent className="w-[95%] max-w-md mx-auto rounded-2xl">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            {step === 'otp' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle className="text-xl font-bold text-gray-900 flex-1 text-center">
              {step === 'phone' ? 'Welcome to Ez Prep' : 'Verify OTP'}
            </DialogTitle>
            <div className="w-8" /> {/* Spacer for centering */}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {step === 'phone' ? (
            <>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                  <Phone className="w-8 h-8 text-teal-600" />
                </div>
                <p className="text-gray-600 text-sm">
                  Enter your mobile number to get started with your exam preparation journey
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      +91
                    </div>
                    <Input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="pl-12 h-12 text-base"
                      maxLength={10}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSendOtp}
                  disabled={phoneNumber.length !== 10 || isLoading}
                  className="w-full h-12 bg-teal-500 hover:bg-teal-600 text-white font-medium text-base"
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  By continuing, you agree to our{' '}
                  <span className="text-teal-600 underline">Terms of Service</span> and{' '}
                  <span className="text-teal-600 underline">Privacy Policy</span>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-teal-600" />
                </div>
                <p className="text-gray-600 text-sm">
                  We've sent a 6-digit OTP to{' '}
                  <span className="font-medium">+91 {phoneNumber}</span>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter OTP
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-lg tracking-widest h-12"
                    maxLength={6}
                  />
                </div>

                <Button
                  onClick={handleVerifyOtp}
                  disabled={otp.length !== 6 || isLoading}
                  className="w-full h-12 bg-teal-500 hover:bg-teal-600 text-white font-medium text-base"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Continue'}
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Didn't receive OTP?{' '}
                  <button className="text-teal-600 font-medium hover:underline">
                    Resend OTP
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}