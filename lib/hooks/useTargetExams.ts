'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import {
  addTargetExam,
  getMyProfile,
  MAX_TARGET_EXAMS,
  removeTargetExam,
  setTargetExams,
  targetExamsFromProfile,
  type ApiTargetExam,
} from '@/lib/api/users';

export interface UseTargetExams {
  targets: ApiTargetExam[];
  loading: boolean;
  isAuthenticated: boolean;
  isFull: boolean;
  isTargeted: (examId: string) => boolean;
  add: (exam: ApiTargetExam) => Promise<void>;
  remove: (examId: string) => Promise<void>;
  replace: (next: ApiTargetExam[]) => Promise<void>;
}

export function useTargetExams(): UseTargetExams {
  const [targets, setTargets] = useState<ApiTargetExam[]>([]);
  const targetsRef = useRef<ApiTargetExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const commit = useCallback((next: ApiTargetExam[]) => {
    targetsRef.current = next;
    setTargets(next);
  }, []);

  useEffect(() => {
    if (!getAuthToken()) {
      setAuthenticated(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setAuthenticated(true);
    getMyProfile()
      .then((profile) => {
        if (!cancelled) commit(targetExamsFromProfile(profile));
      })
      .catch((error) => {
        console.error('Failed to load target exams', error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [commit]);

  const add = useCallback(async (exam: ApiTargetExam) => {
    if (!getAuthToken()) return;

    const previous = targetsRef.current;
    if (previous.some((item) => item.id === exam.id)) return;
    if (previous.length >= MAX_TARGET_EXAMS) {
      throw new Error(`You can target at most ${MAX_TARGET_EXAMS} exams`);
    }

    commit([...previous, exam]);
    try {
      const updated = await addTargetExam(exam.id);
      commit(targetExamsFromProfile(updated));
    } catch (error) {
      commit(previous);
      throw error;
    }
  }, [commit]);

  const remove = useCallback(async (examId: string) => {
    if (!getAuthToken()) return;

    const previous = targetsRef.current;
    commit(previous.filter((item) => item.id !== examId));
    try {
      const updated = await removeTargetExam(examId);
      commit(targetExamsFromProfile(updated));
    } catch (error) {
      commit(previous);
      throw error;
    }
  }, [commit]);

  const replace = useCallback(async (next: ApiTargetExam[]) => {
    if (!getAuthToken()) return;

    const previous = targetsRef.current;
    const limited = next.slice(0, MAX_TARGET_EXAMS);
    commit(limited);
    try {
      const updated = await setTargetExams(limited.map((exam) => exam.id));
      commit(targetExamsFromProfile(updated));
    } catch (error) {
      commit(previous);
      throw error;
    }
  }, [commit]);

  return {
    targets,
    loading,
    isAuthenticated: authenticated,
    isFull: targets.length >= MAX_TARGET_EXAMS,
    isTargeted: (examId: string) => targets.some((exam) => exam.id === examId),
    add,
    remove,
    replace,
  };
}
