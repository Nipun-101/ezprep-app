'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { startMockTestAttempt, resumeAttempt, StartAttemptData, ResumeAttemptData } from '@/lib/api/attempts';
import { cacheAttempt } from '@/lib/attempt-storage';
import { loadMathpix } from '@/components/attempt/MathpixBoundary';

export function useLaunchAttempt() {
  const router = useRouter();
  const [startingTestId, setStartingTestId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  const goToAttempt = (data: StartAttemptData | ResumeAttemptData) => {
    void loadMathpix();
    cacheAttempt(data);
    router.push(`/dashboard/attempt/${data.attemptId}`);
  };

  const start = async (testId: string) => {
    if (startingTestId) return;
    setStartingTestId(testId);
    setStartError(null);
    try {
      const data = await startMockTestAttempt(testId);
      goToAttempt(data);
    } catch (err: any) {
      setStartError(err?.response?.data?.message || 'Could not start the test. Please try again.');
      setStartingTestId(null);
    }
  };

  const resume = async (testId: string, attemptId: string) => {
    if (startingTestId) return;
    setStartingTestId(testId);
    setStartError(null);
    try {
      const data = await resumeAttempt(attemptId);
      goToAttempt(data);
    } catch (err: any) {
      setStartError(err?.response?.data?.message || 'Could not resume the test. Please try again.');
      setStartingTestId(null);
    }
  };

  return { startingTestId, startError, start, resume };
}
