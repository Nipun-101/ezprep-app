'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { format, isToday } from 'date-fns';
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Newspaper,
  RefreshCw,
} from 'lucide-react';
import CurrentAffairsSwipeStack from './CurrentAffairsSwipeStack';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  listCurrentAffairs,
  type CurrentAffairItem,
} from '@/lib/api/current-affairs';
import {
  markCurrentAffairsSeen,
  parseDateKey,
  toDateKey,
} from '@/lib/current-affairs-seen';
import { cn } from '@/lib/utils';

export default function CurrentAffairsView() {
  const todayKey = useMemo(() => toDateKey(), []);
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [items, setItems] = useState<CurrentAffairItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const selectedDate = useMemo(
    () => parseDateKey(selectedDateKey),
    [selectedDateKey]
  );

  const loadAffairs = useCallback(async (dateKey: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await listCurrentAffairs({ date: dateKey, limit: 100 });
      setItems(data);
    } catch (err) {
      console.error('Failed to load current affairs', err);
      setError('Could not load current affairs. Please try again.');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAffairs(selectedDateKey);
  }, [loadAffairs, selectedDateKey]);

  useEffect(() => {
    if (selectedDateKey === todayKey) {
      markCurrentAffairsSeen(todayKey);
    }
  }, [selectedDateKey, todayKey]);

  const shiftDay = (delta: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + delta);
    const nextKey = toDateKey(next);
    if (nextKey > todayKey) return;
    setSelectedDateKey(nextKey);
  };

  const heading = isToday(selectedDate)
    ? "Today's Current Affairs"
    : format(selectedDate, 'EEEE, MMMM d, yyyy');

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-teal-100/80 bg-gradient-to-br from-white via-teal-50/40 to-emerald-50/60 p-4 shadow-sm sm:rounded-3xl sm:p-8">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-teal-200/30 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
              <Newspaper className="h-3.5 w-3.5" />
              Daily digest
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Current Affairs
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
              Swipe through today&apos;s headlines and memory tricks. Use the calendar to
              revisit previous days.
            </p>
          </div>

          <div className="grid w-full grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-2 lg:w-auto lg:grid-cols-[40px_220px_40px_auto]">
            <button
              type="button"
              onClick={() => shiftDay(-1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 active:scale-95"
              aria-label="Previous day"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-teal-200 bg-white px-2 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/50 active:scale-[0.98] sm:px-4'
                  )}
                >
                  <CalendarDays className="h-4 w-4 text-teal-600" />
                  {format(selectedDate, 'MMM d, yyyy')}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (!date) return;
                    const key = toDateKey(date);
                    if (key > todayKey) return;
                    setSelectedDateKey(key);
                    setCalendarOpen(false);
                  }}
                  disabled={(date) => toDateKey(date) > todayKey}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <button
              type="button"
              onClick={() => shiftDay(1)}
              disabled={selectedDateKey >= todayKey}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next day"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {!isToday(selectedDate) ? (
              <button
                type="button"
                onClick={() => setSelectedDateKey(todayKey)}
                className="col-span-3 rounded-xl bg-teal-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-600 active:scale-95 lg:col-span-1"
              >
                Today
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white/90 p-3 shadow-sm sm:rounded-3xl sm:p-8">
        <div className="mb-4 flex items-center justify-between gap-3 px-1 sm:mb-6 sm:px-0">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-gray-900 sm:text-lg">
              {heading}
            </h2>
            <p className="text-sm text-gray-500">
              {isLoading
                ? 'Loading cards…'
                : items.length === 0
                  ? 'No updates for this date'
                  : `${items.length} card${items.length === 1 ? '' : 's'} to review`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadAffairs(selectedDateKey)}
            disabled={isLoading}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 p-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 sm:px-3"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          </div>
        ) : error ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/40 p-8 text-center">
            <AlertCircle className="mb-3 h-8 w-8 text-red-500" />
            <p className="text-sm text-gray-700">{error}</p>
            <button
              type="button"
              onClick={() => loadAffairs(selectedDateKey)}
              className="mt-4 rounded-xl bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600"
            >
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 p-8 text-center">
            <CalendarDays className="mb-3 h-10 w-10 text-gray-300" />
            <h3 className="text-base font-semibold text-gray-800">Nothing here yet</h3>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              There are no current affairs published for{' '}
              {format(selectedDate, 'MMMM d, yyyy')}. Try another date.
            </p>
          </div>
        ) : (
          <CurrentAffairsSwipeStack
            key={selectedDateKey}
            items={items}
            onComplete={() => {
              if (selectedDateKey === todayKey) {
                markCurrentAffairsSeen(todayKey);
              }
            }}
          />
        )}
      </section>
    </div>
  );
}
