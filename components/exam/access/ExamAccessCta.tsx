'use client';

import { useEffect, useState } from 'react';
import { examHasDeniedPaper } from './exam-access-probe';
import ViewPlansDialog from './ViewPlansDialog';

interface ExamAccessCtaProps {
  examId: string;
}

export default function ExamAccessCta({ examId }: ExamAccessCtaProps) {
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
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-500 to-cyan-500 p-5 text-white shadow-md shadow-teal-200/70">
      <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/15" />
      <p className="relative text-sm leading-relaxed sm:text-base">
        You can start practicing with free tests, but{' '}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="font-semibold underline decoration-white/70 underline-offset-2 hover:decoration-white"
        >
          grab all tests here
        </button>
        .
      </p>
      <ViewPlansDialog
        open={open}
        onOpenChange={setOpen}
        target={{ kind: 'exam', examId }}
      />
    </section>
  );
}
