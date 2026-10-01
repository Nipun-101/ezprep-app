'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { AlertCircle, RefreshCw, PlayCircle } from 'lucide-react';
import {
  getMockTestAttempt,
  type AttemptDetails,
  type AttemptMockTestData,
  type AttemptQuestion,
  type SubmitAttemptResult,
  type SubmittedQuestionResult,
} from '@/lib/api/attempts';
import MockTestResults from './MockTestResults';

interface AttemptResultClientProps {
  attemptId: string;
}

interface AdaptedResults {
  mockTestData: AttemptMockTestData;
  questions: AttemptQuestion[];
  result: SubmitAttemptResult;
}

function wallClockSeconds(startedAt: string, submittedAt: string): number {
  const startMs = new Date(startedAt).getTime();
  const submittedMs = new Date(submittedAt).getTime();
  if (!Number.isFinite(startMs) || !Number.isFinite(submittedMs)) return 0;
  return Math.max(0, Math.floor((submittedMs - startMs) / 1000));
}

function adaptAttemptDetailsToResults(details: AttemptDetails): AdaptedResults {
  const { test, questions = [], score, submittedAt, correctAnswers, incorrectAnswers, unansweredQuestions, isPassed, attemptId } = details;

  const mockTestData: AttemptMockTestData = {
    title: test.title,
    durationInMinutes: test.durationInMinutes,
    totalQuestions: test.totalQuestions,
    startedAt: test.startedAt,
    marksPerQuestion: test.marksPerQuestion,
    negativeMarking: test.negativeMarking,
    passingScore: test.passingScore,
    exam: test.exam,
    paperType: test.paperType,
    subject: test.subject,
    topic: test.topic,
    isSessionWise: details.isSessionWise ?? test.isSessionWise,
    sessions: details.sessions ?? test.sessions,
    currentSessionIndex: details.currentSessionIndex ?? test.currentSessionIndex,
  };

  const adaptedQuestions: AttemptQuestion[] = questions.map((q) => ({
    _id: q._id,
    questionText: q.questionText,
    optionType: q.optionType,
    options: q.options,
    subject: q.subject,
    topic: q.topic,
    sessionOrder: q.sessionOrder,
    selectedOption: q.selectedOption ?? null,
  }));

  const questionResults: SubmittedQuestionResult[] = questions.map((q) => ({
    questionId: q._id,
    selectedOption: q.selectedOption ?? null,
    correctAnswer: q.correctAnswer,
    isCorrect: q.isCorrect,
    marksAwarded: q.marksAwarded,
    explanation: q.explanation
      ? {
          en: q.explanation.en ?? null,
          ml: q.explanation.ml ?? null,
          imageUrl: q.explanation.imageUrl ?? null,
        }
      : undefined,
  }));

  // The server reports the time actually spent on the paper (all sections,
  // pauses excluded). Only fall back to the wall clock if it is missing.
  const timeTaken = details.timeTaken ?? wallClockSeconds(test.startedAt, submittedAt);

  const totalScore =
    details.totalScore && details.totalScore > 0
      ? details.totalScore
      : test.totalQuestions * test.marksPerQuestion;

  const result: SubmitAttemptResult = {
    attemptId,
    score,
    totalScore,
    passingScore: test.passingScore,
    passed: isPassed,
    correctAnswers: correctAnswers ?? 0,
    incorrectAnswers: incorrectAnswers ?? 0,
    unansweredQuestions: unansweredQuestions ?? 0,
    submittedAt,
    timeTaken,
    questionResults,
  };

  return { mockTestData, questions: adaptedQuestions, result };
}

export default function AttemptResultClient({ attemptId }: AttemptResultClientProps) {
  const router = useRouter();
  const [details, setDetails] = useState<AttemptDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getMockTestAttempt(attemptId)
      .then((data) => {
        if (!isMounted) return;
        setDetails(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load attempt details', err);
        const message =
          (axios.isAxiosError(err) &&
            (err.response?.data as { message?: string } | undefined)?.message) ||
          'Unable to load this attempt. Please try again.';
        setError(message);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Result unavailable</h1>
        <p className="text-gray-600 mb-6 max-w-md">{error || 'Something went wrong.'}</p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors shadow-md shadow-teal-200"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (details.status !== 'SUBMITTED' && details.status !== 'EXPIRED') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
          <PlayCircle className="w-6 h-6 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Attempt still in progress</h1>
        <p className="text-gray-600 mb-6 max-w-md">
          This attempt hasn&apos;t been submitted yet. Resume the test to continue or submit it before viewing results.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => router.push(`/dashboard/attempt/${attemptId}`)}
            className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors shadow-md shadow-teal-200"
          >
            Resume Attempt
          </button>
        </div>
      </div>
    );
  }

  const { mockTestData, questions, result } = adaptAttemptDetailsToResults(details);

  return (
    <MockTestResults
      result={result}
      mockTestData={mockTestData}
      questions={questions}
    />
  );
}
