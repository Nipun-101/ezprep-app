'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Circle } from 'lucide-react';
import {
  type AttemptQuestion,
  type SubmittedQuestionResult,
} from '@/lib/api/attempts';
import MathpixBoundary, { loadMathpix } from './MathpixBoundary';
import MathText from './MathText';
import QuestionRenderGuard from './QuestionRenderGuard';

const BATCH_SIZE = 8;

interface AnswerKeyListProps {
  questions: AttemptQuestion[];
  resultsByQuestion: Map<string, SubmittedQuestionResult>;
  paperIndexById: Map<string, number>;
  sectionByQuestionId: Map<string, string>;
  showSectionHeadings: boolean;
  language: 'en' | 'ml';
}

function stemText(
  question: AttemptQuestion,
  language: 'en' | 'ml'
): string {
  return (
    question.questionText?.[language]?.text ||
    question.questionText?.en?.text ||
    question.questionText?.ml?.text ||
    ''
  );
}

function optionText(
  option: AttemptQuestion['options'][number],
  language: 'en' | 'ml'
): string {
  return option[language] || option.en || option.ml || '';
}

export default function AnswerKeyList({
  questions,
  resultsByQuestion,
  paperIndexById,
  sectionByQuestionId,
  showSectionHeadings,
  language,
}: AnswerKeyListProps) {
  useEffect(() => {
    void loadMathpix();
  }, []);

  const [renderCount, setRenderCount] = useState(() =>
    Math.min(BATCH_SIZE, questions.length)
  );

  useEffect(() => {
    setRenderCount(Math.min(BATCH_SIZE, questions.length));
  }, [questions]);

  useEffect(() => {
    if (renderCount >= questions.length) return;
    const id = window.setTimeout(() => {
      setRenderCount((count) => Math.min(count + BATCH_SIZE, questions.length));
    }, 40);
    return () => window.clearTimeout(id);
  }, [renderCount, questions.length]);

  const visible = questions.slice(0, renderCount);

  if (questions.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-6 text-center">
        Answer key questions could not be loaded. Refresh the page to try again.
      </p>
    );
  }

  return (
    <MathpixBoundary>
      <div className="space-y-6">
        {visible.map((question, visibleIndex) => {
          const qResult = resultsByQuestion.get(question._id);
          const isAttempted = !!qResult?.selectedOption;
          const isCorrect = qResult?.isCorrect ?? false;
          const paperNumber = (paperIndexById.get(question._id) ?? 0) + 1;
          const sectionName = sectionByQuestionId.get(question._id);
          const prevSectionName =
            visibleIndex > 0
              ? sectionByQuestionId.get(visible[visibleIndex - 1]._id)
              : undefined;
          const showSectionHeading =
            showSectionHeadings &&
            sectionName &&
            sectionName !== prevSectionName;

          return (
            <div key={question._id}>
              {showSectionHeading && (
                <h3 className="text-sm font-bold text-teal-800 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2 mb-4 break-words">
                  {sectionName}
                </h3>
              )}
              <QuestionRenderGuard>
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-start gap-3 sm:gap-4 mb-4">
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

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3">
                        <h3 className="font-semibold text-gray-900">
                          Question {paperNumber}
                        </h3>
                        {question.difficultyLevel && (
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                              question.difficultyLevel === 'easy'
                                ? 'bg-green-100 text-green-700'
                                : question.difficultyLevel === 'medium'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {question.difficultyLevel.charAt(0).toUpperCase() +
                              question.difficultyLevel.slice(1)}
                          </span>
                        )}
                      </div>

                      <div className="text-gray-800 mb-4 text-sm sm:text-base">
                        <MathText text={stemText(question, language)} />
                      </div>

                      <div className="space-y-2 mb-4">
                        {(question.options || []).map((option) => {
                          const isUserAnswer = qResult?.selectedOption === option.id;
                          const isCorrectAnswer = qResult?.correctAnswer === option.id;
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
                              <div className="flex items-center gap-2 min-w-0">
                                {isCorrectAnswer && (
                                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                )}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                )}
                                {option.type === 'image' && option.imageUrl ? (
                                  <img
                                    src={option.imageUrl}
                                    alt="Option"
                                    className="max-w-full h-auto rounded"
                                  />
                                ) : (
                                  <MathText
                                    text={optionText(option, language)}
                                    inline
                                    className="text-gray-800 text-sm sm:text-base"
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {qResult?.explanation &&
                        (qResult.explanation.en || qResult.explanation.ml) && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-2">
                              Explanation
                            </h4>
                            <div className="text-blue-800 text-sm">
                              <MathText
                                text={
                                  qResult.explanation[language] ||
                                  qResult.explanation.en ||
                                  qResult.explanation.ml ||
                                  ''
                                }
                              />
                            </div>
                            {qResult.explanation.imageUrl && (
                              <img
                                src={qResult.explanation.imageUrl}
                                alt="Explanation"
                                className="mt-3 max-w-full h-auto rounded"
                              />
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </QuestionRenderGuard>
            </div>
          );
        })}
        {renderCount < questions.length && (
          <p className="text-xs text-center text-gray-400 py-2">
            Loading questions {renderCount} of {questions.length}…
          </p>
        )}
      </div>
    </MathpixBoundary>
  );
}
