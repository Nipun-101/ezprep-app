'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  X,
  Languages,
  LayoutGrid,
  Pause,
  Play,
  User,
} from 'lucide-react';
import {
  AttemptQuestion,
  AttemptMockTestData,
  ResumeAttemptData,
  patchAttemptAnswer,
  pauseAttempt,
  resumeAttempt,
  submitAttempt,
  completeSession,
  SubmitAttemptResult,
  AttemptSession,
} from '@/lib/api/attempts';
import { QuestionStatus } from '@/lib/testTypes';
import AttemptTimer from './AttemptTimer';
import MathText from './MathText';
import MathpixBoundary, { loadMathpix } from './MathpixBoundary';
import { cacheAttempt, clearCachedAttempt } from '@/lib/attempt-storage';
import {
  getCurrentSession,
  visibleAttemptQuestions,
  hydrateAnswers,
  mergeAnswers,
  isLastSession,
} from '@/lib/attempt-sessions';

interface MockTestRunnerProps {
  attemptId: string;
  mockTestData: AttemptMockTestData;
  questions: AttemptQuestion[];
  initialSecondsLeft: number;
  initialPaused?: boolean;
  onSubmitted: (
    result: SubmitAttemptResult,
    language: 'en' | 'ml',
    sessions?: AttemptSession[]
  ) => void;
}

