'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, LayoutDashboard, LineChart, Sparkles, Target } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { dismissTargetExamPrompt } from '@/lib/api/users';
import { apiErrorMessage } from '@/lib/api/errors';
import { useTargetExams } from '@/lib/hooks/useTargetExams';

interface TargetExamPromptModalProps {
  examId: string;
  examName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BENEFITS = [
  { icon: LayoutDashboard, text: 'Pinned to the top of your dashboard' },
  { icon: Sparkles, text: 'New mocks and sprints for this exam come first' },
  { icon: LineChart, text: 'Progress tracked against the exam you care about' },
];

export default function TargetExamPromptModal({
  examId,
  examName,
  open,
  onOpenChange,
}: TargetExamPromptModalProps) {
  const { add } = useTargetExams();
  const [phase, setPhase] = useState<'ask' | 'done'>('ask');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const settled = useRef(false);
  const closeTimer = useRef(0);

  useEffect(() => {
    if (open) {
      setPhase('ask');
      setSaving(false);
      setError(null);
      settled.current = false;
    }
    return () => {
      window.clearTimeout(closeTimer.current);
    };
  }, [open]);

  const closeWithoutDismiss = () => {
    settled.current = true;
    onOpenChange(false);
  };

  const decline = async () => {
    if (settled.current || phase === 'done') {
      onOpenChange(false);
      return;
    }
    settled.current = true;
    try {
      await dismissTargetExamPrompt(examId);
    } catch (dismissError) {
      console.error('Failed to dismiss target exam prompt', dismissError);
    }
    onOpenChange(false);
  };

  const accept = async () => {
    setSaving(true);
    setError(null);
    try {
      await add({ id: examId, name: examName });
      settled.current = true;
      setPhase('done');
      window.clearTimeout(closeTimer.current);
      closeTimer.current = window.setTimeout(() => onOpenChange(false), 1100);
    } catch (acceptError) {
      setError(apiErrorMessage(acceptError, 'Could not add this exam. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) return;
        // Esc / overlay / X close without counting toward the dismissal cap.
        // Only the explicit "Not now" button records a dismissal.
        if (phase === 'done' || settled.current) {
          closeWithoutDismiss();
          return;
        }
        closeWithoutDismiss();
      }}
    >
      <DialogContent className="w-[calc(100%-2rem)] max-w-md gap-0 overflow-hidden rounded-3xl border-0 p-0 shadow-2xl [&>button]:text-white [&>button]:hover:text-white">
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500 px-6 pb-8 pt-8 text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 15% 20%, white 1.5px, transparent 1.5px), radial-gradient(circle at 80% 70%, white 1.5px, transparent 1.5px)',
              backgroundSize: '28px 28px, 36px 36px',
            }}
          />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/40">
            {phase === 'done' ? (
              <Check className="h-7 w-7" />
            ) : (
              <Target className="h-7 w-7" />
            )}
          </div>
          <DialogTitle className="relative mt-4 text-2xl font-bold text-white">
            {phase === 'done' ? 'Added to your targets' : `Preparing for ${examName}?`}
          </DialogTitle>
          <DialogDescription className="relative mt-2 text-sm text-teal-50">
            {phase === 'done'
              ? `${examName} will be waiting at the top of your dashboard.`
              : 'Add it now and we will keep this exam in front of you. You can change this anytime.'}
          </DialogDescription>
          {phase === 'done' && <Confetti />}
        </div>

        {phase === 'ask' && (
          <div className="space-y-5 px-6 py-5">
            <ul className="space-y-3">
              {BENEFITS.map((benefit) => (
                <li key={benefit.text} className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <benefit.icon className="h-4 w-4" />
                  </span>
                  {benefit.text}
                </li>
              ))}
            </ul>
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row-reverse">
              <button
                type="button"
                onClick={accept}
                disabled={saving}
                className="flex-1 rounded-xl bg-teal-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-teal-200 hover:bg-teal-600 disabled:opacity-60"
              >
                {saving ? 'Adding…' : 'Add to my target exams'}
              </button>
              <button
                type="button"
                onClick={() => void decline()}
                disabled={saving}
                className="flex-1 rounded-xl px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-60"
              >
                Not now
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Confetti() {
  const bits = [
    { left: '8%', delay: '0ms', color: '#fde68a' },
    { left: '22%', delay: '80ms', color: '#ffffff' },
    { left: '38%', delay: '40ms', color: '#99f6e4' },
    { left: '54%', delay: '120ms', color: '#fbcfe8' },
    { left: '70%', delay: '20ms', color: '#ffffff' },
    { left: '84%', delay: '100ms', color: '#fde68a' },
  ];

  return (
    <>
      <style>{`
        @keyframes target-confetti {
          0% { transform: translateY(8px) scale(1); opacity: 1; }
          100% { transform: translateY(-72px) scale(0.6); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes target-confetti {
            0%, 100% { transform: none; opacity: 0; }
          }
        }
      `}</style>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24" aria-hidden>
        {bits.map((bit) => (
          <span
            key={bit.left}
            className="absolute bottom-2 h-2 w-2 rounded-full"
            style={{
              left: bit.left,
              backgroundColor: bit.color,
              animation: `target-confetti 900ms ease-out ${bit.delay} both`,
            }}
          />
        ))}
      </div>
    </>
  );
}
