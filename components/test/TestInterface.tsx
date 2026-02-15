'use client';

import { useState, useEffect } from 'react';
import { Test, UserAnswer, QuestionStatus } from '@/lib/testTypes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Timer from './Timer';
import QuestionPalette from './QuestionPalette';
import { ChevronLeft, ChevronRight, Flag, X } from 'lucide-react';
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

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ml' : 'en'));
  };

  const currentAnswer = answers.get(currentQuestion._id);
  const answeredCount = questionStatuses.filter((s) => s === 'answered' || s === 'marked-answered').length;
  const unansweredCount = questionStatuses.filter((s) => s === 'not-answered' || s === 'marked').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{test.title}</h1>
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {test.totalQuestions}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={toggleLanguage}
              variant="outline"
              size="sm"
              className="font-semibold border-2 hover:bg-teal-50 hover:border-teal-500"
            >
              {language === 'en' ? 'മലയാളം' : 'English'}
            </Button>
            <Timer durationInMinutes={test.durationInMinutes} onTimeUp={handleTimeUp} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr,320px] gap-6">
          <div className="space-y-6">
            <Card className="p-6 lg:p-8">
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-lg font-semibold text-gray-900">Question No {currentQuestionIndex + 1}</h2>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      currentQuestion.difficultyLevel === 'easy'
                        ? 'bg-green-100 text-green-700'
                        : currentQuestion.difficultyLevel === 'medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {currentQuestion.difficultyLevel.charAt(0).toUpperCase() +
                      currentQuestion.difficultyLevel.slice(1)}
                  </span>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {currentQuestion.questionText[language].text}
                  </p>
                  {currentQuestion.questionText[language].image && (
                    <img
                      src={currentQuestion.questionText[language].image!}
                      alt="Question"
                      className="mt-4 max-w-full h-auto rounded-lg"
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
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isSelected ? 'border-teal-500' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <div className="w-3 h-3 rounded-full bg-teal-500" />}
                          </div>
                          {option.type === 'text' ? (
                            <span className="text-gray-800">{option[language]}</span>
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

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleMarkForReview}
                variant="outline"
                className="flex-1 sm:flex-none border-purple-200 hover:bg-purple-50"
              >
                <Flag className="w-4 h-4 mr-2" />
                Mark for Review & Next
              </Button>

              <Button
                onClick={handleClearResponse}
                variant="outline"
                className="flex-1 sm:flex-none border-gray-200 hover:bg-gray-50"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Response
              </Button>

              <div className="flex gap-3 flex-1 sm:flex-none sm:ml-auto">
                <Button onClick={handlePrevious} disabled={currentQuestionIndex === 0} variant="outline">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentQuestionIndex === test.totalQuestions - 1 ? (
                  <Button onClick={() => setShowSubmitDialog(true)} className="bg-teal-600 hover:bg-teal-700">
                    Submit Test
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="bg-teal-600 hover:bg-teal-700">
                    Save & Next
                    <ChevronRight className="w-4 h-4 ml-2" />
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
            />
          </div>
        </div>
      </div>

      <QuestionPalette
        totalQuestions={test.totalQuestions}
        currentQuestion={currentQuestionIndex}
        questionStatuses={questionStatuses}
        onQuestionSelect={handleQuestionSelect}
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
    </div>
  );
}
