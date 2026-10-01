'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, XCircle, Circle, TrendingUp, Clock, Languages, ArrowLeft } from 'lucide-react';
import { AttemptQuestion, AttemptMockTestData, SubmitAttemptResult, SubmittedQuestionResult } from '@/lib/api/attempts';
import { filterSessionQuestions } from '@/lib/attempt-sessions';
import { examTestListPath } from '@/lib/exam-test-routes';
import ScoreRing from './ScoreRing';

const AnswerKeyList = dynamic(() => import('./AnswerKeyList'), {
  ssr: false,
  loading: () => (
    <div className="space-y-4 animate-pulse py-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="border-b border-gray-100 pb-4">
          <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
          <div className="h-16 bg-gray-100 rounded mb-2" />
          <div className="h-10 bg-gray-50 rounded" />
        </div>
      ))}
    </div>
  ),
});

function formatScore(value: number): string {
  return parseFloat(value.toFixed(2)).toString();
}

/** Full mocks run for hours, so keep the label readable at any length */
function formatTimeTaken(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

interface SectionBreakdown {
  order: number;
  name: string;
  questions: AttemptQuestion[];
  correct: number;
  wrong: number;
  skipped: number;
  timeConsumed: number;
}

function buildSectionBreakdown(
  mockTestData: AttemptMockTestData,
  questions: AttemptQuestion[],
  resultsByQuestion: Map<string, SubmittedQuestionResult>
): SectionBreakdown[] {
  const sessions = mockTestData.sessions;
  if (!sessions?.length) return [];

  return [...sessions]
    .sort((a, b) => a.order - b.order)
    .map((session, index) => {
      const sectionQuestions = filterSessionQuestions(questions, session);
      let correct = 0;
      let wrong = 0;
      let skipped = 0;
      for (const question of sectionQuestions) {
        const qResult = resultsByQuestion.get(question._id);
        if (!qResult?.selectedOption) skipped += 1;
        else if (qResult.isCorrect) correct += 1;
        else wrong += 1;
      }
      return {
        order: session.order,
        name: session.name?.trim() || `Section ${index + 1}`,
        questions: sectionQuestions,
        correct,
        wrong,
        skipped,
        timeConsumed: session.timeConsumed ?? 0,
      };
    })
    .filter((section) => section.questions.length > 0);
}

interface MockTestResultsProps {
  result: SubmitAttemptResult;
  mockTestData: AttemptMockTestData;
  questions: AttemptQuestion[];
  initialLanguage?: 'en' | 'ml';
}

export default function MockTestResults({
  result,
  mockTestData,
  questions,
  initialLanguage = 'en',
}: MockTestResultsProps) {
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'ml'>(initialLanguage);
  const [sectionFilter, setSectionFilter] = useState<'all' | number>('all');

  const resultsByQuestion = useMemo(
    () => new Map(result.questionResults.map((r) => [r.questionId, r])),
    [result.questionResults]
  );

  const sections = useMemo(
    () => buildSectionBreakdown(mockTestData, questions, resultsByQuestion),
    [mockTestData, questions, resultsByQuestion]
  );
  const showSections = sections.length > 1;

  const paperIndexById = useMemo(() => {
    const map = new Map<string, number>();
    questions.forEach((question, index) => map.set(question._id, index));
    return map;
  }, [questions]);

  const sectionByQuestionId = useMemo(() => {
    const map = new Map<string, string>();
    for (const section of sections) {
      for (const question of section.questions) {
        map.set(question._id, section.name);
      }
    }
    return map;
  }, [sections]);

  const visibleQuestions = useMemo(() => {
    if (!showSections || sectionFilter === 'all') return questions;
    return sections.find((section) => section.order === sectionFilter)?.questions ?? questions;
  }, [showSections, sectionFilter, questions, sections]);

  const totalAttempted = result.correctAnswers + result.incorrectAnswers;
  const accuracy = totalAttempted > 0 ? ((result.correctAnswers / totalAttempted) * 100).toFixed(1) : '0';

  const timeTakenLabel = formatTimeTaken(result.timeTaken);

  const examTitle =
    mockTestData.title ||
    (mockTestData.topic?.name
      ? `${mockTestData.exam.name.trim()} - ${mockTestData.topic.name}`
      : mockTestData.exam.name.trim());

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/exam/${mockTestData.exam.id}`)}
            className="h-9 text-xs sm:text-sm border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            {language === 'en' ? 'Back to Exam' : 'പരീക്ഷയിലേക്ക്'}
          </Button>
          {mockTestData.exam.hasMultiLingualSupport ? (
            <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'ml')}>
              <SelectTrigger className="w-[100px] sm:w-[130px] border hover:border-teal-500 transition-colors text-xs sm:text-sm h-8">
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

        <Card className="p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <ScoreRing
              earned={result.score}
              max={result.totalScore}
              formatValue={formatScore}
            />

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  {language === 'en' ? 'Test Completed' : 'ടെസ്റ്റ് പൂർത്തിയായി'}
                </h1>
                {result.passingScore !== null && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {result.passed ? 'PASSED' : 'FAILED'}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-3 truncate">{examTitle}</p>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 bg-green-50 rounded-lg px-2.5 py-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-base sm:text-lg font-bold text-green-700 leading-tight">
                      {result.correctAnswers}
                    </div>
                    <div className="text-[10px] sm:text-xs text-green-600">Correct</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-red-50 rounded-lg px-2.5 py-2">
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-base sm:text-lg font-bold text-red-700 leading-tight">
                      {result.incorrectAnswers}
                    </div>
                    <div className="text-[10px] sm:text-xs text-red-600">Wrong</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2.5 py-2">
                  <Circle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-base sm:text-lg font-bold text-gray-700 leading-tight">
                      {result.unansweredQuestions}
                    </div>
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
                  {timeTakenLabel}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {showSections && (
          <Card className="p-4 sm:p-5 mb-4 sm:mb-6 border border-gray-200 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Section-wise score</h2>

            <div className="space-y-2 sm:hidden">
              {sections.map((section) => (
                <button
                  key={section.order}
                  type="button"
                  onClick={() => setSectionFilter(section.order)}
                  className="w-full text-left rounded-xl border border-gray-100 bg-gray-50/80 p-3 active:bg-gray-100"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-900 leading-snug break-words">
                      {section.name}
                    </p>
                    {section.timeConsumed > 0 && (
                      <span className="shrink-0 text-[11px] text-gray-400 tabular-nums pt-0.5">
                        {formatTimeTaken(section.timeConsumed)}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    <div className="rounded-lg bg-green-50 px-2 py-1.5 text-center">
                      <p className="text-sm font-bold text-green-700">{section.correct}</p>
                      <p className="text-[10px] text-green-600">Correct</p>
                    </div>
                    <div className="rounded-lg bg-red-50 px-2 py-1.5 text-center">
                      <p className="text-sm font-bold text-red-700">{section.wrong}</p>
                      <p className="text-[10px] text-red-600">Wrong</p>
                    </div>
                    <div className="rounded-lg bg-white px-2 py-1.5 text-center border border-gray-100">
                      <p className="text-sm font-bold text-gray-700">{section.skipped}</p>
                      <p className="text-[10px] text-gray-500">Skipped</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                    <th className="text-left font-semibold py-2 pr-3">Section</th>
                    <th className="text-right font-semibold py-2 px-2 text-green-600 whitespace-nowrap">
                      Correct
                    </th>
                    <th className="text-right font-semibold py-2 px-2 text-red-600 whitespace-nowrap">
                      Wrong
                    </th>
                    <th className="text-right font-semibold py-2 px-2 text-gray-500 whitespace-nowrap">
                      Skipped
                    </th>
                    <th className="text-right font-semibold py-2 pl-2 whitespace-nowrap">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((section) => (
                    <tr key={section.order} className="border-b border-gray-50 last:border-0">
                      <td className="py-2.5 pr-3 font-medium text-gray-800 leading-snug">
                        {section.name}
                      </td>
                      <td className="py-2.5 px-2 text-right font-semibold text-green-700">
                        {section.correct}
                      </td>
                      <td className="py-2.5 px-2 text-right font-semibold text-red-700">
                        {section.wrong}
                      </td>
                      <td className="py-2.5 px-2 text-right font-semibold text-gray-600">
                        {section.skipped}
                      </td>
                      <td className="py-2.5 pl-2 text-right text-gray-500 tabular-nums whitespace-nowrap">
                        {section.timeConsumed > 0 ? formatTimeTaken(section.timeConsumed) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <Card className="p-4 sm:p-6 mb-6">
          <div className="flex flex-col gap-3 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {language === 'en' ? 'Answer Key' : 'ഉത്തരക്കുറിപ്പ്'}
            </h2>
            {showSections && (
              <>
                <div className="sm:hidden">
                  <Select
                    value={sectionFilter === 'all' ? 'all' : String(sectionFilter)}
                    onValueChange={(value) =>
                      setSectionFilter(value === 'all' ? 'all' : Number(value))
                    }
                  >
                    <SelectTrigger className="w-full h-10 text-sm">
                      <SelectValue placeholder="Filter by section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All sections ({questions.length})</SelectItem>
                      {sections.map((section) => (
                        <SelectItem key={section.order} value={String(section.order)}>
                          {section.name} ({section.questions.length})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="hidden sm:flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSectionFilter('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      sectionFilter === 'all'
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-700'
                    }`}
                  >
                    All ({questions.length})
                  </button>
                  {sections.map((section) => (
                    <button
                      key={section.order}
                      type="button"
                      onClick={() => setSectionFilter(section.order)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        sectionFilter === section.order
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-700'
                      }`}
                    >
                      {section.name} ({section.questions.length})
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <AnswerKeyList
            questions={visibleQuestions}
            resultsByQuestion={resultsByQuestion}
            paperIndexById={paperIndexById}
            sectionByQuestionId={sectionByQuestionId}
            showSectionHeadings={showSections && sectionFilter === 'all'}
            language={language}
          />
        </Card>

        <div className="flex flex-wrap gap-4 justify-center pb-8">
          <Button onClick={() => router.push('/dashboard')} variant="outline" size="lg">
            Back to Dashboard
          </Button>
          <Button
            onClick={() =>
              router.push(
                mockTestData.paperType === 'SPRINT'
                  ? examTestListPath(mockTestData.exam.id, 'SPRINT')
                  : `/dashboard/exam/${mockTestData.exam.id}`
              )
            }
            className="bg-teal-600 hover:bg-teal-700"
            size="lg"
          >
            {mockTestData.paperType === 'SPRINT' ? 'More Sprint Tests' : 'More Practice Tests'}
          </Button>
        </div>
      </div>
    </div>
  );
}
