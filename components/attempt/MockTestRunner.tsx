'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
  Check,
  Flag,
  X,
  Languages,
  LayoutGrid,
  Pause,
  Play,
  User,
  ZoomIn,
  ZoomOut,
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
import { examTestExitLabel, examTestListPath } from '@/lib/exam-test-routes';

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

/** Question text and options only. The zoom buttons stay at normal size. */
const QUESTION_ZOOM_STEPS = [0.8, 0.9, 1, 1.1, 1.25, 1.4, 1.6];
const DEFAULT_QUESTION_ZOOM_INDEX = QUESTION_ZOOM_STEPS.indexOf(1);

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
  const [questionZoomIndex, setQuestionZoomIndex] = useState(DEFAULT_QUESTION_ZOOM_INDEX);
  const questionZoom = QUESTION_ZOOM_STEPS[questionZoomIndex];
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

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const lockScroll = () => {
      const locked = desktop.matches ? 'hidden' : '';
      document.documentElement.style.overflow = locked;
      document.body.style.overflow = locked;
    };
    lockScroll();
    desktop.addEventListener('change', lockScroll);
    return () => {
      desktop.removeEventListener('change', lockScroll);
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  const isSessionWise = Boolean(mockTestData.isSessionWise);
  const treatMissingAsFullMock = !mockTestData.subject && !mockTestData.topic;
  const exitHref = mockTestData.exam?.id
    ? examTestListPath(mockTestData.exam.id, mockTestData.paperType, {
        treatMissingAsFullMock,
      })
    : '/dashboard';
  const exitLabel = examTestExitLabel(mockTestData.paperType, treatMissingAsFullMock);
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

  const saveAnswer = (questionId: string, optionId: string | null) => {
    setAnswers((prev) => {
      const next = new Map(prev);
      if (optionId === null) {
        next.delete(questionId);
      } else {
        next.set(questionId, optionId);
      }
      return next;
    });
    patchAttemptAnswer(attemptId, questionId, optionId).catch((err) => {
      console.error('Failed to save answer', err);
    });
  };

  /** Tapping the selected option again clears it. */
  const handleOptionSelect = (optionId: string) => {
    if (!currentQuestion) return;
    const questionId = currentQuestion._id;
    saveAnswer(questionId, answers.get(questionId) === optionId ? null : optionId);
  };

  const handleClearResponse = () => {
    if (!currentQuestion) return;
    if (!answers.has(currentQuestion._id)) return;
    saveAnswer(currentQuestion._id, null);
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
      setMobileSheetOpen(false);
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
      router.push(exitHref);
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

  const questionCardStyle = { zoom: questionZoom } as React.CSSProperties;

  if (!currentQuestion) {
    return null;
  }

  return (
    <MathpixBoundary>
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-50 via-white to-sky-50/30 pb-20 lg:flex lg:h-screen lg:h-[100dvh] lg:flex-col lg:overflow-hidden lg:pb-0">
      <div className="sticky top-0 z-40 shrink-0 border-b bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <div className="relative h-7 w-[4.25rem] shrink-0 overflow-hidden sm:h-8 sm:w-20">
                <Image
                  src="/ezprep-logo-1.png"
                  alt="EzPrep"
                  fill
                  className="object-contain object-center scale-[1.65] mix-blend-multiply"
                  priority
                />
              </div>
              <div className="min-w-0 border-l border-gray-200 pl-2.5">
                <h1 className="text-sm sm:text-base font-bold text-gray-900 truncate leading-tight">
                  {examTitle}
                </h1>
                <p className="text-xs text-gray-500 leading-tight">
                  Q {currentQuestionIndex + 1}/{totalQuestions} · {sessionLabel}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setQuestionZoomIndex((index) => Math.max(0, index - 1))}
                  disabled={questionZoomIndex === 0}
                  className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
                  aria-label="Zoom out question"
                >
                  <ZoomOut className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Zoom (-)</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setQuestionZoomIndex((index) =>
                      Math.min(QUESTION_ZOOM_STEPS.length - 1, index + 1)
                    )
                  }
                  disabled={questionZoomIndex === QUESTION_ZOOM_STEPS.length - 1}
                  className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
                  aria-label="Zoom in question"
                >
                  <ZoomIn className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Zoom (+)</span>
                </Button>
              </div>
              <AttemptTimer
                key={activeSession?.order ?? 'paper'}
                initialSeconds={secondsLeft}
                onTimeUp={handleTimeUp}
                isPaused={isPaused || isSubmitting}
                onTick={handleTick}
              />
              {mockTestData.exam.hasMultiLingualSupport ? (
                <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'ml')}>
                  <SelectTrigger className="w-[85px] sm:w-[120px] border-2 hover:border-sky-500 transition-colors text-xs sm:text-sm h-8 sm:h-9">
                    <Languages className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ml">മലയാളം</SelectItem>
                  </SelectContent>
                </Select>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {isSessionWise && activeSession && (
        <div className="shrink-0 border-b bg-white">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2">
            <span className="inline-flex items-center rounded-md bg-sky-600 px-3 py-1.5 text-sm font-semibold uppercase text-white shadow-sm">
              {activeSession.name || `Section ${(activeSession.order ?? 0) + 1}`}
            </span>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 py-4 sm:py-6 lg:min-h-0 lg:flex-1 lg:overflow-hidden lg:py-3">
        <div className="grid gap-4 sm:gap-6 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_300px] lg:grid-rows-[minmax(0,1fr)] lg:gap-4">
          <div className="space-y-4 sm:space-y-6 lg:grid lg:h-full lg:min-h-0 lg:grid-rows-[minmax(0,1fr)_auto] lg:gap-2.5 lg:space-y-0">
            <Card className="min-w-0 overflow-x-hidden border-0 p-4 shadow-lg sm:p-6 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:p-5">
              <div className="space-y-4 sm:space-y-6 lg:space-y-4">
                <div className="pb-3 sm:pb-4 border-b border-gray-100 lg:pb-3">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 lg:text-base">
                    Question No {currentQuestionIndex + 1}
                  </h2>
                </div>

                <div
                  className="min-w-0 space-y-4 break-words [overflow-wrap:anywhere] sm:space-y-6 lg:space-y-4"
                  style={questionCardStyle}
                >
                <div className="prose max-w-none text-sm sm:text-base text-gray-800 leading-relaxed lg:text-[15px]">
                  <MathText text={currentQuestion.questionText[language].text} />
                  {currentQuestion.questionText[language].imageUrl && (
                    <img
                      src={currentQuestion.questionText[language].imageUrl!}
                      alt="Question"
                      className="mt-3 sm:mt-4 max-w-full h-auto rounded-lg"
                    />
                  )}
                </div>

                <div className="grid auto-rows-fr gap-2.5 lg:gap-2">
                  {currentQuestion.options.map((option) => {
                    const isSelected = currentAnswerId === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleOptionSelect(option.id)}
                        className={`flex w-full items-center text-left px-3 py-2.5 sm:px-4 lg:py-2 rounded-lg border-2 transition-all active:scale-[0.98] ${
                          isSelected
                            ? 'border-sky-600 bg-sky-50 shadow-md'
                            : 'border-gray-200 hover:border-sky-300 hover:bg-gray-50 active:bg-gray-100'
                        }`}
                      >
                        <div className="flex w-full min-w-0 items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'border-sky-600 bg-sky-600' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          {option.type === 'text' ? (
                            <MathText
                              text={option[language]}
                              inline
                              className="min-w-0 flex-1 text-sm sm:text-base text-gray-800 leading-relaxed lg:text-[15px] [&_#preview]:!block [&_#preview]:!p-0"
                            />
                          ) : (
                            <img
                              src={option.imageUrl || undefined}
                              alt={`Option`}
                              className="min-w-0 max-w-full h-auto rounded"
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                </div>
              </div>
            </Card>

            <div className="space-y-3 lg:space-y-0">
              <div className="flex gap-2 sm:gap-3 lg:hidden">
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

              <div className="hidden items-center gap-2.5 border-t border-gray-200 pt-2.5 lg:flex">
                <Button
                  onClick={goPrevious}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                  className="h-12 px-4 text-[15px]"
                >
                  <ChevronLeft className="mr-1.5 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  onClick={handleMarkForReview}
                  variant="outline"
                  className="h-12 border-purple-200 px-4 text-[15px] hover:bg-purple-50"
                >
                  <Flag className="mr-1.5 h-4 w-4" />
                  Mark for Review & Next
                </Button>
                <Button
                  onClick={handleClearResponse}
                  variant="outline"
                  className="h-12 px-4 text-[15px]"
                >
                  <X className="mr-1.5 h-4 w-4" />
                  Clear Response
                </Button>

                {currentQuestionIndex === totalQuestions - 1 ? (
                  <Button
                    onClick={() => setShowSubmitDialog(true)}
                    disabled={isPaused}
                    className="ml-auto h-12 min-w-[170px] bg-sky-600 px-7 text-[15px] font-semibold hover:bg-sky-700"
                  >
                    {submitLabel}
                  </Button>
                ) : (
                  <Button
                    onClick={goNext}
                    className="ml-auto h-12 min-w-[170px] bg-sky-600 px-7 text-[15px] font-semibold hover:bg-sky-700"
                  >
                    Save & Next
                    <ChevronRight className="ml-1.5 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="hidden lg:block lg:h-full lg:min-h-0">
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
        <AlertDialogContent className="max-h-[90dvh] w-[calc(100%-1.5rem)] max-w-lg overflow-y-auto p-4 sm:max-w-2xl sm:p-6">
          {isSessionWise ? (
            <>
              <AlertDialogHeader className="min-w-0 space-y-3 text-center sm:text-center">
                <AlertDialogTitle className="text-center text-lg sm:text-xl">
                  Exam Summary
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="min-w-0 space-y-4 pt-1 text-left">
                    <p className="truncate text-center text-sm font-semibold text-gray-900">
                      {sectionSummary.sectionName}
                    </p>
                    <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                      {(
                        [
                          ['Questions', sectionSummary.total],
                          ['Answered', sectionSummary.answered],
                          ['Not answered', sectionSummary.notAnswered],
                          ['Marked', sectionSummary.marked],
                          ['Not visited', sectionSummary.notVisited],
                        ] as const
                      ).map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-lg border border-gray-200 bg-sky-50/70 px-2.5 py-2 text-center"
                        >
                          <dt className="text-[11px] font-medium leading-tight text-gray-500">
                            {label}
                          </dt>
                          <dd className="mt-0.5 text-base font-semibold text-gray-900">{value}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="text-center text-sm leading-relaxed text-gray-700">
                      Are you sure you want to submit
                      {lastSession ? ' the test?' : ' this section?'}
                    </p>
                    {!lastSession && (
                      <p className="text-center text-xs leading-relaxed text-amber-700">
                        You cannot return to this section after moving ahead.
                      </p>
                    )}
                    {submitError && (
                      <p className="text-center text-sm text-red-600">{submitError}</p>
                    )}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2 sm:justify-center">
                <AlertDialogCancel disabled={isSubmitting} className="w-full sm:w-auto">
                  Back
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleConfirmSubmit();
                  }}
                  disabled={isSubmitting}
                  className="w-full bg-sky-600 hover:bg-sky-700 sm:w-auto"
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
                      <p className="text-sky-600 font-medium">Answered: {answeredCount}</p>
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
                  className="bg-sky-600 hover:bg-sky-700"
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
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full border-4 border-sky-100 border-t-sky-500 animate-spin" />
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
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" />
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
                  <p className="mt-0.5 font-bold text-sky-700 tabular-nums">
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
                className="w-full bg-sky-600 hover:bg-sky-700 h-11"
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
                {isExitPausing ? 'Saving & Exiting...' : exitLabel}
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
              className="h-12 w-12 p-0 border-2 border-sky-200 text-sky-600 hover:bg-sky-50"
            >
              <LayoutGrid className="w-5 h-5" />
            </Button>

            {currentQuestionIndex === totalQuestions - 1 ? (
              <Button
                onClick={() => setShowSubmitDialog(true)}
                disabled={isPaused}
                className="flex-1 bg-sky-600 hover:bg-sky-700 text-sm h-12 font-semibold"
              >
                {submitLabel}
              </Button>
            ) : (
              <Button
                onClick={goNext}
                className="flex-1 bg-sky-600 hover:bg-sky-700 text-sm h-12 font-semibold"
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
    if (isCurrent) return 'ring-2 ring-sky-600 ring-offset-2 bg-sky-600 text-white';
    switch (status) {
      case 'answered':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'not-answered':
        return 'bg-red-600 text-white hover:bg-red-700';
      case 'marked':
        return 'bg-purple-500 text-white hover:bg-purple-600';
      case 'marked-answered':
        return 'bg-purple-600 text-white hover:bg-purple-700';
      default:
        return 'bg-gray-300 text-gray-700 hover:bg-gray-400';
    }
  };

  const content = (
    <div className="flex flex-col h-full">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto lg:space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-gray-200 lg:gap-3 lg:pb-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center lg:h-11 lg:w-11">
            <User className="w-8 h-8 text-gray-600 lg:h-5 lg:w-5" />
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
              <div className="relative w-7 h-7 rounded-md bg-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {count('marked-answered')}
                <Check className="absolute -bottom-0.5 -right-1 h-3 w-3 rounded-full bg-green-500 p-0.5 text-white" strokeWidth={3} />
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
                  className={`relative h-10 rounded-md font-bold text-sm transition-all shadow-sm lg:h-9 lg:text-[13px] ${statusClass(
                    status,
                    isCurrent
                  )}`}
                >
                  {index + 1}
                  {status === 'marked-answered' && !isCurrent && (
                    <Check className="absolute -bottom-0.5 -right-1 h-3.5 w-3.5 rounded-full bg-green-500 p-0.5 text-white" strokeWidth={3} />
                  )}
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
          className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:pointer-events-none"
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100 p-4 shadow-lg">
      {content}
    </div>
  );
}
