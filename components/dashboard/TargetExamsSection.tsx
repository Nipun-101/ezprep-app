'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Pencil, RefreshCw, Target, X } from 'lucide-react';
import ExamCardDashboard from '@/components/dashboard/ExamCardDashboard';
import TargetExamPicker from '@/components/target-exams/TargetExamPicker';
import { type ApiExamCategory } from '@/lib/api/exams';
import { findExamInCategories } from '@/lib/target-exams';
import { type UseTargetExams } from '@/lib/hooks/useTargetExams';

interface TargetExamsSectionProps {
  categories: ApiExamCategory[];
  targetExams: Pick<
    UseTargetExams,
    'targets' | 'loading' | 'ready' | 'loadError' | 'isAuthenticated' | 'replace' | 'refresh'
  >;
}

export default function TargetExamsSection({
  categories,
  targetExams,
}: TargetExamsSectionProps) {
  const router = useRouter();
  const { targets, loading, ready, loadError, isAuthenticated, replace, refresh } =
    targetExams;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [emptyDismissed, setEmptyDismissed] = useState(false);

  if (!isAuthenticated) return null;

  if (loading && !ready) {
    return (
      <div
        className="h-24 animate-pulse rounded-2xl bg-gradient-to-r from-teal-50 to-gray-50"
        aria-hidden
      />
    );
  }

  if (loadError && !ready) {
    return (
      <section className="rounded-2xl border border-red-100 bg-red-50/60 px-3.5 py-3 sm:px-5 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">Could not load target exams</p>
            <p className="mt-0.5 text-sm text-gray-500">{loadError}</p>
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-medium text-teal-700 ring-1 ring-teal-100 hover:bg-teal-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      </section>
    );
  }

  const cards = targets.map((target) => {
    const match = findExamInCategories(categories, target.id);
    return {
      id: target.id,
      title: match?.exam.title ?? target.name,
      imageUrl: match?.category.imageUrl,
      categoryName: match?.category.name,
    };
  });

  const picker = (
    <TargetExamPicker
      open={pickerOpen}
      onOpenChange={setPickerOpen}
      selected={targets}
      categories={categories}
      onSave={replace}
    />
  );

  if (cards.length === 0) {
    if (emptyDismissed) {
      return (
        <>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50"
            >
              <Target className="h-3.5 w-3.5" />
              Set target exams
            </button>
          </div>
          {picker}
        </>
      );
    }

    return (
      <>
        <section className="rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 to-white px-3.5 py-3 sm:px-5 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500 text-white shadow-md shadow-teal-200 sm:h-11 sm:w-11 sm:rounded-2xl">
              <Target className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug text-gray-900 sm:text-base">
                <span className="sm:hidden">Pick your target exams</span>
                <span className="hidden sm:inline">Pick your exams</span>
              </p>
              <p className="mt-0.5 hidden text-sm text-gray-500 sm:block">
                Personalize your dashboard.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="hidden shrink-0 rounded-xl bg-teal-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-teal-600 sm:inline-flex"
            >
              Choose exams
            </button>
            <button
              type="button"
              aria-label="Dismiss target exams prompt"
              onClick={() => setEmptyDismissed(true)}
              className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="mt-3 w-full rounded-xl bg-teal-500 py-2 text-sm font-medium text-white hover:bg-teal-600 sm:hidden"
          >
            Choose exams
          </button>
        </section>
        {picker}
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
      {picker}
    </section>
  );
}
