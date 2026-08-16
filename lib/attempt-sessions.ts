import {
  AttemptMockTestData,
  AttemptQuestion,
  AttemptSession,
  ResumeAttemptData,
  StartAttemptData,
} from '@/lib/api/attempts';

export function getCurrentSession(meta: AttemptMockTestData): AttemptSession | null {
  if (!meta.isSessionWise || !meta.sessions?.length) return null;
  const idx = meta.currentSessionIndex ?? 0;
  return (
    meta.sessions[idx] ||
    meta.sessions.find((s) => s.status === 'IN_PROGRESS') ||
    null
  );
}

export function filterSessionQuestions(
  questions: AttemptQuestion[],
  session: AttemptSession
): AttemptQuestion[] {
  if (session.questionIds?.length) {
    const byId = new Map(questions.map((q) => [q._id, q]));
    return session.questionIds
      .map((id) => byId.get(id))
      .filter((q): q is AttemptQuestion => Boolean(q));
  }
  const byOrder = questions.filter((q) => q.sessionOrder === session.order);
  if (byOrder.length) return byOrder;
  if (session.endIndex >= session.startIndex) {
    return questions.slice(session.startIndex, session.endIndex + 1);
  }
  return [];
}

export function visibleAttemptQuestions(
  questions: AttemptQuestion[],
  meta: AttemptMockTestData
): AttemptQuestion[] {
  const session = getCurrentSession(meta);
  return session ? filterSessionQuestions(questions, session) : questions;
}

export function hydrateAnswers(questions: AttemptQuestion[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const q of questions) {
    if (q.selectedOption) {
      map.set(q._id, q.selectedOption);
    }
  }
  return map;
}

export function mergeAnswers(
  prev: Map<string, string>,
  questions: AttemptQuestion[]
): Map<string, string> {
  const next = new Map(prev);
  for (const q of questions) {
    if (q.selectedOption) {
      next.set(q._id, q.selectedOption);
    }
  }
  return next;
}

export function isLastSession(meta: AttemptMockTestData): boolean {
  if (!meta.isSessionWise || !meta.sessions?.length) return true;
  const idx = meta.currentSessionIndex ?? 0;
  return idx >= meta.sessions.length - 1;
}

/**
 * Best-effort seconds left, mirroring the server timer: consumed time is
 * accumulated across pause/resume cycles and the clock only runs while the
 * timer is active. The server value always wins when it is available.
 */
export function computeAttemptSecondsLeft(
  data: StartAttemptData | ResumeAttemptData
): number {
  if ('timeRemaining' in data && typeof data.timeRemaining === 'number') {
    return Math.max(0, data.timeRemaining);
  }

  const meta = data.mockTestData;
  const session = getCurrentSession(meta);

  if (session) {
    const durationSec = session.durationInMinutes * 60;
    const consumed = session.timeConsumed ?? 0;
    const isRunning = session.status === 'IN_PROGRESS';
    const elapsed = isRunning ? secondsSince(session.startedAt) : 0;
    return Math.max(0, durationSec - consumed - elapsed);
  }

  const durationSec = meta.durationInMinutes * 60;
  const consumed = 'timeConsumed' in data ? (data.timeConsumed ?? 0) : 0;
  return Math.max(0, durationSec - consumed - secondsSince(meta.startedAt));
}

function secondsSince(iso?: string): number {
  if (!iso) return 0;
  const startMs = new Date(iso).getTime();
  if (Number.isNaN(startMs)) return 0;
  return Math.max(0, Math.floor((Date.now() - startMs) / 1000));
}
