'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Target, X } from 'lucide-react';
import ExamCardDashboard from '@/components/dashboard/ExamCardDashboard';
import TargetExamPicker from '@/components/target-exams/TargetExamPicker';
import { type ApiExamCategory } from '@/lib/api/exams';
import { type UseTargetExams } from '@/lib/hooks/useTargetExams';

const EMPTY_DISMISS_KEY = 'ezprep.target-exams.empty-dismissed';

interface TargetExamsSectionProps {
  categories: ApiExamCategory[];
  targetExams: Pick<UseTargetExams, 'targets' | 'loading' | 'isAuthenticated' | 'replace'>;
}

export default function TargetExamsSection({
  categories,
  targetExams,
}: TargetExamsSectionProps) {
  const router = useRouter();
  const { targets, loading, isAuthenticated, replace } = targetExams;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [emptyDismissed, setEmptyDismissed] = useState(true);

  useEffect(() => {
    setEmptyDismissed(window.localStorage.getItem(EMPTY_DISMISS_KEY) === '1');
  }, []);

  if (!isAuthenticated || loading) return null;

  const cards = targets.map((target) => {
    const match = findExam(categories, target.id);
    return {
      id: target.id,
      title: match?.exam.title ?? target.name,
      imageUrl: match?.category.imageUrl,
      categoryName: match?.category.name,
    };
  });

  if (cards.length === 0) {
    if (emptyDismissed) return null;
    return (
      <>
        <section className="flex items-center gap-4 rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 to-white px-4 py-4 sm:px-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-500 text-white shadow-md shadow-teal-200">
            <Target className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900">Preparing for something?</p>
            <p className="text-sm text-gray-500">
              Pick your exams to personalize your dashboard.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="shrink-0 rounded-xl bg-teal-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-teal-600"
          >
            Choose exams
          </button>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => {
              window.localStorage.setItem(EMPTY_DISMISS_KEY, '1');
              setEmptyDismissed(true);
            }}
            className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </section>
        <TargetExamPicker
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          selected={targets}
          onSave={replace}
        />
      </>
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Your target exams</h2>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.id} className="flex flex-col items-center">
            <ExamCardDashboard
              name={card.title}
              imageUrl={card.imageUrl}
              onClick={() => router.push(`/dashboard/exam/${card.id}`)}
            />
            {card.categoryName && (
              <p className="mt-1.5 text-center text-[11px] text-gray-400">{card.categoryName}</p>
            )}
          </div>
        ))}
      </div>
      <TargetExamPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selected={targets}
        onSave={replace}
      />
    </section>
  );
}

function findExam(categories: ApiExamCategory[], examId: string) {
  for (const category of categories) {
    const exam = category.exams.find((item) => item.id === examId);
    if (exam) return { exam, category };
  }
  return null;
}

export function orderCategoriesByTargets(
  categories: ApiExamCategory[],
  targetIds: string[]
): ApiExamCategory[] {
  if (targetIds.length === 0) return categories;
  const rank = new Map(targetIds.map((id, index) => [id, index]));
  return categories
    .map((category, index) => {
      let best = Number.POSITIVE_INFINITY;
      for (const exam of category.exams) {
        const position = rank.get(exam.id);
        if (position !== undefined && position < best) best = position;
      }
      return { category, index, best };
    })
    .sort((left, right) => {
      if (left.best !== right.best) return left.best - right.best;
      return left.index - right.index;
    })
    .map((entry) => entry.category);
}
