'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, Loader2, Search, Star, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { getExamsByCategory, type ApiExamCategory } from '@/lib/api/exams';
import { MAX_TARGET_EXAMS, type ApiTargetExam } from '@/lib/api/users';

interface TargetExamPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: ApiTargetExam[];
  onSave: (next: ApiTargetExam[]) => Promise<void> | void;
}

function sameOrder(left: ApiTargetExam[], right: ApiTargetExam[]): boolean {
  if (left.length !== right.length) return false;
  return left.every((exam, index) => exam.id === right[index]?.id);
}

export default function TargetExamPicker({
  open,
  onOpenChange,
  selected,
  onSave,
}: TargetExamPickerProps) {
  const [draft, setDraft] = useState<ApiTargetExam[]>(selected);
  const [categories, setCategories] = useState<ApiExamCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(selected);
    setSearch('');
    setSaveError(null);
  }, [open, selected]);

  useEffect(() => {
    if (!open || categories.length > 0) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    getExamsByCategory()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError('Could not load exams. Please try again.');
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setFetched(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, categories.length]);

  const query = search.trim().toLowerCase();
  const groups = useMemo(
    () =>
      categories
        .map((category) => ({
          ...category,
          exams: category.exams.filter(
            (exam) =>
              !query ||
              exam.title.toLowerCase().includes(query) ||
              category.name.toLowerCase().includes(query)
          ),
        }))
        .filter((category) => category.exams.length > 0),
    [categories, query]
  );

  const selectedIds = new Set(draft.map((exam) => exam.id));
  const full = draft.length >= MAX_TARGET_EXAMS;
  const unchanged = sameOrder(draft, selected);

  const toggle = (exam: { id: string; title: string }) => {
    setDraft((current) => {
      if (current.some((item) => item.id === exam.id)) {
        return current.filter((item) => item.id !== exam.id);
      }
      if (current.length >= MAX_TARGET_EXAMS) return current;
      return [...current, { id: exam.id, name: exam.title }];
    });
  };

  const move = (index: number, direction: -1 | 1) => {
    setDraft((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const copy = [...current];
      const [item] = copy.splice(index, 1);
      copy.splice(nextIndex, 0, item);
      return copy;
    });
  };

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await onSave(draft);
      onOpenChange(false);
    } catch (error) {
      const message =
        axios.isAxiosError(error) &&
        typeof (error.response?.data as { message?: unknown } | undefined)?.message ===
          'string'
          ? (error.response?.data as { message: string }).message
          : error instanceof Error
            ? error.message
            : 'Could not save your target exams.';
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={saving ? undefined : onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-[calc(100%-2rem)] max-w-lg flex-col gap-0 overflow-hidden rounded-2xl p-0">
        <div className="border-b border-gray-100 px-6 py-5 pr-12">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Your target exams
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-gray-500">
            Pick up to {MAX_TARGET_EXAMS} exams from any category. The first one is your primary exam.
          </DialogDescription>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-teal-700">
            {draft.length}/{MAX_TARGET_EXAMS} selected
          </p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {saveError && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
              {saveError}
            </p>
          )}

          {draft.length > 0 && (
            <ul className="space-y-2">
              {draft.map((exam, index) => (
                <li
                  key={exam.id}
                  className="flex items-center gap-2 rounded-xl border border-teal-100 bg-teal-50/60 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{exam.name}</p>
                    {index === 0 && (
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">
                        Primary
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label={`Move ${exam.name} up`}
                    disabled={index === 0 || saving}
                    onClick={() => move(index, -1)}
                    className="rounded-lg p-1 text-gray-500 hover:bg-white disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${exam.name} down`}
                    disabled={index === draft.length - 1 || saving}
                    onClick={() => move(index, 1)}
                    className="rounded-lg p-1 text-gray-500 hover:bg-white disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${exam.name}`}
                    disabled={saving}
                    onClick={() =>
                      setDraft((current) => current.filter((item) => item.id !== exam.id))
                    }
                    className="rounded-lg p-1 text-gray-500 hover:bg-white disabled:opacity-30"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search exams"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-transparent focus:bg-white focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
            </div>
          )}
          {loadError && <p className="text-sm text-red-600">{loadError}</p>}

          {!loading && fetched && !loadError && groups.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-500">No exams match that search.</p>
          )}

          <div className="space-y-5">
            {groups.map((category) => (
              <section key={category.id}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {category.name}
                </h3>
                <ul className="space-y-1">
                  {category.exams.map((exam) => {
                    const checked = selectedIds.has(exam.id);
                    const disabled = !checked && full;
                    return (
                      <li key={exam.id}>
                        <label
                          className={`flex items-center gap-3 rounded-xl px-2 py-2 ${
                            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled || saving}
                            onChange={() => toggle(exam)}
                            className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="min-w-0 flex-1 truncate text-sm text-gray-800">
                            {exam.title}
                          </span>
                          {checked && indexOf(draft, exam.id) === 0 && (
                            <Star className="h-3.5 w-3.5 fill-teal-500 text-teal-500" aria-hidden />
                          )}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || unchanged}
            className="rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-teal-200 hover:bg-teal-600 disabled:bg-teal-200 disabled:shadow-none"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function indexOf(exams: ApiTargetExam[], id: string): number {
  return exams.findIndex((exam) => exam.id === id);
}
