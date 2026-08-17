import { StartAttemptData, ResumeAttemptData } from '@/lib/api/attempts';

export const ATTEMPT_STORAGE_PREFIX = 'ezp:mockAttempt:';

export function cacheAttempt(data: StartAttemptData | ResumeAttemptData) {
  try {
    sessionStorage.setItem(`${ATTEMPT_STORAGE_PREFIX}${data.attemptId}`, JSON.stringify(data));
  } catch {
    // ignore quota / unavailable
  }
}

export function clearCachedAttempt(attemptId: string) {
  try {
    sessionStorage.removeItem(`${ATTEMPT_STORAGE_PREFIX}${attemptId}`);
  } catch {
    // ignore
  }
}

export function readCachedAttempt(attemptId: string): StartAttemptData | ResumeAttemptData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(`${ATTEMPT_STORAGE_PREFIX}${attemptId}`);
    return raw ? (JSON.parse(raw) as StartAttemptData) : null;
  } catch {
    return null;
  }
}