function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m ${secs.toString().padStart(2, '0')}s`;
  }
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

export default function MockTestRunner({
  attemptId,
  mockTestData: initialMockTestData,
  questions: initialQuestions,
  initialSecondsLeft,
  initialPaused = false,
  onSubmitted,
}: MockTestRunnerProps) {
  const router = useRouter();

  const [mockTestData, setMockTestData] = useState<AttemptMockTestData>(initialMockTestData);
  const [questions, setQuestions] = useState<AttemptQuestion[]>(initialQuestions);
  const [secondsLeft, setSecondsLeft] = useState(initialSecondsLeft);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(() => hydrateAnswers(initialQuestions));
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));

  const [language, setLanguage] = useState<'en' | 'ml'>('en');
  const [isPaused, setIsPaused] = useState(initialPaused);
  const [pausedConsumedSeconds, setPausedConsumedSeconds] = useState<number | null>(null);
  const [pausedTotalConsumedSeconds, setPausedTotalConsumedSeconds] = useState<number | null>(
    null
  );
  const [isPausing, setIsPausing] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [completingLabel, setCompletingLabel] = useState('Submitting your test');

  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isExitPausing, setIsExitPausing] = useState(false);
  const [exitError, setExitError] = useState<string | null>(null);

  // Disarmed when the test is successfully submitted so guards don't fire on results navigation
  const isActiveRef = useRef(true);
  const completingRef = useRef(false);

  useEffect(() => {
    void loadMathpix();
  }, []);

  const isSessionWise = Boolean(mockTestData.isSessionWise);
  const activeSession = getCurrentSession(mockTestData);
  const visibleQuestions = useMemo(
    () => visibleAttemptQuestions(questions, mockTestData),
    [questions, mockTestData]
  );
  const totalQuestions = visibleQuestions.length;
  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const lastSession = isLastSession(mockTestData);
  const submitLabel = isSessionWise
    ? lastSession
      ? 'Submit Test'
      : 'Next Section'
    : 'Submit Test';

  const timerDurationSec =
    (activeSession?.durationInMinutes ?? mockTestData.durationInMinutes) * 60;
  const timeConsumedSec =
    pausedConsumedSeconds ?? Math.max(0, timerDurationSec - secondsLeft);
  const paperConsumedSec = isSessionWise
    ? pausedTotalConsumedSeconds ??
      (mockTestData.sessions || []).reduce((total, session, index) => {
        if (index === (mockTestData.currentSessionIndex ?? 0)) {
          return total + timeConsumedSec;
        }
        return total + (session.timeConsumed ?? 0);
      }, 0)
    : timeConsumedSec;

  useEffect(() => {
    setVisited((prev) => {
      if (prev.has(currentQuestionIndex)) return prev;
      const next = new Set(prev);
      next.add(currentQuestionIndex);
      return next;
    });
  }, [currentQuestionIndex]);

  // Hard close / refresh guard — uses keepalive fetch so the auth token can be sent
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isActiveRef.current) return;
      e.preventDefault();
      e.returnValue = '';
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
      fetch(`${apiUrl}/api/v1/mock-test-attempts/${attemptId}/pause`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        keepalive: true,
      }).catch(() => {});
      // The server clock is now frozen, so the cached payload is stale
      clearCachedAttempt(attemptId);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [attemptId]);

  // Back-button trap — push a dummy history entry so pressing back hits it first,
  // then re-arm and show the confirm dialog instead of silently navigating away
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      if (!isActiveRef.current) return;
      // Re-arm the trap
      window.history.pushState(null, '', window.location.href);
      setShowExitDialog(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const questionStatuses: QuestionStatus[] = useMemo(() => {
    return visibleQuestions.map((q, idx) => {
      const isAnswered = answers.has(q._id);
      const isMarked = markedForReview.has(q._id);
      if (isMarked && isAnswered) return 'marked-answered';
      if (isMarked) return 'marked';
      if (isAnswered) return 'answered';
      if (visited.has(idx)) return 'not-answered';
      return 'not-visited';
    });
  }, [visibleQuestions, answers, markedForReview, visited]);

  const sectionSummary = useMemo(() => {
    const answered = questionStatuses.filter(
      (s) => s === 'answered' || s === 'marked-answered'
    ).length;
    const notAnswered = questionStatuses.filter((s) => s === 'not-answered').length;
    const marked = questionStatuses.filter(
      (s) => s === 'marked' || s === 'marked-answered'
    ).length;
    const notVisited = questionStatuses.filter((s) => s === 'not-visited').length;
    return {
      sectionName: activeSession?.name || mockTestData.subject?.name || mockTestData.exam.name,
      total: totalQuestions,
      answered,
      notAnswered,
      marked,
      notVisited,
    };
  }, [questionStatuses, activeSession?.name, mockTestData, totalQuestions]);

  const handleOptionSelect = (optionId: string) => {
    if (!currentQuestion) return;
    const questionId = currentQuestion._id;
    setAnswers((prev) => {
      const next = new Map(prev);
      next.set(questionId, optionId);
      return next;
    });
    patchAttemptAnswer(attemptId, questionId, optionId).catch((err) => {
      console.error('Failed to save answer', err);
    });
  };

  const handleClearResponse = () => {
    if (!currentQuestion) return;
    setAnswers((prev) => {
      const next = new Map(prev);
      next.delete(currentQuestion._id);
      return next;
    });
  };

  const handleMarkForReview = () => {
    if (!currentQuestion) return;
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      next.add(currentQuestion._id);
      return next;
    });
    goNext();
  };

  const goNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleTick = (s: number) => {
    setSecondsLeft(s);
  };

  const handlePause = async () => {
    if (isPaused || isPausing) return;
    setIsPausing(true);
    try {
      const result = await pauseAttempt(attemptId);
      setSecondsLeft(result.timeRemaining);
      setPausedConsumedSeconds(result.timeConsumed);
      setPausedTotalConsumedSeconds(result.totalTimeConsumed ?? result.timeConsumed);
      setIsPaused(true);
      // The cached payload still holds a running clock; drop it so a reload
      // reads the paused state from the server instead.
      clearCachedAttempt(attemptId);
    } catch (err) {
      console.error('Failed to pause', err);
    } finally {
      setIsPausing(false);
    }
  };

  const applyResumePayload = (data: ResumeAttemptData) => {
    setMockTestData({
      ...data.mockTestData,
      sessions: data.mockTestData.sessions ?? data.sessions,
      currentSessionIndex:
        data.mockTestData.currentSessionIndex ?? data.currentSessionIndex,
    });
    setQuestions(data.questions);
    setSecondsLeft(data.timeRemaining);
    setAnswers((prev) => mergeAnswers(prev, data.questions));
    setCurrentQuestionIndex(0);
    setVisited(new Set([0]));
    setIsPaused(false);
    setPausedConsumedSeconds(null);
    setPausedTotalConsumedSeconds(null);
    cacheAttempt(data);
  };

  const handleResume = async () => {
    if (!isPaused || isResuming) return;
    setIsResuming(true);
    try {
      const data = await resumeAttempt(attemptId);
      applyResumePayload(data);
    } catch (err) {
      console.error('Failed to resume', err);
    } finally {
      setIsResuming(false);
    }
  };

  const handleSubmitPaper = async () => {
    if (isSubmitting || isPaused) return;
    setShowSubmitDialog(false);
    setIsSubmitting(true);
    setCompletingLabel('Submitting your test');
    setSubmitError(null);
    try {
      const answersArray = Array.from(answers.entries()).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      }));
      const result = await submitAttempt(attemptId, answersArray);
      isActiveRef.current = false;
      onSubmitted(result, language);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || 'Failed to submit. Please try again.');
      setShowSubmitDialog(true);
      setIsSubmitting(false);
    }
  };

  const handleCompleteSession = async () => {
    if (completingRef.current || isSubmitting) return;
    completingRef.current = true;
    setShowSubmitDialog(false);
    setIsSubmitting(true);
    setCompletingLabel(lastSession ? 'Submitting your test' : 'Starting next section');
    setSubmitError(null);
    try {
      if (isPaused) {
        // Sections can only be completed while running; adopt the server clock
        // that comes back with the resume so the next timer starts correct.
        applyResumePayload(await resumeAttempt(attemptId));
      }
      const result = await completeSession(attemptId);
      if (result.paperCompleted) {
        if (!result.results) {
          throw new Error('Paper completed without results');
        }
        isActiveRef.current = false;
        clearCachedAttempt(attemptId);
        onSubmitted(result.results, language, result.sessions);
        return;
      }
      if (!result.nextSession) {
        throw new Error('Next session payload missing');
      }
      applyResumePayload(result.nextSession);
      setIsSubmitting(false);
    } catch (err: any) {
      try {
        const resumed = await resumeAttempt(attemptId);
        const idx = resumed.mockTestData.currentSessionIndex ?? resumed.currentSessionIndex ?? 0;
        const session = resumed.mockTestData.sessions?.[idx] ?? resumed.sessions?.[idx];
        if (session && (session.status === 'IN_PROGRESS' || session.status === 'PAUSED')) {
          const retry = await completeSession(attemptId);
          if (retry.paperCompleted && retry.results) {
            isActiveRef.current = false;
            clearCachedAttempt(attemptId);
            onSubmitted(retry.results, language, retry.sessions);
            return;
          }
          if (retry.nextSession) {
            applyResumePayload(retry.nextSession);
            setIsSubmitting(false);
            return;
          }
        }
        applyResumePayload(resumed);
        setIsSubmitting(false);
      } catch (retryErr: any) {
        setSubmitError(
          retryErr?.response?.data?.message ||
            err?.response?.data?.message ||
            'Could not complete this section. Please try again.'
        );
        setShowSubmitDialog(true);
        setIsSubmitting(false);
      }
    } finally {
      completingRef.current = false;
    }
  };

  const handleConfirmSubmit = () => {
    if (isSessionWise) {
      handleCompleteSession();
    } else {
      handleSubmitPaper();
    }
  };

  const handlePauseAndExit = async () => {
    if (isExitPausing) return;
    setIsExitPausing(true);
    setExitError(null);
    try {
      if (!isPaused) {
        await pauseAttempt(attemptId);
      }
      isActiveRef.current = false;
      clearCachedAttempt(attemptId);
      router.push('/dashboard');
    } catch (err: any) {
      setExitError(err?.response?.data?.message || 'Could not save your progress. Please try again.');
      setIsExitPausing(false);
    }
  };

  const handleTimeUp = () => {
    if (isSubmitting || completingRef.current) return;
    if (isSessionWise) {
      handleCompleteSession();
    } else {
      handleSubmitPaper();
    }
  };

  const currentAnswerId = currentQuestion ? answers.get(currentQuestion._id) : undefined;
  const answeredCount = visibleQuestions.filter((q) => answers.has(q._id)).length;
  const unansweredCount = totalQuestions - answeredCount;

  const examTitle =
    mockTestData.title ||
    (mockTestData.topic?.name
      ? `${mockTestData.exam.name.trim()} - ${mockTestData.topic.name}`
      : mockTestData.exam.name.trim());
  const sessionLabel =
    activeSession?.name || mockTestData.subject?.name || mockTestData.exam.name;

  if (!currentQuestion) {
    return null;
  }

  return (
    <MathpixBoundary>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 pb-20 lg:pb-6">
      <div className="border-b bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-gray-900 truncate leading-tight">
                {examTitle}
              </h1>
              <p className="text-xs text-gray-500 leading-tight">
                Q {currentQuestionIndex + 1}/{totalQuestions} · {sessionLabel}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <AttemptTimer
                key={activeSession?.order ?? 'paper'}
                initialSeconds={secondsLeft}
                onTimeUp={handleTimeUp}
                isPaused={isPaused || isSubmitting}
                onTick={handleTick}
              />
              <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'ml')}>
                <SelectTrigger className="w-[85px] sm:w-[120px] border-2 hover:border-teal-500 transition-colors text-xs sm:text-sm h-8 sm:h-9">
                  <Languages className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ml">മലയാളം</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {isSessionWise && activeSession && (
        <div className="border-b bg-white">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2">
            <span className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm">
              {activeSession.name || `Section ${(activeSession.order ?? 0) + 1}`}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid lg:grid-cols-[1fr,340px] gap-4 sm:gap-6">
          <div className="space-y-4 sm:space-y-6">
            <Card className="p-4 sm:p-6 lg:p-8 shadow-lg border-0">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start justify-between gap-2 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-100">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    Question No {currentQuestionIndex + 1}
                  </h2>
                  {currentQuestion.difficultyLevel && (
                    <span
                      className={`px-3 sm:px-4 py-1 sm:py-1.5 text-xs font-semibold rounded-full shadow-sm whitespace-nowrap ${
                        currentQuestion.difficultyLevel === 'easy'
                          ? 'bg-green-500 text-white'
                          : currentQuestion.difficultyLevel === 'medium'
                          ? 'bg-amber-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {currentQuestion.difficultyLevel.charAt(0).toUpperCase() +
                        currentQuestion.difficultyLevel.slice(1)}
                    </span>
                  )}
                </div>

                <div className="prose max-w-none text-sm sm:text-base text-gray-800 leading-relaxed">
                  <MathText text={currentQuestion.questionText[language].text} />
                  {currentQuestion.questionText[language].imageUrl && (
                    <img
                      src={currentQuestion.questionText[language].imageUrl!}
                      alt="Question"
                      className="mt-3 sm:mt-4 max-w-full h-auto rounded-lg"
                    />
                  )}
                </div>

                <div className="space-y-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected = currentAnswerId === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleOptionSelect(option.id)}
                        className={`w-full text-left p-4 sm:p-4 rounded-lg border-2 transition-all active:scale-[0.98] ${
                          isSelected
                            ? 'border-teal-500 bg-teal-50 shadow-md'
                            : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50 active:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-6 h-6 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isSelected ? 'border-teal-500 bg-teal-500' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && (
                              <div className="w-3 h-3 sm:w-2.5 sm:h-2.5 rounded-full bg-white" />
                            )}
                          </div>
                          {option.type === 'text' ? (
                            <MathText
                              text={option[language]}
                              inline
                              className="text-sm sm:text-base text-gray-800 leading-relaxed"
                            />
                          ) : (
                            <img
                              src={option.imageUrl || undefined}
                              alt={`Option`}
                              className="max-w-full h-auto rounded"
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <div className="flex gap-2 sm:gap-3">
                <Button
                  onClick={handleMarkForReview}
                  variant="outline"
                  className="flex-1 border-purple-200 hover:bg-purple-50 text-xs sm:text-sm h-11 sm:h-10"
                >
                  <Flag className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Mark for Review & Next</span>
                  <span className="sm:hidden">Mark & Next</span>
                </Button>

                <Button
                  onClick={handleClearResponse}
                  variant="outline"
                  className="flex-1 border-gray-200 hover:bg-gray-50 text-xs sm:text-sm h-11 sm:h-10"
                >
                  <X className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Clear Response</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
              </div>

              <div className="hidden lg:flex gap-2 sm:gap-3">
                <Button
                  onClick={goPrevious}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                  className="flex-1 sm:flex-none text-xs sm:text-sm h-11 sm:h-10 min-w-[100px]"
                >
                  <ChevronLeft className="w-4 h-4 mr-1 sm:mr-2" />
                  Previous
                </Button>

                {currentQuestionIndex === totalQuestions - 1 ? (
                  <Button
                    onClick={() => setShowSubmitDialog(true)}
                    disabled={isPaused}
                    className="flex-1 sm:flex-none bg-teal-600 hover:bg-teal-700 text-xs sm:text-sm h-11 sm:h-10 font-semibold"
                  >
                    {submitLabel}
                  </Button>
                ) : (
                  <Button
                    onClick={goNext}
                    className="flex-1 sm:flex-none bg-teal-600 hover:bg-teal-700 text-xs sm:text-sm h-11 sm:h-10 font-semibold"
                  >
                    Save & Next
                    <ChevronRight className="w-4 h-4 ml-1 sm:ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <PaletteCard
              totalQuestions={totalQuestions}
              currentQuestion={currentQuestionIndex}
              questionStatuses={questionStatuses}
              onQuestionSelect={setCurrentQuestionIndex}
              isPaused={isPaused}
              onTogglePause={isPaused ? handleResume : handlePause}
              testTitle={examTitle}
              sectionTitle={isSessionWise ? sessionLabel : undefined}
              onSubmitClick={() => setShowSubmitDialog(true)}
              submitLabel={submitLabel}
            />
          </div>
        </div>
      </div>

      <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
        <SheetContent side="right" className="w-[80%] max-w-sm overflow-y-auto p-0">
          <div className="p-4 sm:p-6 h-full">
            <PaletteCard
              totalQuestions={totalQuestions}
              currentQuestion={currentQuestionIndex}
              questionStatuses={questionStatuses}
              onQuestionSelect={(i) => {
                setCurrentQuestionIndex(i);
                setMobileSheetOpen(false);
              }}
              isPaused={isPaused}
              onTogglePause={isPaused ? handleResume : handlePause}
              testTitle={examTitle}
              sectionTitle={isSessionWise ? sessionLabel : undefined}
              onSubmitClick={() => {
                setMobileSheetOpen(false);
                setShowSubmitDialog(true);
              }}
              submitLabel={submitLabel}
              isMobile
            />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={showSubmitDialog}
        onOpenChange={(open) => {
          if (!isSubmitting) setShowSubmitDialog(open);
        }}
      >
        <AlertDialogContent className={isSessionWise ? 'max-w-3xl' : undefined}>
          {isSessionWise ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-center text-xl">Exam Summary</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-4 pt-2">
                    <div className="overflow-x-auto rounded-md border border-gray-300">
                      <table className="w-full min-w-[560px] border-collapse text-sm text-center">
                        <thead>
                          <tr className="bg-sky-100 text-gray-800">
                            <th className="border border-gray-300 px-3 py-2 font-semibold">
                              Section Name
                            </th>
                            <th className="border border-gray-300 px-3 py-2 font-semibold">
                              No of Questions
                            </th>
                            <th className="border border-gray-300 px-3 py-2 font-semibold">
                              Answered
                            </th>
                            <th className="border border-gray-300 px-3 py-2 font-semibold">
                              Not Answered
                            </th>
                            <th className="border border-gray-300 px-3 py-2 font-semibold">
                              Marked for Review
                            </th>
                            <th className="border border-gray-300 px-3 py-2 font-semibold">
                              Not Visited
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="text-gray-800">
                            <td className="border border-gray-300 px-3 py-2 font-medium">
                              {sectionSummary.sectionName}
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              {sectionSummary.total}
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              {sectionSummary.answered}
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              {sectionSummary.notAnswered}
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              {sectionSummary.marked}
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              {sectionSummary.notVisited}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-center text-sm text-gray-700">
                      Are you sure you want to submit
                      {lastSession ? ' the test?' : ' this section?'}
                    </p>
                    {!lastSession && (
                      <p className="text-center text-xs text-amber-700">
                        You cannot return to this section after moving ahead.
                      </p>
                    )}
                    {submitError && (
                      <p className="text-center text-sm text-red-600">{submitError}</p>
                    )}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="sm:justify-center gap-3">
                <AlertDialogCancel disabled={isSubmitting}>Back</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleConfirmSubmit();
                  }}
                  disabled={isSubmitting}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {submitLabel}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Submit Test?</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-2">
                    <p>Are you sure you want to submit the test?</p>
                    <div className="mt-4 space-y-1 text-sm">
                      <p className="text-green-600 font-medium">Answered: {answeredCount}</p>
                      <p className="text-red-600 font-medium">Not Answered: {unansweredCount}</p>
                    </div>
                    {submitError && <p className="text-sm text-red-600">{submitError}</p>}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isSubmitting}>Review Again</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleConfirmSubmit();
                  }}
                  disabled={isSubmitting}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Submit Test
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showExitDialog} onOpenChange={(open) => {
        if (!isExitPausing) setShowExitDialog(open);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave the exam?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Your progress will be saved and you can resume this test later from the dashboard.</p>
                {exitError && <p className="text-sm text-red-600">{exitError}</p>}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isExitPausing}>Stay in Exam</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handlePauseAndExit();
              }}
              disabled={isExitPausing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isExitPausing ? 'Saving...' : 'Pause & Leave'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isSubmitting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <Card className="max-w-sm w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl border-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full border-4 border-teal-100 border-t-teal-500 animate-spin" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                {completingLabel}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Evaluating your answers and preparing your results. Please don&apos;t close this
                page.
              </p>
            </div>
            <div className="flex justify-center gap-1.5 pt-1">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" />
            </div>
          </Card>
        </div>
      )}

      {isPaused && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
              <Pause className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Test Paused</h2>
              <p className="text-sm text-gray-600">
                Your progress is saved. Resume whenever you&apos;re ready.
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div className="flex items-center justify-center gap-6 text-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                    Time used
                  </p>
                  <p className="mt-0.5 font-bold text-gray-900 tabular-nums">
                    {formatDuration(timeConsumedSec)}
                  </p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                    Remaining
                  </p>
                  <p className="mt-0.5 font-bold text-teal-700 tabular-nums">
                    {formatDuration(secondsLeft)}
                  </p>
                </div>
              </div>
              {isSessionWise && paperConsumedSec > timeConsumedSec && (
                <p className="mt-2 text-xs text-gray-500">
                  Paper so far: {formatDuration(paperConsumedSec)}
                  {activeSession?.name ? ` · this section: ${activeSession.name}` : ''}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleResume}
                disabled={isResuming}
                className="w-full bg-teal-600 hover:bg-teal-700 h-11"
              >
                <Play className="w-4 h-4 mr-2" />
                {isResuming ? 'Resuming...' : 'Resume Test'}
              </Button>
              <Button
                variant="outline"
                onClick={handlePauseAndExit}
                disabled={isResuming || isExitPausing}
                className="w-full h-11"
              >
                {isExitPausing ? 'Saving & Exiting...' : 'Exit to Dashboard'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg lg:hidden z-30">
        <div className="max-w-7xl mx-auto px-3 py-3">
          <div className="flex gap-2">
            <Button
              onClick={goPrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="flex-1 text-sm h-12 font-semibold border-2"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Prev
            </Button>

            <Button
              onClick={() => setMobileSheetOpen(true)}
              variant="outline"
              className="h-12 w-12 p-0 border-2 border-teal-200 text-teal-600 hover:bg-teal-50"
            >
              <LayoutGrid className="w-5 h-5" />
            </Button>

            {currentQuestionIndex === totalQuestions - 1 ? (
              <Button
                onClick={() => setShowSubmitDialog(true)}
                disabled={isPaused}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-sm h-12 font-semibold"
              >
                {submitLabel}
              </Button>
            ) : (
              <Button
                onClick={goNext}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-sm h-12 font-semibold"
              >
                Save & Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
    </MathpixBoundary>
  );
}

interface PaletteCardProps {
  totalQuestions: number;
  currentQuestion: number;
  questionStatuses: QuestionStatus[];
  onQuestionSelect: (index: number) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  testTitle: string;
  sectionTitle?: string;
  onSubmitClick: () => void;
  submitLabel?: string;
  isMobile?: boolean;
}

function PaletteCard({
  totalQuestions,
  currentQuestion,
  questionStatuses,
  onQuestionSelect,
  isPaused,
  onTogglePause,
  testTitle,
  sectionTitle,
  onSubmitClick,
  submitLabel = 'Submit Test',
  isMobile = false,
}: PaletteCardProps) {
  const count = (status: QuestionStatus) => questionStatuses.filter((s) => s === status).length;

  const statusClass = (status: QuestionStatus, isCurrent: boolean) => {
    if (isCurrent) return 'ring-2 ring-teal-500 ring-offset-2 bg-teal-500 text-white';
    switch (status) {
      case 'answered':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'not-answered':
        return 'bg-red-600 text-white hover:bg-red-700';
      case 'marked':
        return 'bg-purple-500 text-white hover:bg-purple-600';
      case 'marked-answered':
        return 'bg-blue-500 text-white hover:bg-blue-600';
      default:
        return 'bg-gray-300 text-gray-700 hover:bg-gray-400';
    }
  };

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-6 overflow-y-auto">
        <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
            <User className="w-8 h-8 text-gray-600" />
          </div>
          <div className="text-xs text-gray-500">
            <div className="font-semibold text-gray-700 truncate">{testTitle}</div>
            <div>{sectionTitle ? `${sectionTitle}` : 'Mock Test Attempt'}</div>
          </div>
        </div>

        <Button
          onClick={onTogglePause}
          variant="outline"
          className="w-full justify-start gap-2 border-2 hover:bg-gray-50"
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          {isPaused ? 'Resume Test' : 'Pause Test'}
        </Button>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-900">Legend</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-green-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {count('answered')}
              </div>
              <span className="font-medium text-gray-700">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-red-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {count('not-answered')}
              </div>
              <span className="font-medium text-gray-700">Not Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {count('marked')}
              </div>
              <span className="font-medium text-gray-700">Marked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {count('marked-answered')}
              </div>
              <span className="font-medium text-gray-700">Marked & Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gray-300 flex items-center justify-center text-gray-700 font-bold text-xs shadow-sm">
                {count('not-visited')}
              </div>
              <span className="font-medium text-gray-700">Not Visited</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs text-gray-600 font-semibold">
            {sectionTitle ? `${sectionTitle} :` : 'Question Palette:'}
          </div>
          <div className="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-2 pb-2">
            {Array.from({ length: totalQuestions }).map((_, index) => {
              const isCurrent = index === currentQuestion;
              const status = questionStatuses[index] || 'not-visited';
              return (
                <button
                  key={index}
                  onClick={() => onQuestionSelect(index)}
                  className={`h-10 rounded-md font-bold text-sm transition-all shadow-sm ${statusClass(
                    status,
                    isCurrent
                  )}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 mt-4">
        <Button
          onClick={onSubmitClick}
          disabled={isPaused}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:pointer-events-none"
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return content;
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg shadow-lg p-6 h-fit sticky top-24 border border-gray-200">
      {content}
    </div>
  );
}
