'use client';

import { useState, useEffect } from 'react';
import { Test, UserAnswer, QuestionStatus } from '@/lib/testTypes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Timer from './Timer';
import QuestionPalette from './QuestionPalette';
import { ChevronLeft, ChevronRight, Flag, X, Languages } from 'lucide-react';
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

interface TestInterfaceProps {
  test: Test;
  onSubmit: (answers: UserAnswer[], language: 'en' | 'ml') => void;
  initialLanguage?: 'en' | 'ml';
}

export default function TestInterface({ test, onSubmit, initialLanguage = 'en' }: TestInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, UserAnswer>>(new Map());
  const [questionStatuses, setQuestionStatuses] = useState<QuestionStatus[]>(
    Array(test.totalQuestions).fill('not-visited')
  );
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ml'>(initialLanguage);
  const [isPaused, setIsPaused] = useState(false);

  const currentQuestion = test.questions[currentQuestionIndex];

  useEffect(() => {
    if (questionStatuses[currentQuestionIndex] === 'not-visited') {
      const newStatuses = [...questionStatuses];
      newStatuses[currentQuestionIndex] = 'not-answered';
      setQuestionStatuses(newStatuses);
    }
  }, [currentQuestionIndex, questionStatuses]);

  const handleOptionSelect = (optionId: string) => {
    const questionId = currentQuestion._id;
    const existingAnswer = answers.get(questionId);

    const newAnswer: UserAnswer = {
      questionId,
      selectedOptionId: optionId,
      isMarkedForReview: existingAnswer?.isMarkedForReview || false,
      timeSpent: 0,
    };

    const newAnswers = new Map(answers);
    newAnswers.set(questionId, newAnswer);
    setAnswers(newAnswers);

    const newStatuses = [...questionStatuses];
    newStatuses[currentQuestionIndex] = newAnswer.isMarkedForReview ? 'marked-answered' : 'answered';
    setQuestionStatuses(newStatuses);
  };

  const handleClearResponse = () => {
    const questionId = currentQuestion._id;
    const existingAnswer = answers.get(questionId);

    if (existingAnswer) {
      const newAnswers = new Map(answers);
      newAnswers.delete(questionId);
      setAnswers(newAnswers);
    }

    const newStatuses = [...questionStatuses];
    newStatuses[currentQuestionIndex] = 'not-answered';
    setQuestionStatuses(newStatuses);
  };

  const handleMarkForReview = () => {
    const questionId = currentQuestion._id;
    const existingAnswer = answers.get(questionId);

    const newAnswer: UserAnswer = {
      questionId,
      selectedOptionId: existingAnswer?.selectedOptionId || null,
      isMarkedForReview: true,
      timeSpent: 0,
    };

    const newAnswers = new Map(answers);
    newAnswers.set(questionId, newAnswer);
    setAnswers(newAnswers);

    const newStatuses = [...questionStatuses];
    newStatuses[currentQuestionIndex] = existingAnswer?.selectedOptionId ? 'marked-answered' : 'marked';
    setQuestionStatuses(newStatuses);

    handleNext();
  };

  const handleNext = () => {
    if (currentQuestionIndex < test.totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = () => {
    const answersArray = Array.from(answers.values());
    onSubmit(answersArray, language);
  };

  const handleTimeUp = () => {
    const answersArray = Array.from(answers.values());
    onSubmit(answersArray, language);
  };

  const handleLanguageChange = (value: 'en' | 'ml') => {
    setLanguage(value);
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const currentAnswer = answers.get(currentQuestion._id);
  const answeredCount = questionStatuses.filter((s) => s === 'answered' || s === 'marked-answered').length;
  const unansweredCount = questionStatuses.filter((s) => s === 'not-answered' || s === 'marked').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 pb-20 lg:pb-6">
      <div className="border-b bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-gray-900 truncate leading-tight">{test.title}</h1>
              <p className="text-xs text-gray-500 leading-tight">
                Q {currentQuestionIndex + 1}/{test.totalQuestions}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Timer durationInMinutes={test.durationInMinutes} onTimeUp={handleTimeUp} isPaused={isPaused} />
              <Select value={language} onValueChange={handleLanguageChange}>
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
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">Question No {currentQuestionIndex + 1}</h2>
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

                <div className="prose max-w-none">
                  <p className="text-sm sm:text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {currentQuestion.questionText[language].text}
                  </p>
                  {currentQuestion.questionText[language].image && (
                    <img
                      src={currentQuestion.questionText[language].image!}
                      alt="Question"
                      className="mt-3 sm:mt-4 max-w-full h-auto rounded-lg"
                    />
                  )}
                </div>

                <div className="space-y-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected = currentAnswer?.selectedOptionId === option.id;

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
                            {isSelected && <div className="w-3 h-3 sm:w-2.5 sm:h-2.5 rounded-full bg-white" />}
                          </div>
                          {option.type === 'text' ? (
                            <span className="text-sm sm:text-base text-gray-800 leading-relaxed">{option[language]}</span>
                          ) : (
                            <img
                              src={option.image}
                              alt={`Option ${option.id}`}
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

              <div className="flex gap-2 sm:gap-3">
                <Button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                  className="flex-1 sm:flex-none text-xs sm:text-sm h-11 sm:h-10 min-w-[100px]"
                >
                  <ChevronLeft className="w-4 h-4 mr-1 sm:mr-2" />
                  Previous
                </Button>

                {currentQuestionIndex === test.totalQuestions - 1 ? (
                  <Button
                    onClick={() => setShowSubmitDialog(true)}
                    className="flex-1 sm:flex-none bg-teal-600 hover:bg-teal-700 text-xs sm:text-sm h-11 sm:h-10 font-semibold"
                  >
                    Submit Test
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
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
            <QuestionPalette
              totalQuestions={test.totalQuestions}
              currentQuestion={currentQuestionIndex}
              questionStatuses={questionStatuses}
              onQuestionSelect={handleQuestionSelect}
              isPaused={isPaused}
              onTogglePause={togglePause}
              testTitle={test.title}
            />
          </div>
        </div>
      </div>

      <QuestionPalette
        totalQuestions={test.totalQuestions}
        currentQuestion={currentQuestionIndex}
        questionStatuses={questionStatuses}
        onQuestionSelect={handleQuestionSelect}
        isPaused={isPaused}
        onTogglePause={togglePause}
        testTitle={test.title}
        isMobile
      />

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to submit the test?</p>
              <div className="mt-4 space-y-1 text-sm">
                <p className="text-green-600 font-medium">Answered: {answeredCount}</p>
                <p className="text-red-600 font-medium">Not Answered: {unansweredCount}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Again</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700">
              Submit Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg lg:hidden z-30 safe-area-inset-bottom">
        <div className="max-w-7xl mx-auto px-3 py-3">
          <div className="flex gap-2">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="flex-1 text-sm h-12 font-semibold border-2"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentQuestionIndex === test.totalQuestions - 1 ? (
              <Button
                onClick={() => setShowSubmitDialog(true)}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-sm h-12 font-semibold"
              >
                Submit Test
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-sm h-12 font-semibold"
              >
                Save & Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
