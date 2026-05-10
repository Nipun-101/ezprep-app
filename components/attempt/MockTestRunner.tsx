'use client';

import { useEffect, useMemo, useState } from 'react';
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
  patchAttemptAnswer,
  pauseAttempt,
  resumeAttempt,
  submitAttempt,
  SubmitAttemptResult,
} from '@/lib/api/attempts';
import { QuestionStatus } from '@/lib/testTypes';
import AttemptTimer from './AttemptTimer';
import MathText from './MathText';

interface MockTestRunnerProps {
  attemptId: string;
  mockTestData: AttemptMockTestData;
  questions: AttemptQuestion[];
  initialSecondsLeft: number;
  onSubmitted: (result: SubmitAttemptResult, language: 'en' | 'ml') => void;
}

export default function MockTestRunner({
  attemptId,
  mockTestData: initialMockTestData,
  questions: initialQuestions,
  initialSecondsLeft,
  onSubmitted,
}: MockTestRunnerProps) {
  const router = useRouter();

  const [mockTestData, setMockTestData] = useState<AttemptMockTestData>(initialMockTestData);
  const [questions, setQuestions] = useState<AttemptQuestion[]>(initialQuestions);
  const [secondsLeft, setSecondsLeft] = useState(initialSecondsLeft);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));

  const [language, setLanguage] = useState<'en' | 'ml'>('en');
  const [isPaused, setIsPaused] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    setVisited((prev) => {
      if (prev.has(currentQuestionIndex)) return prev;
      const next = new Set(prev);
      next.add(currentQuestionIndex);
      return next;
    });
  }, [currentQuestionIndex]);

  const questionStatuses: QuestionStatus[] = useMemo(() => {
    return questions.map((q, idx) => {
      const isAnswered = answers.has(q._id);
      const isMarked = markedForReview.has(q._id);
      if (isMarked && isAnswered) return 'marked-answered';
      if (isMarked) return 'marked';
      if (isAnswered) return 'answered';
      if (visited.has(idx)) return 'not-answered';
      return 'not-visited';
    });
  }, [questions, answers, markedForReview, visited]);

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
      setIsPaused(true);
    } catch (err) {
      console.error('Failed to pause', err);
    } finally {
      setIsPausing(false);
    }
  };

  const handleResume = async () => {
    if (!isPaused || isResuming) return;
    setIsResuming(true);
    try {
      const data = await resumeAttempt(attemptId);
      setMockTestData(data.mockTestData);
      setQuestions(data.questions);
      setSecondsLeft(data.timeRemaining);
      const newIndex = Math.min(currentQuestionIndex, data.questions.length - 1);
      setCurrentQuestionIndex(newIndex);
      setVisited(new Set([newIndex]));
      setIsPaused(false);
    } catch (err) {
      console.error('Failed to resume', err);
    } finally {
      setIsResuming(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const answersArray = Array.from(answers.entries()).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      }));
      const result = await submitAttempt(attemptId, answersArray);
      onSubmitted(result, language);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || 'Failed to submit. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleTimeUp = () => {
    if (isSubmitting) return;
    handleSubmit();
  };

  const currentAnswerId = currentQuestion ? answers.get(currentQuestion._id) : undefined;
  const answeredCount = answers.size;
  const unansweredCount = totalQuestions - answeredCount;

  const examTitle = mockTestData.title || `${mockTestData.exam.name.trim()} - ${mockTestData.topic.name}`;

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 pb-20 lg:pb-6">
      <div className="border-b bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-gray-900 truncate leading-tight">
                {examTitle}
              </h1>
              <p className="text-xs text-gray-500 leading-tight">
                Q {currentQuestionIndex + 1}/{totalQuestions} · {mockTestData.subject.name}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <AttemptTimer
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

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid lg:grid-cols-[1fr,340px] gap-4 sm:gap-6">
          <div className="space-y-4 sm:space-y-6">
            <Card className="p-4 sm:p-6 lg:p-8 shadow-lg border-0">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start justify-between gap-2 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-100">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    Question No {currentQuestionIndex + 1}
                  </h2>
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
                    className="flex-1 sm:flex-none bg-teal-600 hover:bg-teal-700 text-xs sm:text-sm h-11 sm:h-10 font-semibold"
                  >
                    Submit Test
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
              onSubmitClick={() => setShowSubmitDialog(true)}
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
              onSubmitClick={() => {
                setMobileSheetOpen(false);
                setShowSubmitDialog(true);
              }}
              isMobile
            />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
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
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Test'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                onClick={() => router.push('/dashboard')}
                disabled={isResuming}
                className="w-full h-11"
              >
                Exit to Dashboard
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
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-sm h-12 font-semibold"
              >
                Submit Test
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
  onSubmitClick: () => void;
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
  onSubmitClick,
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
            <div>Mock Test Attempt</div>
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
          <div className="text-xs text-gray-600 font-semibold">Question Palette:</div>
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
        <Button onClick={onSubmitClick} className="w-full bg-blue-500 hover:bg-blue-600">
          Submit Test
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
