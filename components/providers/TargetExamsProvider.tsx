'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { getAuthToken } from '@/lib/auth';
import {
  addTargetExam,
  getMyProfile,
  MAX_TARGET_EXAMS,
  removeTargetExam,
  setTargetExams,
  targetExamsFromProfile,
  type ApiTargetExam,
  type ApiUserProfile,
} from '@/lib/api/users';

export interface UseTargetExams {
  targets: ApiTargetExam[];
  loading: boolean;
  /** True after a successful load (or confirmed empty for a signed-in user). */
  ready: boolean;
  loadError: string | null;
  isAuthenticated: boolean;
  isFull: boolean;
  isTargeted: (examId: string) => boolean;
  add: (exam: ApiTargetExam) => Promise<ApiTargetExam[]>;
  remove: (examId: string) => Promise<ApiTargetExam[]>;
  replace: (next: ApiTargetExam[]) => Promise<ApiTargetExam[]>;
  refresh: () => Promise<void>;
  /** Sync targets from another profile fetch without an extra request. */
  applyFromProfile: (profile: ApiUserProfile) => void;
}

const TargetExamsContext = createContext<UseTargetExams | null>(null);

function requireAuth(): void {
  if (!getAuthToken()) {
    throw new Error('You need to be signed in to update target exams.');
  }
}

export function TargetExamsProvider({ children }: { children: ReactNode }) {
  const [targets, setTargets] = useState<ApiTargetExam[]>([]);
  const targetsRef = useRef<ApiTargetExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const mutationChain = useRef(Promise.resolve());

  const commit = useCallback((next: ApiTargetExam[]) => {
    targetsRef.current = next;
    setTargets(next);
  }, []);

  const applyFromProfile = useCallback(
    (profile: ApiUserProfile) => {
      commit(targetExamsFromProfile(profile));
      setReady(true);
      setLoadError(null);
      setLoading(false);
      setAuthenticated(true);
    },
    [commit]
  );

  const load = useCallback(async () => {
    if (!getAuthToken()) {
      setAuthenticated(false);
      commit([]);
      setReady(false);
      setLoadError(null);
      setLoading(false);
      return;
    }

    setAuthenticated(true);
    setLoading(true);
    setLoadError(null);
    try {
      const profile = await getMyProfile();
      commit(targetExamsFromProfile(profile));
      setReady(true);
      setLoadError(null);
    } catch (error) {
      console.error('Failed to load target exams', error);
      setLoadError('Could not load your target exams. Please try again.');
      // Keep last-known-good targets/ready so a refresh failure cannot wipe the UI
      // into an empty list that would overwrite real server data on save.
    } finally {
      setLoading(false);
    }
  }, [commit]);

  useEffect(() => {
    void load();
  }, [load]);

  const enqueue = useCallback(<T,>(task: () => Promise<T>): Promise<T> => {
    const run = mutationChain.current.then(task, task);
    mutationChain.current = run.then(
      () => undefined,
      () => undefined
    );
    return run;
  }, []);

  const add = useCallback(
    (exam: ApiTargetExam) =>
      enqueue(async () => {
        requireAuth();
        if (!ready) {
          throw new Error('Target exams are still loading. Please try again.');
        }

        const previous = targetsRef.current;
        if (previous.some((item) => item.id === exam.id)) return previous;
        if (previous.length >= MAX_TARGET_EXAMS) {
          throw new Error(`You can target at most ${MAX_TARGET_EXAMS} exams`);
        }

        commit([...previous, exam]);
        try {
          const updated = await addTargetExam(exam.id);
          const next = targetExamsFromProfile(updated);
          commit(next);
          return next;
        } catch (error) {
          commit(previous);
          throw error;
        }
      }),
    [commit, enqueue, ready]
  );

  const remove = useCallback(
    (examId: string) =>
      enqueue(async () => {
        requireAuth();
        if (!ready) {
          throw new Error('Target exams are still loading. Please try again.');
        }

        const previous = targetsRef.current;
        commit(previous.filter((item) => item.id !== examId));
        try {
          const updated = await removeTargetExam(examId);
          const next = targetExamsFromProfile(updated);
          commit(next);
          return next;
        } catch (error) {
          commit(previous);
          throw error;
        }
      }),
    [commit, enqueue, ready]
  );

  const replace = useCallback(
    (next: ApiTargetExam[]) =>
      enqueue(async () => {
        requireAuth();
        if (!ready) {
          throw new Error(
            loadError ??
              'Target exams are still loading. Please try again before saving.'
          );
        }

        const previous = targetsRef.current;
        const limited = next.slice(0, MAX_TARGET_EXAMS);
        commit(limited);
        try {
          const updated = await setTargetExams(limited.map((exam) => exam.id));
          const resolved = targetExamsFromProfile(updated);
          commit(resolved);
          return resolved;
        } catch (error) {
          commit(previous);
          throw error;
        }
      }),
    [commit, enqueue, loadError, ready]
  );

  const value = useMemo<UseTargetExams>(
    () => ({
      targets,
      loading,
      ready,
      loadError,
      isAuthenticated: authenticated,
      isFull: targets.length >= MAX_TARGET_EXAMS,
      isTargeted: (examId: string) => targets.some((exam) => exam.id === examId),
      add,
      remove,
      replace,
      refresh: load,
      applyFromProfile,
    }),
    [
      targets,
      loading,
      ready,
      loadError,
      authenticated,
      add,
      remove,
      replace,
      load,
      applyFromProfile,
    ]
  );

  return (
    <TargetExamsContext.Provider value={value}>{children}</TargetExamsContext.Provider>
  );
}

export function useTargetExams(): UseTargetExams {
  const ctx = useContext(TargetExamsContext);
  if (!ctx) {
    throw new Error('useTargetExams must be used within TargetExamsProvider');
  }
  return ctx;
}
