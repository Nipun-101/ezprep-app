'use client';

import { useEffect, useState } from 'react';
import { useExamPage } from '@/components/exam/ExamLayoutClient';
import { examHasDeniedPaper } from './exam-access-probe';
import ViewPlansDialog from './ViewPlansDialog';

interface ExamAccessCtaProps {
  examId: string;
}

export default function ExamAccessCta({ examId }: ExamAccessCtaProps) {
  const { exam } = useExamPage();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setVisible(false);
    examHasDeniedPaper(examId)
      .then((denied) => {
        if (!cancelled) setVisible(denied);
      })
      .catch(() => {
        if (!cancelled) setVisible(false);
      });
    return () => {
      cancelled = true;
    };
  }, [examId]);

  if (!visible) return null;

  return (
    <section className="relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-500 to-cyan-500 px-5 py-4 text-white shadow-md shadow-teal-200/70 sm:flex-row sm:items-center sm:justify-between">
      <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/15" />
      <p className="relative text-sm leading-relaxed sm:text-base">
        You can start practicing with free tests.
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="exam-access-super-btn relative inline-flex shrink-0 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-bold text-teal-700"
      >
        Click here to Buy all tests
      </button>
      <ViewPlansDialog
        open={open}
        onOpenChange={setOpen}
        target={{ kind: 'exam', examId }}
        examName={exam?.name}
      />
    </section>
  );
}
