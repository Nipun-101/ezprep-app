'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { startMockTestAttempt, resumeAttempt, StartAttemptData, ResumeAttemptData } from '@/lib/api/attempts';
import { cacheAttempt } from '@/lib/attempt-storage';
import { loadMathpix } from '@/components/attempt/MathpixBoundary';

export interface LaunchError {
  message: string;
  code?: string;
  testId?: string;
}

const ENTITLEMENT_REQUIRED = 'ENTITLEMENT_REQUIRED';

function readApiError(err: unknown, fallback: string): { message: string; code?: string } {
  const data = (err as { response?: { data?: { message?: string; details?: { code?: string } } } })
    ?.response?.data;
  const message = typeof data?.message === 'string' && data.message.trim() ? data.message : fallback;
  const code = typeof data?.details?.code === 'string' ? data.details.code : undefined;
  return { message, code };
}

export function useLaunchAttempt() {
  const router = useRouter();
  const [startingTestId, setStartingTestId] = useState<string | null>(null);
  const [startError, setStartError] = useState<LaunchError | null>(null);

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
    } catch (err: unknown) {
      const parsed = readApiError(err, 'Could not start the test. Please try again.');
      setStartError({
        message: parsed.message,
        code: parsed.code,
        testId: parsed.code === ENTITLEMENT_REQUIRED ? testId : undefined,
      });
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
    } catch (err: unknown) {
      const parsed = readApiError(err, 'Could not resume the test. Please try again.');
      setStartError({ message: parsed.message, code: parsed.code });
      setStartingTestId(null);
    }
  };

  return { startingTestId, startError, start, resume };
}
