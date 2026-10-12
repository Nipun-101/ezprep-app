'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
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
    <section className="rounded-xl border border-teal-200 bg-teal-50 p-5">
      <h2 className="text-lg font-bold text-gray-900">Some tests on this exam are locked</h2>
      <p className="mt-1 text-sm text-gray-600">
        You can still open every tab. Free tests start as usual. Locked tests show View plans.
      </p>
      <Button
        type="button"
        className="mt-4 bg-teal-600 text-white hover:bg-teal-700"
        onClick={() => setOpen(true)}
      >
        View plans
      </Button>
      <ViewPlansDialog
        open={open}
        onOpenChange={setOpen}
        target={{ kind: 'exam', examId }}
      />
    </section>
  );
}
