'use client';

import { useState } from 'react';
import { Test, UserAnswer } from '@/lib/testTypes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, Circle, TrendingUp, Clock, Languages } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ScoreRing from '@/components/attempt/ScoreRing';

interface TestResultsProps {
  test: Test;
  answers: UserAnswer[];
  initialLanguage?: 'en' | 'ml';
}

export default function TestResults({ test, answers, initialLanguage = 'en' }: TestResultsProps) {
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'ml'>(initialLanguage);

  const handleLanguageChange = (value: 'en' | 'ml') => {
    setLanguage(value);
  };

  const calculateResults = () => {
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unattempted = test.totalQuestions;

    const answersMap = new Map(answers.map((a) => [a.questionId, a]));

    test.questions.forEach((question) => {
      const answer = answersMap.get(question._id);

      if (answer?.selectedOptionId) {
        unattempted--;
        if (answer.selectedOptionId === question.correctAnswer) {
          correctAnswers++;
        } else {
          wrongAnswers++;
        }
      }
    });

    const totalMarks = correctAnswers * test.marksPerQuestion - wrongAnswers * test.negativeMarking;
    const maxMarks = test.totalQuestions * test.marksPerQuestion;
    const percentage = (totalMarks / maxMarks) * 100;
    const isPassed = totalMarks >= test.passingScore;

    return {
      correctAnswers,
      wrongAnswers,
      unattempted,
      totalMarks,
      maxMarks,
      percentage,
      isPassed,
    };
  };

  const results = calculateResults();
  const answersMap = new Map(answers.map((a) => [a.questionId, a]));

  const accuracy =
    results.correctAnswers + results.wrongAnswers > 0
      ? ((results.correctAnswers / (results.correctAnswers + results.wrongAnswers)) * 100).toFixed(1)
      : '0';

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        <div className="flex justify-end mb-3">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[100px] sm:w-[130px] border hover:border-teal-500 transition-colors text-xs sm:text-sm h-8">
              <Languages className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ml">മലയാളം</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <ScoreRing earned={results.totalMarks} max={results.maxMarks} />

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  {language === 'en' ? 'Test Completed' : 'ടെസ്റ്റ് പൂർത്തിയായി'}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    results.isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {results.isPassed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">{test.title}</p>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 bg-green-50 rounded-lg px-2.5 py-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-base sm:text-lg font-bold text-green-700 leading-tight">{results.correctAnswers}</div>
                    <div className="text-[10px] sm:text-xs text-green-600">Correct</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-red-50 rounded-lg px-2.5 py-2">
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-base sm:text-lg font-bold text-red-700 leading-tight">{results.wrongAnswers}</div>
                    <div className="text-[10px] sm:text-xs text-red-600">Wrong</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2.5 py-2">
                  <Circle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-base sm:text-lg font-bold text-gray-700 leading-tight">{results.unattempted}</div>
                    <div className="text-[10px] sm:text-xs text-gray-500">Skipped</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 text-xs sm:text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                  {accuracy}% accuracy
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  {test.durationInMinutes} min
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Detailed Solutions</h2>
          <div className="space-y-6">
            {test.questions.map((question, index) => {
              const userAnswer = answersMap.get(question._id);
              const isCorrect = userAnswer?.selectedOptionId === question.correctAnswer;
              const isAttempted = !!userAnswer?.selectedOptionId;

              return (
                <div key={question._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        !isAttempted
                          ? 'bg-gray-200'
                          : isCorrect
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {!isAttempted ? (
                        <Circle className="w-5 h-5" />
                      ) : isCorrect ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="font-semibold text-gray-900">Question {index + 1}</h3>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            question.difficultyLevel === 'easy'
                              ? 'bg-green-100 text-green-700'
                              : question.difficultyLevel === 'medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {question.difficultyLevel.charAt(0).toUpperCase() + question.difficultyLevel.slice(1)}
                        </span>
                      </div>

                      <p className="text-gray-800 mb-4 whitespace-pre-wrap">{question.questionText[language].text}</p>

                      <div className="space-y-2 mb-4">
                        {question.options.map((option) => {
                          const isUserAnswer = userAnswer?.selectedOptionId === option.id;
                          const isCorrectAnswer = option.id === question.correctAnswer;

                          return (
                            <div
                              key={option.id}
                              className={`p-3 rounded-lg border ${
                                isCorrectAnswer
                                  ? 'bg-green-50 border-green-300'
                                  : isUserAnswer
                                  ? 'bg-red-50 border-red-300'
                                  : 'bg-white border-gray-200'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                )}
                                <span className="text-gray-800">{option[language]}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {question.explanation[language] && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-900 mb-2">Explanation</h4>
                          <p className="text-blue-800 text-sm whitespace-pre-wrap">{question.explanation[language]}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={() => router.push('/dashboard')} variant="outline" size="lg">
            Back to Dashboard
          </Button>
          {test.allowRetake && (
            <Button onClick={() => window.location.reload()} className="bg-teal-600 hover:bg-teal-700" size="lg">
              Retake Test
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
