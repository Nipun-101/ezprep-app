'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, LifeBuoy, Mail, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { submitFeedback, SubmitFeedbackPayload } from '@/lib/api/feedback';

const SUPPORT_EMAIL = 'support@ezprep.in';
const TEXT_MAX = 1000;

const RATINGS = [
  { key: 'userInterface', label: 'User interface' },
  { key: 'questions', label: 'Questions' },
  { key: 'fullMockTests', label: 'Full mock tests' },
  { key: 'topicWisePractice', label: 'Topic-wise practice' },
  { key: 'easeOfUse', label: 'Ease of use' },
] as const;

type RatingKey = (typeof RATINGS)[number]['key'];

const EMPTY_RATINGS: Record<RatingKey, number> = {
  userInterface: 0,
  questions: 0,
  fullMockTests: 0,
  topicWisePractice: 0,
  easeOfUse: 0,
};

const rowClass = 'flex items-center gap-2';

export default function SupportSection() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<'form' | 'thanks'>('form');
  const [text, setText] = useState('');
  const [ratings, setRatings] = useState(EMPTY_RATINGS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setPhase('form');
      setText('');
      setRatings({ ...EMPTY_RATINGS });
      setError(null);
      document.body.removeAttribute('data-support-feedback-open');
      return;
    }
    document.body.setAttribute('data-support-feedback-open', '');

    return () => {
      document.body.removeAttribute('data-support-feedback-open');
    };
  }, [open]);

  useEffect(() => {
    if (phase !== 'thanks') return;
    const timer = window.setTimeout(() => setOpen(false), 1600);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const setRating = (key: RatingKey, value: number) => {
    setRatings((current) => ({
      ...current,
      [key]: current[key] === value ? 0 : value,
    }));
  };

  const trimmed = text.trim();
  const rated = (Object.entries(ratings) as [RatingKey, number][]).filter(
    ([, value]) => value > 0,
  );
  const canSend = trimmed.length > 0 || rated.length > 0;

  const submit = async () => {
    if (!canSend || saving) return;
    setSaving(true);
    setError(null);
    const payload: SubmitFeedbackPayload = {};
    for (const [key, value] of rated) {
      payload[key] = value;
    }
    if (trimmed) payload.text = trimmed;
    try {
      await submitFeedback(payload);
      setPhase('thanks');
    } catch (submitError) {
      const message =
        axios.isAxiosError(submitError) &&
        typeof (submitError.response?.data as { message?: unknown } | undefined)?.message ===
          'string'
          ? (submitError.response?.data as { message: string }).message
          : 'Could not send your feedback. Please try again.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="px-4 pb-2">
        <div className="rounded-xl bg-gray-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Support</p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className={`mt-2 ${rowClass} text-sm font-medium text-teal-700 hover:text-teal-800`}
          >
            <Mail className="h-4 w-4 shrink-0" />
            {SUPPORT_EMAIL}
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={`mt-2 ${rowClass} w-full rounded-lg py-1.5 text-left text-sm text-gray-600 hover:text-gray-900`}
          >
            <LifeBuoy className="h-4 w-4 shrink-0 text-gray-400" />
            Share feedback
          </button>
        </div>
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (saving) return;
          setOpen(next);
        }}
      >
        <DialogContent className="z-[70] w-[calc(100%-2rem)] max-w-md gap-0 overflow-hidden rounded-2xl p-0">
          {phase === 'thanks' ? (
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                <Check className="h-7 w-7" />
              </div>
              <DialogTitle className="mt-4 text-xl font-semibold text-gray-900">
                Thank you
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-gray-500">
                We value your feedbacks
              </DialogDescription>
            </div>
          ) : (
            <>
              <div className="border-b border-gray-100 px-6 py-5 pr-12">
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Share feedback
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-gray-500">
                  We value your feedbacks
                </DialogDescription>
              </div>
              <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
                {error && (
                  <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                  </p>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">How would you rate</p>
                  <div className="mt-2 space-y-1">
                    {RATINGS.map((item) => (
                      <div key={item.key} className="flex items-center justify-between gap-3">
                        <span className="text-sm text-gray-700">{item.label}</span>
                        <StarRow
                          label={item.label}
                          value={ratings[item.key]}
                          onChange={(value) => setRating(item.key, value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="support-feedback"
                    className="text-sm font-medium text-gray-900"
                  >
                    What should we improve
                  </label>
                  <textarea
                    id="support-feedback"
                    value={text}
                    maxLength={TEXT_MAX}
                    rows={4}
                    onChange={(event) => setText(event.target.value.slice(0, TEXT_MAX))}
                    placeholder="Feedback and improvements"
                    className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-transparent focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="mt-1 text-right text-xs text-gray-400">
                    {text.length}/{TEXT_MAX}
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-100 px-6 py-4">
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSend || saving}
                  className="w-full rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-200 hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-teal-200 disabled:shadow-none"
                >
                  {saving ? 'Sending…' : 'Send feedback'}
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function StarRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center" role="group" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
            aria-pressed={filled}
            onClick={() => onChange(star)}
            className="rounded-md p-1"
          >
            <Star
              className={
                filled
                  ? 'h-5 w-5 fill-yellow-400 text-yellow-400'
                  : 'h-5 w-5 fill-transparent text-gray-300'
              }
            />
          </button>
        );
      })}
    </div>
  );
}
