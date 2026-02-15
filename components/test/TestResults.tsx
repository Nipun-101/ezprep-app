'use client';

import { useState } from 'react';
import { Test, UserAnswer } from '@/lib/testTypes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Circle, Award, TrendingUp, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TestResultsProps {
  test: Test;
  answers: UserAnswer[];
  initialLanguage?: 'en' | 'ml';
}

export default function TestResults({ test, answers, initialLanguage = 'en' }: TestResultsProps) {
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'ml'>(initialLanguage);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ml' : 'en'));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-end mb-4">
          <Button
            onClick={toggleLanguage}
            variant="outline"
            size="sm"
            className="font-semibold border-2 hover:bg-teal-50 hover:border-teal-500"
          >
            {language === 'en' ? 'മലയാളം' : 'English'}
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white mb-4">
            <Award className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'en' ? 'Test Completed!' : 'ടെസ്റ്റ് പൂർത്തിയായി!'}
          </h1>
          <p className="text-gray-600">{test.title}</p>
        </div>

        <Card className="p-8 mb-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="text-6xl font-bold text-gray-900">
                {results.totalMarks}
                <span className="text-2xl text-gray-500">/{results.maxMarks}</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-64 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all"
                  style={{ width: `${results.percentage}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-600">{results.percentage.toFixed(1)}%</span>
            </div>
            <div
              className={`inline-block px-6 py-2 rounded-full text-lg font-semibold ${
                results.isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {results.isPassed ? 'PASSED' : 'FAILED'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-green-700">{results.correctAnswers}</div>
              <div className="text-sm text-green-600">Correct</div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-red-700">{results.wrongAnswers}</div>
              <div className="text-sm text-red-600">Wrong</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Circle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-700">{results.unattempted}</div>
              <div className="text-sm text-gray-600">Unattempted</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              <div>
                <div className="text-sm text-gray-600">Accuracy</div>
                <div className="font-semibold text-gray-900">
                  {results.correctAnswers + results.wrongAnswers > 0
                    ? ((results.correctAnswers / (results.correctAnswers + results.wrongAnswers)) * 100).toFixed(1)
                    : 0}
                  %
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-teal-600" />
              <div>
                <div className="text-sm text-gray-600">Duration</div>
                <div className="font-semibold text-gray-900">{test.durationInMinutes} minutes</div>
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
